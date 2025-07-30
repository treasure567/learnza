package messages

import (
	"errors"
	"fmt"
	"time"

	"github.com/android-sms-gateway/client-go/smsgateway"
	"github.com/android-sms-gateway/server/internal/sms-gateway/handlers/base"
	"github.com/android-sms-gateway/server/internal/sms-gateway/handlers/middlewares/userauth"
	"github.com/android-sms-gateway/server/internal/sms-gateway/models"
	"github.com/android-sms-gateway/server/internal/sms-gateway/modules/devices"
	"github.com/android-sms-gateway/server/internal/sms-gateway/modules/messages"
	"github.com/capcom6/go-helpers/slices"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
	"go.uber.org/zap"
)

const (
	route3rdPartyGetMessage = "3rdparty.get.message"
)

type thirdPartyControllerParams struct {
	fx.In

	MessagesSvc *messages.Service
	DevicesSvc  *devices.Service

	Validator *validator.Validate
	Logger    *zap.Logger
}

type ThirdPartyController struct {
	base.Handler

	messagesSvc *messages.Service
	devicesSvc  *devices.Service
}

//	@Summary		Enqueue message
//	@Description	Enqueues a message for sending. If `deviceId` is set, the specified device is used; otherwise a random registered device is chosen.
//	@Security		ApiAuth
//	@Tags			User, Messages
//	@Accept			json
//	@Produce		json
//	@Param			skipPhoneValidation		query		bool							false	"Skip phone validation"
//	@Param			deviceActiveWithin		query		int								false	"Filter devices active within the specified number of hours"	default(0)	minimum(0)
//	@Param			request					body		smsgateway.Message				true	"Send message request"
//	@Success		202						{object}	smsgateway.GetMessageResponse	"Message enqueued"
//	@Failure		400						{object}	smsgateway.ErrorResponse		"Invalid request"
//	@Failure		401						{object}	smsgateway.ErrorResponse		"Unauthorized"
//	@Failure		409						{object}	smsgateway.ErrorResponse		"Message with such ID already exists"
//	@Failure		500						{object}	smsgateway.ErrorResponse		"Internal server error"
//	@Header			202						{string}	Location						"Get message state URL"
//	@Router			/3rdparty/v1/messages 																																																																	[post]
//
// Enqueue message
func (h *ThirdPartyController) post(user models.User, c *fiber.Ctx) error {
	var params postQueryParams
	if err := h.QueryParserValidator(c, &params); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var req smsgateway.Message
	if err := h.BodyParserValidator(c, &req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var device models.Device
	var err error
	var filters []devices.SelectFilter

	if params.DeviceActiveWithin > 0 {
		filters = append(filters, devices.ActiveWithin(time.Duration(params.DeviceActiveWithin)*time.Hour))
	}

	// Check if device_id is provided
	if req.DeviceID != "" {

		device, err = h.devicesSvc.Get(user.ID, append(filters, devices.WithID(req.DeviceID))...)
		if err != nil {
			if errors.Is(err, devices.ErrNotFound) {
				return fiber.NewError(fiber.StatusBadRequest, "No active device with such ID found")
			}
			h.Logger.Error("Failed to get device", zap.Error(err), zap.String("user_id", user.ID), zap.String("device_id", req.DeviceID))
			return fiber.NewError(fiber.StatusInternalServerError, "Can't select device. Please contact support")
		}
	} else {
		// Fallback to random selection
		devices, err := h.devicesSvc.Select(user.ID, filters...)
		if err != nil {
			h.Logger.Error("Failed to select devices", zap.Error(err), zap.String("user_id", user.ID))
			return fiber.NewError(fiber.StatusInternalServerError, "Can't select devices. Please contact support")
		}

		if len(devices) < 1 {
			return fiber.NewError(fiber.StatusBadRequest, "No active devices found")
		}

		device, err = slices.Random(devices)
		if err != nil {
			return fmt.Errorf("can't get random device: %w", err)
		}
	}

	var textContent *messages.TextMessageContent
	var dataContent *messages.DataMessageContent
	if text := req.GetTextMessage(); text != nil {
		textContent = &messages.TextMessageContent{
			Text: text.Text,
		}
	} else if data := req.GetDataMessage(); data != nil {
		dataContent = &messages.DataMessageContent{
			Data: data.Data,
			Port: data.Port,
		}
	} else {
		return fiber.NewError(fiber.StatusBadRequest, "No message content provided")
	}

	msg := messages.MessageIn{
		ID: req.ID,

		TextContent: textContent,
		DataContent: dataContent,

		PhoneNumbers: req.PhoneNumbers,
		IsEncrypted:  req.IsEncrypted,

		SimNumber:          req.SimNumber,
		WithDeliveryReport: req.WithDeliveryReport,
		TTL:                req.TTL,
		ValidUntil:         req.ValidUntil,
		Priority:           req.Priority,
	}
	state, err := h.messagesSvc.Enqueue(device, msg, messages.EnqueueOptions{SkipPhoneValidation: params.SkipPhoneValidation})
	if err != nil {
		var errValidation messages.ErrValidation
		if isBadRequest := errors.As(err, &errValidation); isBadRequest {
			return fiber.NewError(fiber.StatusBadRequest, errValidation.Error())
		}
		if isConflict := errors.Is(err, messages.ErrMessageAlreadyExists); isConflict {
			return fiber.NewError(fiber.StatusConflict, err.Error())
		}

		return fmt.Errorf("can't enqueue message: %w", err)
	}

	location, err := c.GetRouteURL(route3rdPartyGetMessage, fiber.Map{
		"id": state.ID,
	})
	if err != nil {
		h.Logger.Warn("Failed to get route URL", zap.String("route", route3rdPartyGetMessage), zap.Error(err))
	} else {
		c.Location(location)
	}

	return c.Status(fiber.StatusAccepted).
		JSON(smsgateway.GetMessageResponse{
			ID:          state.ID,
			DeviceID:    state.DeviceID,
			State:       smsgateway.ProcessingState(state.State),
			IsHashed:    state.IsHashed,
			IsEncrypted: state.IsEncrypted,
			Recipients:  state.Recipients,
			States:      state.States,
		})
}

//	@Summary		Get message state
//	@Description	Returns message state by ID
//	@Security		ApiAuth
//	@Tags			User, Messages
//	@Produce		json
//	@Param			id							path		string							true	"Message ID"
//	@Success		200							{object}	smsgateway.GetMessageResponse	"Message state"
//	@Failure		400							{object}	smsgateway.ErrorResponse		"Invalid request"
//	@Failure		401							{object}	smsgateway.ErrorResponse		"Unauthorized"
//	@Failure		500							{object}	smsgateway.ErrorResponse		"Internal server error"
//	@Router			/3rdparty/v1/messages/{id} 																																																																[get]
//
// Get message state
func (h *ThirdPartyController) get(user models.User, c *fiber.Ctx) error {
	id := c.Params("id")

	state, err := h.messagesSvc.GetState(user, id)
	if err != nil {
		if errors.Is(err, messages.ErrMessageNotFound) {
			return fiber.NewError(fiber.StatusNotFound, err.Error())
		}

		return err
	}

	return c.JSON(smsgateway.GetMessageResponse{
		ID:          state.ID,
		DeviceID:    state.DeviceID,
		State:       smsgateway.ProcessingState(state.State),
		IsHashed:    state.IsHashed,
		IsEncrypted: state.IsEncrypted,
		Recipients:  state.Recipients,
		States:      state.States,
	})
}

//	@Summary		Request inbox messages export
//	@Description	Initiates process of inbox messages export via webhooks. For each message the `sms:received` webhook will be triggered. The webhooks will be triggered without specific order.
//	@Security		ApiAuth
//	@Tags			User, Messages
//	@Accept			json
//	@Produce		json
//	@Param			request						body		smsgateway.MessagesExportRequest	true	"Export inbox request"
//	@Success		202							{object}	object								"Inbox export request accepted"
//	@Failure		400							{object}	smsgateway.ErrorResponse			"Invalid request"
//	@Failure		401							{object}	smsgateway.ErrorResponse			"Unauthorized"
//	@Failure		500							{object}	smsgateway.ErrorResponse			"Internal server error"
//	@Router			/3rdparty/v1/inbox/export 																																																																										[post]
//
// Export inbox
func (h *ThirdPartyController) postInboxExport(user models.User, c *fiber.Ctx) error {
	req := smsgateway.MessagesExportRequest{}
	if err := h.BodyParserValidator(c, &req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	device, err := h.devicesSvc.Get(user.ID, devices.WithID(req.DeviceID))
	if err != nil {
		if errors.Is(err, devices.ErrNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Invalid device ID")
		}

		return err
	}

	if err := h.messagesSvc.ExportInbox(device, req.Since, req.Until); err != nil {
		return err
	}

	return c.SendStatus(fiber.StatusAccepted)
}

func (h *ThirdPartyController) Register(router fiber.Router) {
	router.Post("", userauth.WithUser(h.post))
	router.Get(":id", userauth.WithUser(h.get))

	router.Post("inbox/export", userauth.WithUser(h.postInboxExport))
}

func NewThirdPartyController(params thirdPartyControllerParams) *ThirdPartyController {
	return &ThirdPartyController{
		Handler: base.Handler{
			Logger:    params.Logger.Named("messages"),
			Validator: params.Validator,
		},
		messagesSvc: params.MessagesSvc,
		devicesSvc:  params.DevicesSvc,
	}
}
