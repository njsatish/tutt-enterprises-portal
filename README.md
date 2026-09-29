# High Quality Barbershop

A learning-focused, serverless full-stack project for:

- Website: https://hqbarbershop.denduluru.com
- Frontend: React + Vite
- Backend: Go on AWS Lambda
- API: Amazon API Gateway HTTP API
- Hosting: Amazon S3 + Amazon CloudFront

## Prerequisites

- Node.js 20 or newer
- npm
- Go 1.23 or newer
- Visual Studio Code
- AWS CLI v2
- AWS SAM CLI

## Open in Visual Studio Code

```bash
cd "$HOME/Downloads/high-quality-barbershop"
code .
```

## Start locally

The local Go adapter and Vite are started together by:

```bash
./scripts/dev.sh
```

Open http://localhost:5173. Vite proxies `/api` to `http://localhost:8080`.

## Validate

```bash
./scripts/validate.sh
```

## Backend routes

- `GET /api/health`
- `GET /api/business`
- `GET /api/services`
- `GET /api/barbers`

## AWS deployment

Copy the example environment file and provide your AWS values:

```bash
cp .env.deploy.example .env.deploy
```

Then edit `.env.deploy`. The CloudFront certificate must exist in `us-east-1`. The API Gateway regional certificate must exist in the deployment region.

Deploy infrastructure and application:

```bash
./scripts/deploy-aws.sh
```

The deployment script validates the React and Go projects before making AWS changes. It does not automatically commit to Git.

## Learning path

1. Edit React components in `frontend/src`.
2. Edit Go handlers in `backend/internal/api`.
3. Run `./scripts/dev.sh`.
4. Add tests before adding AWS features.
5. Deploy only after `./scripts/validate.sh` passes.

## Demo data

Services, prices, barber names, and testimonials are placeholders until the business approves them.
