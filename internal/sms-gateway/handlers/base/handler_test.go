package base_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/android-sms-gateway/server/internal/sms-gateway/handlers/base"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
	"go.uber.org/zap/zaptest"
)

type testRequestBody struct {
	Name string `json:"name" validate:"required"`
	Age  int    `json:"age" validate:"required"`
}

type testRequestBodyNoValidate struct {
	Name string `json:"name" validate:"required"`
	Age  int    `json:"age" validate:"required"`
}

func (t *testRequestBody) Validate() error {
	if t.Age < 18 {
		return fmt.Errorf("must be at least 18 years old")
	}
	return nil
}

func TestHandler_BodyParserValidator(t *testing.T) {
	logger := zaptest.NewLogger(t)
	validate := validator.New()

	handler := &base.Handler{
		Logger:    logger,
		Validator: validate,
	}

	app := fiber.New()
	app.Post("/test", func(c *fiber.Ctx) error {
		var body testRequestBody
		return handler.BodyParserValidator(c, &body)
	})
	app.Post("/test2", func(c *fiber.Ctx) error {
		var body testRequestBodyNoValidate
		return handler.BodyParserValidator(c, &body)
	})

	tests := []struct {
		description    string
		path           string
		payload        any
		expectedStatus int
	}{
		{
			description:    "Valid request body",
			path:           "/test",
			payload:        &testRequestBody{Name: "John Doe", Age: 25},
			expectedStatus: fiber.StatusOK,
		},
		{
			description:    "Invalid request body - missing name",
			path:           "/test",
			payload:        &testRequestBody{Age: 25},
			expectedStatus: fiber.StatusBadRequest,
		},
		{
			description:    "Invalid request body - age too low",
			path:           "/test",
			payload:        &testRequestBody{Name: "John Doe", Age: 17},
			expectedStatus: fiber.StatusBadRequest,
		},
		{
			description:    "Valid request body - no validation",
			path:           "/test2",
			payload:        &testRequestBodyNoValidate{Name: "John Doe", Age: 17},
			expectedStatus: fiber.StatusOK,
		},
		{
			description:    "No request body",
			path:           "/test",
			payload:        nil,
			expectedStatus: fiber.StatusBadRequest,
		},
	}

	for _, test := range tests {
		t.Run(test.description, func(t *testing.T) {
			var req *http.Request
			if test.payload != nil {
				bodyBytes, _ := json.Marshal(test.payload)
				req = httptest.NewRequest("POST", test.path, bytes.NewReader(bodyBytes))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest("POST", test.path, nil)
			}

			resp, _ := app.Test(req)
			if test.expectedStatus != resp.StatusCode {
				t.Errorf("Expected status code %d, got %d", test.expectedStatus, resp.StatusCode)
			}
		})
	}
}

func TestHandler_QueryParserValidator(t *testing.T) {
	type fields struct {
		Logger    *zap.Logger
		Validator *validator.Validate
	}
	type args struct {
		c   *fiber.Ctx
		out any
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := &base.Handler{
				Logger:    tt.fields.Logger,
				Validator: tt.fields.Validator,
			}
			if err := h.QueryParserValidator(tt.args.c, tt.args.out); (err != nil) != tt.wantErr {
				t.Errorf("Handler.QueryParserValidator() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestHandler_ParamsParserValidator(t *testing.T) {
	type fields struct {
		Logger    *zap.Logger
		Validator *validator.Validate
	}
	type args struct {
		c   *fiber.Ctx
		out any
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := &base.Handler{
				Logger:    tt.fields.Logger,
				Validator: tt.fields.Validator,
			}
			if err := h.ParamsParserValidator(tt.args.c, tt.args.out); (err != nil) != tt.wantErr {
				t.Errorf("Handler.ParamsParserValidator() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestHandler_validateStruct(t *testing.T) {
	type fields struct {
		Logger    *zap.Logger
		Validator *validator.Validate
	}
	type args struct {
		out any
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := &base.Handler{
				Logger:    tt.fields.Logger,
				Validator: tt.fields.Validator,
			}
			if err := h.ValidateStruct(tt.args.out); (err != nil) != tt.wantErr {
				t.Errorf("Handler.validateStruct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
