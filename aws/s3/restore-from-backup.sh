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
else
  DIST_ID="E2YMATUXLSFFJV"
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

echo ""
read -rp "You are about to restore from backup in the $ENVIRONMENT environment. Are you sure? (y/n): " CONFIRM
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
echo "Done. $ENVIRONMENT distribution restored from $BACKUP_FILE."
