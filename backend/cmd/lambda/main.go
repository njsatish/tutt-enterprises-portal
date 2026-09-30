package main

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
	"github.com/njsatish/tutt-enterprises-portal/backend/internal/api"
)

var adapter = httpadapter.NewV2(api.New())

func handler(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return adapter.ProxyWithContext(ctx, request)
}

func main() {
	_ = http.MethodGet
	lambda.Start(handler)
}
