#!/bin/bash
set -e

# Prompt for environment
while true; do
  read -rp "Which environment do you want to restore to live? (qa/prod): " ENVIRONMENT
  case "$ENVIRONMENT" in
    qa|prod) break ;;
    *) echo "Invalid option. Please enter 'qa' or 'prod'." ;;
  esac
done

# Set environment-specific values
if [ "$ENVIRONMENT" = "prod" ]; then
  DIST_ID="E3GJQ1JB1DFNU4"
  FIND_LB_ORIGIN="find-lb.find-a-grant-support.service.cabinetoffice.gov.uk"
  APPLY_LB_ORIGIN="apply-lb.find-a-grant-support.service.cabinetoffice.gov.uk"
else
  DIST_ID="E2YMATUXLSFFJV"
  FIND_LB_ORIGIN="find-lb.find-a-grant-support-test.service.cabinetoffice.gov.uk"
  APPLY_LB_ORIGIN="apply-lb.find-a-grant-support-test.service.cabinetoffice.gov.uk"
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
read -rp "You are about to restore the $ENVIRONMENT environment to live. Are you sure? (y/n): " CONFIRM
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

echo "Restoring cache behaviors to live origins..."
python3 - <<EOF
import json

FIND_LB = "$FIND_LB_ORIGIN"
APPLY_LB = "$APPLY_LB_ORIGIN"

# Mapping of path -> (origin, allowed_methods_count)
# 7 methods = full REST (admin/applicant pages), 3 methods = GET only (grants/find)
restore_map = {
    "/":                  (FIND_LB,  3),
    "/*":                 (FIND_LB,  3),
    "/grants/*":          (FIND_LB,  3),
    "/apply/applicant":   (APPLY_LB, 7),
    "/apply/applicant/*": (APPLY_LB, 7),
    "/apply/admin":       (APPLY_LB, 7),
    "/apply/admin/*":     (APPLY_LB, 7),
}

all_methods = {
    "Quantity": 7,
    "Items": ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"],
    "CachedMethods": {"Quantity": 2, "Items": ["HEAD", "GET"]}
}
get_only_methods = {
    "Quantity": 3,
    "Items": ["HEAD", "GET", "OPTIONS"],
    "CachedMethods": {"Quantity": 2, "Items": ["HEAD", "GET"]}
}

with open('/tmp/dist-current.json') as f:
    data = json.load(f)

config = data['DistributionConfig']

for behavior in config['CacheBehaviors']['Items']:
    path = behavior['PathPattern']
    if path in restore_map:
        origin, method_count = restore_map[path]
        print(f"  Restoring {path} -> {origin}")
        behavior['TargetOriginId'] = origin
        behavior['AllowedMethods'] = all_methods if method_count == 7 else get_only_methods

with open('/tmp/dist-updated.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Done.")
EOF

echo "Removing holding page 404 custom error response..."
python3 - <<'PYEOF'
import json

with open('/tmp/dist-updated.json') as f:
    config = json.load(f)

existing_errors = config.get('CustomErrorResponses', {}).get('Items', [])

# Remove the 404 -> /index.html entry added for the holding page
existing_errors = [e for e in existing_errors if e['ErrorCode'] != 404]

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
echo "Done. Live site is restored for $ENVIRONMENT."
