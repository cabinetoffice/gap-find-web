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

echo ""
read -rp "You are about to create a full cache invalidation in the $ENVIRONMENT environment. Are you sure? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Aborted."
  exit 0
fi

echo "Creating cache invalidation for $ENVIRONMENT..."
INVALIDATION=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "Invalidation created: $INVALIDATION"