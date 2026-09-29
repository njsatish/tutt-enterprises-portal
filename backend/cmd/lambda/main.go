package main

import (
	"bytes"
	"context"
	"net/http"
	"net/url"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/njsatish/high-quality-barbershop/backend/internal/api"
)

var handler = api.New()

func handle(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	target := event.RawPath
	if event.RawQueryString != "" {
		target += "?" + event.RawQueryString
	}
	parsed, _ := url.Parse(target)
	req, _ := http.NewRequestWithContext(ctx, event.RequestContext.HTTP.Method, parsed.String(), bytes.NewBufferString(event.Body))
	for key, value := range event.Headers {
		req.Header.Set(key, value)
	}
	recorder := &responseRecorder{header: make(http.Header), status: http.StatusOK}
	handler.ServeHTTP(recorder, req)
	headers := map[string]string{}
	for key, values := range recorder.header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}
	return events.APIGatewayV2HTTPResponse{StatusCode: recorder.status, Headers: headers, Body: recorder.body.String()}, nil
}

type responseRecorder struct {
	header http.Header
	body   bytes.Buffer
	status int
}

func (r *responseRecorder) Header() http.Header         { return r.header }
func (r *responseRecorder) WriteHeader(status int)      { r.status = status }
func (r *responseRecorder) Write(p []byte) (int, error) { return r.body.Write(p) }

func main() { lambda.Start(handle) }
