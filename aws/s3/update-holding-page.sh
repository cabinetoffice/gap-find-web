#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_HTML="$SCRIPT_DIR/holding-page/index.html"

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
  echo ""
  echo "WARNING: You have selected the PRODUCTION environment. This will affect live users."
  read -rp "Are you sure you want to continue? (y/n): " PROD_CONFIRM
  if [ "$PROD_CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
  fi
  S3_BUCKET="gap-prod-holding-page"
  DIST_ID="E3GJQ1JB1DFNU4"
  STYLESHEET_URL="https://find-government-grants.service.gov.uk/style.css"
else
  S3_BUCKET="gap-qa-holding-page"
  DIST_ID="E2YMATUXLSFFJV"
  STYLESHEET_URL="https://test-env.find-a-grant-support-test.service.cabinetoffice.gov.uk/style.css"
fi

# Prompt for custom message
echo ""
read -rp "Enter a message for the holding page (leave blank to use default: 'Please try again later.'): " CUSTOM_MESSAGE

if [ -z "$CUSTOM_MESSAGE" ]; then
  MESSAGE="Please try again later."
else
  MESSAGE="$CUSTOM_MESSAGE"
fi

# Confirm
echo ""
echo "The following will be uploaded to the $ENVIRONMENT holding page:"
echo "  Message : $MESSAGE"
echo "  CSS URL : $STYLESHEET_URL"
echo "  S3 bucket: $S3_BUCKET"
echo ""
read -rp "Are you sure? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Aborted."
  exit 0
fi

# Build updated HTML in a temp file
export TMP_HTML="/tmp/holding-page-$$.html"
cp "$SOURCE_HTML" "$TMP_HTML"

# Replace stylesheet URL
python3 - <<EOF
import re

with open('$TMP_HTML', 'r') as f:
    content = f.read()

# Replace the href in the stylesheet link
content = re.sub(
    r'(<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\'])[^"\']+(["\'])',
    r'\g<1>${STYLESHEET_URL}\2',
    content
)
content = re.sub(
    r'(<link[^>]+href=["\'])[^"\']+(["\'][^>]+rel=["\']stylesheet["\'])',
    r'\g<1>${STYLESHEET_URL}\2',
    content
)

with open('$TMP_HTML', 'w') as f:
    f.write(content)

print("Stylesheet URL updated.")
EOF

# Replace message paragraph and remove commented-out example
export HOLDING_PAGE_MESSAGE="$MESSAGE"
python3 - <<'PYEOF'
import re
import os

message = os.environ['HOLDING_PAGE_MESSAGE']

with open(os.environ['TMP_HTML'], 'r') as f:
    content = f.read()

# Replace the message paragraph
content = re.sub(
    r'<p class="govuk-body">.*?</p>',
    f'<p class="govuk-body">{message}</p>',
    content,
    count=1
)

# Remove the commented-out example line
content = re.sub(
    r'\s*<!--\s*<p class="govuk-body">.*?</p>\s*-->',
    '',
    content
)

with open(os.environ['TMP_HTML'], 'w') as f:
    f.write(content)

print("Message updated.")
PYEOF

echo "Uploading to S3..."
aws s3 cp "$TMP_HTML" "s3://$S3_BUCKET/index.html" \
  --content-type "text/html" \
  --cache-control "no-cache, no-store, must-revalidate"

rm "$TMP_HTML"
echo "Upload complete."

echo "Creating cache invalidation..."
INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/index.html" \
  --query 'Invalidation.Id' \
  --output text)
echo "Invalidation created: $INVALIDATION"

echo ""
echo "Done. Holding page updated for $ENVIRONMENT."
