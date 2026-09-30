#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AWS_PROFILE="${AWS_PROFILE:-denduluru}"
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-tutt-enterprises-portal}"
cd "$ROOT"
STACK_JSON=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --profile "$AWS_PROFILE" --region "$AWS_REGION" --query 'Stacks[0]' --output json)
value(){ printf '%s' "$STACK_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next(x['OutputValue'] for x in d['Outputs'] if x['OutputKey']=='$1'))"; }
BUCKET=$(value SiteBucketName)
DIST=$(value DistributionId)
SITE=$(value WebsiteURL)
API=$(value ApiURL)
(cd frontend && npm ci && npm run lint && VITE_API_BASE_URL="${API%/}" npm run build)
(cd backend && go test ./...)
aws s3 sync frontend/dist/ "s3://$BUCKET/" --delete --exclude 'index.html' --cache-control 'public,max-age=31536000,immutable' --profile "$AWS_PROFILE" --region "$AWS_REGION"
aws s3 cp frontend/dist/index.html "s3://$BUCKET/index.html" --content-type 'text/html; charset=utf-8' --cache-control 'no-cache,no-store,must-revalidate' --profile "$AWS_PROFILE" --region "$AWS_REGION"
ID=$(aws cloudfront create-invalidation --distribution-id "$DIST" --paths '/*' --profile "$AWS_PROFILE" --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id "$DIST" --id "$ID" --profile "$AWS_PROFILE"
curl -fsS "$SITE/" | grep -qi 'Tutt Enterprises'
echo "PASS: deployed $SITE"
