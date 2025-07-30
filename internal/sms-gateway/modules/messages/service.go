package messages

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/android-sms-gateway/client-go/smsgateway"
	"github.com/android-sms-gateway/server/internal/sms-gateway/models"
	"github.com/android-sms-gateway/server/internal/sms-gateway/modules/db"
	"github.com/android-sms-gateway/server/internal/sms-gateway/modules/push"
	"github.com/capcom6/go-helpers/anys"
	"github.com/capcom6/go-helpers/slices"
	"github.com/nyaruka/phonenumbers"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"go.uber.org/fx"
	"go.uber.org/zap"
	"golang.org/x/exp/maps"
)

const (
	ErrorTTLExpired = "TTL expired"
)

type ErrValidation string

func (e ErrValidation) Error() string {
	return string(e)
}

type EnqueueOptions struct {
	SkipPhoneValidation bool
}

type ServiceParams struct {
	fx.In

	IDGen db.IDGen

	Config Config

	Messages    *repository
	HashingTask *HashingTask

	PushSvc *push.Service
	Logger  *zap.Logger
}

type Service struct {
	config Config

	messages    *repository
	hashingTask *HashingTask

	pushSvc *push.Service
	logger  *zap.Logger

	messagesCounter *prometheus.CounterVec

	idgen func() string
}

func NewService(params ServiceParams) *Service {
	messagesCounter := promauto.NewCounterVec(prometheus.CounterOpts{
		Namespace: "sms",
		Subsystem: "messages",
		Name:      "total",
		Help:      "Total number of messages by state",
	}, []string{"state"})

	return &Service{
		config: params.Config,

		messages:    params.Messages,
		hashingTask: params.HashingTask,

		pushSvc: params.PushSvc,
		logger:  params.Logger.Named("Service"),

		messagesCounter: messagesCounter,

		idgen: params.IDGen,
	}
}

func (s *Service) RunBackgroundTasks(ctx context.Context, wg *sync.WaitGroup) {
	wg.Add(1)
	go func() {
		defer wg.Done()
		s.hashingTask.Run(ctx)
	}()
}

func (s *Service) SelectPending(deviceID string) ([]MessageOut, error) {
	messages, err := s.messages.SelectPending(deviceID)
	if err != nil {
		return nil, err
	}

	return slices.MapOrError(messages, messageToDomain)
}

func (s *Service) UpdateState(deviceID string, message MessageStateIn) error {
	existing, err := s.messages.Get(message.ID, MessagesSelectFilter{DeviceID: deviceID})
	if err != nil {
		return err
	}

	if message.State == ProcessingStatePending {
		message.State = ProcessingStateProcessed
	}

	existing.State = message.State
	existing.States = slices.Map(maps.Keys(message.States), func(key string) MessageState {
		return MessageState{
			MessageID: existing.ID,
			State:     ProcessingState(key),
			UpdatedAt: message.States[key],
		}
	})
	existing.Recipients = s.recipientsStateToModel(message.Recipients, existing.IsHashed)

	if err := s.messages.UpdateState(&existing); err != nil {
		return err
	}

	s.hashingTask.Enqueue(existing.ID)

	s.messagesCounter.WithLabelValues(string(existing.State)).Inc()

	return nil
}

func (s *Service) GetState(user models.User, ID string) (MessageStateOut, error) {
	message, err := s.messages.Get(
		ID,
		MessagesSelectFilter{},
		MessagesSelectOptions{WithRecipients: true, WithDevice: true, WithStates: true},
	)
	if err != nil {
		return MessageStateOut{}, ErrMessageNotFound
	}

	if message.Device.UserID != user.ID {
		return MessageStateOut{}, ErrMessageNotFound
	}

	return modelToMessageState(message), nil
}

