#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.deploy"
[[ -f "$ENV_FILE" ]] || { echo "ERROR: copy .env.deploy.example to .env.deploy and fill in the values"; exit 1; }
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
required=(AWS_PROFILE AWS_REGION STACK_NAME DOMAIN_NAME API_DOMAIN_NAME HOSTED_ZONE_ID CLOUDFRONT_CERTIFICATE_ARN API_CERTIFICATE_ARN)
for name in "${required[@]}"; do [[ -n "${!name:-}" && "${!name}" != REPLACE_* ]] || { echo "ERROR: $name is missing"; exit 1; }; done
command -v aws >/dev/null || { echo "ERROR: AWS CLI is required"; exit 1; }
command -v sam >/dev/null || { echo "ERROR: AWS SAM CLI is required"; exit 1; }
"$ROOT/scripts/validate.sh"
aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null
echo "PASS: AWS credentials validated"
(cd "$ROOT/infrastructure" && sam build --template-file template.yaml && sam deploy \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" \
  --resolve-s3 --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset \
  --parameter-overrides \
    DomainName="$DOMAIN_NAME" ApiDomainName="$API_DOMAIN_NAME" HostedZoneId="$HOSTED_ZONE_ID" \
    CloudFrontCertificateArn="$CLOUDFRONT_CERTIFICATE_ARN" ApiCertificateArn="$API_CERTIFICATE_ARN")
BUCKET="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`SiteBucketName`].OutputValue' --output text)"
DIST="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text)"
aws s3 sync "$ROOT/frontend/dist/" "s3://$BUCKET/" --delete --profile "$AWS_PROFILE" --region "$AWS_REGION"
aws cloudfront create-invalidation --profile "$AWS_PROFILE" --distribution-id "$DIST" --paths '/*' >/dev/null
echo "PASS: deployed https://$DOMAIN_NAME and https://$API_DOMAIN_NAME"
