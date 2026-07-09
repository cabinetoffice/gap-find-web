#!/bin/bash
set -e

# --- Select target distribution ---
#   test / prod        = the primary (live) distribution for that environment - affects all users.
#   test/prod + custom = any other distribution ID for that environment, e.g. a continuous-
#                        deployment staging distribution reachable only via the aws-cf-cd-* test
#                        header, so you can exercise this exact script with no impact on live users.
echo "Select target:"
echo "  1) test  (primary / live test distribution)"
echo "  2) test with custom distribution ID (e.g. a test staging distribution)"
echo "  3) prod  (primary / live prod distribution)"
echo "  4) prod with custom distribution ID (e.g. a prod staging distribution)"
while true; do
  read -rp "Enter choice (1/2/3/4): " CHOICE
  case "$CHOICE" in
    1) ENVIRONMENT="qa";   DIST_ID="E2YMATUXLSFFJV"; TARGET_KIND="primary"; break ;;
    2) ENVIRONMENT="qa";   TARGET_KIND="custom"
       read -rp "Enter the distribution ID: " DIST_ID
       if [ -z "$DIST_ID" ]; then echo "No distribution ID entered. Aborting."; exit 1; fi
       break ;;
    3) ENVIRONMENT="prod"; DIST_ID="E3GJQ1JB1DFNU4"; TARGET_KIND="primary"; break ;;
    4) ENVIRONMENT="prod"; TARGET_KIND="custom"
       read -rp "Enter the distribution ID: " DIST_ID
       if [ -z "$DIST_ID" ]; then echo "No distribution ID entered. Aborting."; exit 1; fi
       break ;;
    *) echo "Invalid option. Please enter 1, 2, 3 or 4." ;;
  esac
done

# Set the holding-page origin for the chosen environment
if [ "$ENVIRONMENT" = "prod" ]; then
  HOLDING_PAGE_ORIGIN="gap-prod-holding-page.s3-website.eu-west-2.amazonaws.com"
else
  HOLDING_PAGE_ORIGIN="gap-qa-holding-page.s3-website.eu-west-2.amazonaws.com"
fi

# Extra warning only when this will affect live users
if [ "$TARGET_KIND" = "primary" ] && [ "$ENVIRONMENT" = "prod" ]; then
  echo ""
  echo "WARNING: You are targeting the PRIMARY PRODUCTION distribution. This will affect live users."
  read -rp "Are you sure you want to continue? (y/n): " PROD_CONFIRM
  if [ "$PROD_CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# Confirm before proceeding
echo ""
echo "About to switch to the holding page:"
echo "  Target          : $TARGET_KIND ($ENVIRONMENT)"
echo "  Distribution ID : $DIST_ID"
echo "  Holding origin  : $HOLDING_PAGE_ORIGIN"
echo ""
read -rp "Are you sure? (y/n): " CONFIRM
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

# The holding page is identified by its S3 website DomainName. A CloudFront origin's
# Id can differ from its DomainName (it does on prod: Id uses .s3. but the domain uses
# .s3-website.), so resolve the real Id here rather than assuming Id == domain.
holding_page_domain = "$HOLDING_PAGE_ORIGIN"
holding_page_origin = next(
    (o['Id'] for o in config['Origins']['Items'] if o['DomainName'] == holding_page_domain),
    None
)
if holding_page_origin is None:
    raise SystemExit(f"ERROR: no origin with domain {holding_page_domain} on this distribution")
print(f"Holding page origin id: {holding_page_origin}")

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
echo "Done. Holding page is now live on the $TARGET_KIND $ENVIRONMENT distribution ($DIST_ID)."
