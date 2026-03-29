package api

import (
	"log/slog"
	"time"

	"github.com/go-resty/resty/v2"
)

// Client wraps resty with retry and configuration
type Client struct {
	*resty.Client
	logger *slog.Logger
}

// NewClient creates a new HTTP client with retry configuration
func NewClient() *Client {
	client := resty.New()

	// Configure retry logic
	client.
		SetRetryCount(3).
		SetRetryWaitTime(1 * time.Second).
		SetRetryMaxWaitTime(5 * time.Second).
		AddRetryCondition(func(r *resty.Response, err error) bool {
			// Retry on connection errors
			if err != nil {
				return true
			}
			// Retry on server errors (5xx)
			if r.StatusCode() >= 500 {
				return true
			}
			// Don't retry on client errors (4xx) except 429 (too many requests)
			if r.StatusCode() == 429 {
				return true
			}
			return false
		})

	// Set reasonable timeout
	client.SetTimeout(10 * time.Second)

	// Set hogecode-Agent
	client.SetHeader("hogecode-Agent", "getabc/1.0")

	return &Client{
		Client: client,
		logger: slog.New(slog.NewTextHandler(nil, nil)), // Dummy logger, will be set later
	}
}

// SetLogger sets the logger for request/response logging
func (c *Client) SetLogger(logger *slog.Logger) {
	c.logger = logger
	// Enable debug logging with Resty
	c.Client.SetDebug(false) // Disable Resty's default debug
	// Instead, we'll use custom hooks below

	// Add request hook to log requests
	c.Client.OnBeforeRequest(func(client *resty.Client, req *resty.Request) error {
		if logger != nil {
			// Log request without body to keep log size manageable
			logger.Debug("HTTP Request",
				slog.String("method", req.Method),
				slog.String("url", req.URL),
			)
		}
		return nil
	})

	// Add response hook to log responses
	c.Client.OnAfterResponse(func(client *resty.Client, resp *resty.Response) error {
		if logger != nil {
			// Log only status and content-type to keep log size manageable
			logger.Debug("HTTP Response",
				slog.String("method", resp.Request.Method),
				slog.String("url", resp.Request.URL),
				slog.Int("status", resp.StatusCode()),
				slog.String("content_type", resp.Header().Get("Content-Type")),
				slog.Int("body_size", len(resp.Body())),
			)
		}
		return nil
	})
}
