.PHONY: build-ApiFunction

build-ApiFunction:
	CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -trimpath -ldflags="-s -w" -o $(ARTIFACTS_DIR)/bootstrap ./cmd/lambda
	chmod 755 $(ARTIFACTS_DIR)/bootstrap
