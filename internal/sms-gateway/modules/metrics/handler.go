package metrics

import (
	"github.com/ansrivas/fiberprometheus/v2"
	"github.com/gofiber/fiber/v2"
)

type HttpHandler struct {
}

func (h *HttpHandler) Register(app *fiber.App) {
	promhandler := fiberprometheus.New("")
	promhandler.RegisterAt(app, "/metrics")

	app.Use(promhandler.Middleware)
}

func newHttpHandler() *HttpHandler {
	return &HttpHandler{}
}