func (s *Service) Enqueue(device models.Device, message MessageIn, opts EnqueueOptions) (MessageStateOut, error) {
	state := MessageStateOut{
		DeviceID: device.ID,
		MessageStateIn: MessageStateIn{
			State:      ProcessingStatePending,
			Recipients: make([]smsgateway.RecipientState, len(message.PhoneNumbers)),
		},
	}

	var phone string
	var err error
	for i, v := range message.PhoneNumbers {
		if message.IsEncrypted || opts.SkipPhoneValidation {
			phone = v
		} else {
			if phone, err = cleanPhoneNumber(v); err != nil {
				return state, fmt.Errorf("can't use phone in row %d: %w", i+1, err)
			}
		}

		message.PhoneNumbers[i] = phone

		state.Recipients[i] = smsgateway.RecipientState{
			PhoneNumber: phone,
			State:       smsgateway.ProcessingStatePending,
		}
	}

	validUntil := message.ValidUntil
	if message.TTL != nil && *message.TTL > 0 {
		validUntil = anys.AsPointer(time.Now().Add(time.Duration(*message.TTL) * time.Second))
	}

	msg := Message{
		ExtID:       message.ID,
		Recipients:  s.recipientsToModel(message.PhoneNumbers),
		IsEncrypted: message.IsEncrypted,

		DeviceID: device.ID,

		SimNumber:          message.SimNumber,
		WithDeliveryReport: anys.OrDefault(message.WithDeliveryReport, true),

		Priority:   int8(message.Priority),
		ValidUntil: validUntil,
	}

	if message.TextContent != nil {
		if err := msg.SetTextContent(*message.TextContent); err != nil {
			return state, fmt.Errorf("can't set text content: %w", err)
		}
	} else if message.DataContent != nil {
		if err := msg.SetDataContent(*message.DataContent); err != nil {
			return state, fmt.Errorf("can't set data content: %w", err)
		}
	} else {
		return state, errors.New("no text or data content")
	}

	if msg.ExtID == "" {
		msg.ExtID = s.idgen()
	}
	state.ID = msg.ExtID

	if err := s.messages.Insert(&msg); err != nil {
		return state, err
	}

	if device.PushToken == nil {
		return state, nil
	}

	go func(token string) {
		if err := s.pushSvc.Enqueue(token, push.NewMessageEnqueuedEvent()); err != nil {
			s.logger.Error("Can't enqueue message", zap.String("token", token), zap.Error(err))
		}
	}(*device.PushToken)

	s.messagesCounter.WithLabelValues(string(state.State)).Inc()

	return state, nil
}

func (s *Service) ExportInbox(device models.Device, since, until time.Time) error {
	if device.PushToken == nil {
		return errors.New("no push token")
	}

	event := push.NewMessagesExportRequestedEvent(since, until)

	return s.pushSvc.Enqueue(*device.PushToken, event)
}

func (s *Service) Clean(ctx context.Context) error {
	//TODO: use delete queue to optimize deletion
	n, err := s.messages.removeProcessed(ctx, time.Now().Add(-s.config.ProcessedLifetime))

	s.logger.Info("Cleaned processed messages", zap.Int64("count", n))
	return err
}

///////////////////////////////////////////////////////////////////////////////

func (s *Service) recipientsToModel(input []string) []MessageRecipient {
	output := make([]MessageRecipient, len(input))

	for i, v := range input {
		output[i] = MessageRecipient{
			PhoneNumber: v,
		}
	}

	return output
}

func (s *Service) recipientsStateToModel(input []smsgateway.RecipientState, hash bool) []MessageRecipient {
	output := make([]MessageRecipient, len(input))

	for i, v := range input {
		phoneNumber := v.PhoneNumber
		if len(phoneNumber) > 0 && phoneNumber[0] != '+' {
			// compatibility with Android app before 1.1.1
			phoneNumber = "+" + phoneNumber
		}

		if v.State == smsgateway.ProcessingStatePending {
			v.State = smsgateway.ProcessingStateProcessed
		}

		if hash {
			phoneNumber = fmt.Sprintf("%x", sha256.Sum256([]byte(phoneNumber)))[:16]
		}

		output[i] = MessageRecipient{
			PhoneNumber: phoneNumber,
			State:       ProcessingState(v.State),
			Error:       v.Error,
		}
	}

	return output
}

func modelToMessageState(input Message) MessageStateOut {
	return MessageStateOut{
		DeviceID:    input.DeviceID,
		IsHashed:    input.IsHashed,
		IsEncrypted: input.IsEncrypted,

		MessageStateIn: MessageStateIn{
			ID:         input.ExtID,
			State:      input.State,
			Recipients: slices.Map(input.Recipients, modelToRecipientState),
			States: slices.Associate(
				input.States,
				func(state MessageState) string { return string(state.State) },
				func(state MessageState) time.Time { return state.UpdatedAt },
			),
		},
	}
}

func modelToRecipientState(input MessageRecipient) smsgateway.RecipientState {
	return smsgateway.RecipientState{
		PhoneNumber: input.PhoneNumber,
		State:       smsgateway.ProcessingState(input.State),
		Error:       input.Error,
	}
}

func cleanPhoneNumber(input string) (string, error) {
	phone, err := phonenumbers.Parse(input, "RU")
	if err != nil {
		return input, ErrValidation(fmt.Sprintf("can't parse phone number: %s", err.Error()))
	}

	if !phonenumbers.IsValidNumber(phone) {
		return input, ErrValidation("invalid phone number")
	}

	phoneNumberType := phonenumbers.GetNumberType(phone)
	if phoneNumberType != phonenumbers.MOBILE && phoneNumberType != phonenumbers.FIXED_LINE_OR_MOBILE {
		return input, ErrValidation("not mobile phone number")
	}

	return phonenumbers.Format(phone, phonenumbers.E164), nil
}
