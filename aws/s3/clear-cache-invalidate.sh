#!/bin/bash

set -e

# Distribution ID is never hardcoded - enter it manually
read -rp "Enter the CloudFront distribution ID: " DIST_ID
if [ -z "$DIST_ID" ]; then
  echo "No distribution ID entered. Aborting."
  exit 1
fi

echo ""
echo "About to create a full cache invalidation (/*) on distribution $DIST_ID."
read -rp "Are you sure you want to continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Aborted."
  exit 0
fi

echo "Creating cache invalidation for $DIST_ID..."
INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "Invalidation created: $INVALIDATION"