#!/bin/bash
set -e

# Prompt for environment
while true; do
  read -rp "Which environment do you want to use? (qa/prod): " ENVIRONMENT
  case "$ENVIRONMENT" in
    qa|prod) break ;;
    *) echo "Invalid option. Please enter 'qa' or 'prod'." ;;
  esac
done

# Set environment-specific values
if [ "$ENVIRONMENT" = "prod" ]; then
  DIST_ID="E3GJQ1JB1DFNU4"
  HOLDING_PAGE_ORIGIN="gap-prod-holding-page.s3.eu-west-2.amazonaws.com"
else
  DIST_ID="E2YMATUXLSFFJV"
  HOLDING_PAGE_ORIGIN="gap-qa-holding-page.s3-website.eu-west-2.amazonaws.com"
fi

# Extra warning for prod
if [ "$ENVIRONMENT" = "prod" ]; then
  echo ""
  echo "WARNING: You have selected the PRODUCTION environment. This will affect live users."
  read -rp "Are you sure you want to continue? (y/n): " PROD_CONFIRM
  if [ "$PROD_CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# Confirm before proceeding
echo ""
read -rp "You are about to switch the $ENVIRONMENT environment to the holding page. Are you sure? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Aborted."
  exit 0
fi

echo "Fetching current distribution config..."
aws cloudfront get-distribution-config --id "$DIST_ID" > /tmp/dist-current.json

BACKUP_FILE="dist-backup-$(date +%Y%m%d-%H%M%S).json"
cp /tmp/dist-current.json "$BACKUP_FILE"
echo "Backup saved to $BACKUP_FILE"

ETAG=$(python3 -c "import json,sys; print(json.load(sys.stdin)['ETag'])" < /tmp/dist-current.json)
echo "ETag: $ETAG"

echo "Updating cache behaviors to point to holding page..."
python3 - <<EOF
import json

with open('/tmp/dist-current.json') as f:
    data = json.load(f)

config = data['DistributionConfig']

holding_page_origin = "$HOLDING_PAGE_ORIGIN"
holding_page_paths = {
    "/",
    "/*",
    "/grants/*",
    "/apply/applicant",
    "/apply/applicant/*",
    "/apply/admin",
    "/apply/admin/*"
}

for behavior in config['CacheBehaviors']['Items']:
    if behavior['PathPattern'] in holding_page_paths:
        print(f"  Switching {behavior['PathPattern']} -> holding page")
        behavior['TargetOriginId'] = holding_page_origin
        behavior['AllowedMethods'] = {
            "Quantity": 3,
            "Items": ["HEAD", "GET", "OPTIONS"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["HEAD", "GET"]
            }
        }

with open('/tmp/dist-updated.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Done.")
EOF

echo "Adding 404 custom error response to serve holding page index..."
python3 - <<'PYEOF'
import json

with open('/tmp/dist-updated.json') as f:
    config = json.load(f)

existing_errors = config.get('CustomErrorResponses', {}).get('Items', [])

# Remove any existing 404 entry to avoid duplicates
existing_errors = [e for e in existing_errors if e['ErrorCode'] != 404]

# Add 404 -> /index.html with 200 so S3 serves the holding page for all paths
existing_errors.append({
    "ErrorCode": 404,
    "ResponsePagePath": "/index.html",
    "ResponseCode": "200",
    "ErrorCachingMinTTL": 0
})

config['CustomErrorResponses'] = {
    "Quantity": len(existing_errors),
    "Items": existing_errors
}

with open('/tmp/dist-updated.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Done.")
PYEOF

echo "Applying updated distribution config..."
aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --distribution-config file:///tmp/dist-updated.json \
  --if-match "$ETAG"

echo "Waiting 5 seconds before creating invalidation..."
sleep 5

echo "Creating cache invalidation..."
INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "Invalidation created: $INVALIDATION"

echo ""
echo "Done. Holding page is now live for $ENVIRONMENT."
