#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore-from-backup.sh <backup-file>"
  echo ""
  echo "Available backups:"
  ls -lt dist-backup-*.json 2>/dev/null || echo "  No backup files found in current directory."
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' not found."
  exit 1
fi

# Distribution ID is never hardcoded - enter it manually
read -rp "Enter the CloudFront distribution ID to restore: " DIST_ID
if [ -z "$DIST_ID" ]; then
  echo "No distribution ID entered. Aborting."
  exit 1
fi

echo ""
echo "About to restore distribution $DIST_ID from backup $BACKUP_FILE."
echo "If this is the live/primary distribution, this will affect all users."
read -rp "Are you sure you want to continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring from $BACKUP_FILE..."

echo "Fetching current ETag..."
CURRENT_ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" --query 'ETag' --output text)
echo "Current ETag: $CURRENT_ETAG"

echo "Extracting DistributionConfig from backup..."
python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d['DistributionConfig'], indent=2))" \
  < "$BACKUP_FILE" > /tmp/dist-restore.json

echo "Applying backup config..."
aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --distribution-config file:///tmp/dist-restore.json \
  --if-match "$CURRENT_ETAG"

echo "Creating cache invalidation..."
INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "Invalidation created: $INVALIDATION"

echo ""
echo "Waiting for invalidation to complete (this may take 1-3 minutes)..."
aws cloudfront wait invalidation-completed \
  --distribution-id "$DIST_ID" \
  --id "$INVALIDATION"

echo ""
echo "Done. Distribution $DIST_ID restored from $BACKUP_FILE."
