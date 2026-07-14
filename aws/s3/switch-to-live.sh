#!/bin/bash
set -e

# --- Select environment ---
# The environment only determines which live load balancer origins the behaviours point at.
# The distribution ID is always entered manually (never hardcoded), so this script can
# target either a primary distribution or a continuous-deployment staging distribution.
echo "Select environment:"
echo "  1) test"
echo "  2) prod"
while true; do
  read -rp "Enter choice (1/2): " CHOICE
  case "$CHOICE" in
    1) ENVIRONMENT="qa";   break ;;
    2) ENVIRONMENT="prod"; break ;;
    *) echo "Invalid option. Please enter 1 or 2." ;;
  esac
done

# Distribution ID is never hardcoded - enter the primary or staging distribution ID
read -rp "Enter the CloudFront distribution ID: " DIST_ID
if [ -z "$DIST_ID" ]; then
  echo "No distribution ID entered. Aborting."
  exit 1
fi

# Set the live origins for the chosen environment
if [ "$ENVIRONMENT" = "prod" ]; then
  FIND_LB_ORIGIN="find-lb.find-a-grant-support.service.cabinetoffice.gov.uk"
  APPLY_LB_ORIGIN="apply-lb.find-a-grant-support.service.cabinetoffice.gov.uk"
else
  FIND_LB_ORIGIN="find-lb.find-a-grant-support-test.service.cabinetoffice.gov.uk"
  APPLY_LB_ORIGIN="apply-lb.find-a-grant-support-test.service.cabinetoffice.gov.uk"
fi

# Extra caution for production distributions
if [ "$ENVIRONMENT" = "prod" ]; then
  echo ""
  echo "WARNING: You have selected a PRODUCTION distribution ($DIST_ID)."
  echo "If this is the live/primary distribution, this will affect all users."
fi

# Confirm before proceeding
echo ""
echo "About to restore to live origins:"
echo "  Environment     : $ENVIRONMENT"
echo "  Distribution ID : $DIST_ID"
echo ""
read -rp "Are you sure you want to continue? (y/n): " CONFIRM
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

FIND_LB_DOMAIN = "$FIND_LB_ORIGIN"
APPLY_LB_DOMAIN = "$APPLY_LB_ORIGIN"

with open('/tmp/dist-current.json') as f:
    data = json.load(f)

config = data['DistributionConfig']

# A CloudFront origin's Id can differ from its DomainName, so resolve the real Ids
# from the distribution rather than assuming Id == domain.
def origin_id_for(domain):
    origin_id = next(
        (o['Id'] for o in config['Origins']['Items'] if o['DomainName'] == domain),
        None
    )
    if origin_id is None:
        raise SystemExit(f"ERROR: no origin with domain {domain} on this distribution")
    return origin_id

FIND_LB = origin_id_for(FIND_LB_DOMAIN)
APPLY_LB = origin_id_for(APPLY_LB_DOMAIN)
print(f"find origin id:  {FIND_LB}")
print(f"apply origin id: {APPLY_LB}")

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
echo "Done. Live site is restored on the $ENVIRONMENT distribution ($DIST_ID)."
