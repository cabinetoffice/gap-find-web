# CloudFront Holding Page Runbook

This folder contains helper scripts used to switch Find a Grant between live origins and a static S3 holding page, and to update the holding page content.

## Script locations

- Runtime scripts are in `gap-find-web/aws/s3/`

## First stage: download scripts in CloudShell

Start by copying the latest scripts from S3 into your current CloudShell directory:

```bash
aws s3 cp "s3://gap-setup-holding-page" . --recursive
```

## Environments

The scripts never store CloudFront distribution IDs. Each script prompts for the distribution ID at runtime, so look up the correct ID in the AWS console before running.

| Environment | Holding page S3 bucket | Holding page origin |
|---|---|---|
| `qa` (test) | `gap-qa-holding-page` | `gap-qa-holding-page.s3-website.eu-west-2.amazonaws.com` |
| `prod` | `gap-prod-holding-page` | `gap-prod-holding-page.s3-website.eu-west-2.amazonaws.com` |

## What the switch scripts change

`switch-to-holding-page.sh` updates these cache behaviors to point to the holding page origin:

- `/`
- `/*`
- `/grants/*`
- `/apply/applicant`
- `/apply/applicant/*`
- `/apply/admin`
- `/apply/admin/*`

It also:

- Forces those switched behaviors to use GET-only methods (`HEAD`, `GET`, `OPTIONS`)
- Adds/overwrites a CloudFront custom error for `404 -> /index.html` with response code `200`
- Creates a full cache invalidation for `/*`

`switch-to-live.sh` reverses this:

- Restores the switched behaviors to live origins (`find-lb` or `apply-lb` depending on path)
- Restores allowed methods per behavior (`7 methods` for apply paths, `3 methods` for find paths)
- Removes the `404 -> /index.html` custom error response
- Creates a full cache invalidation for `/*`

Both switch scripts prompt for the environment (`test` or `prod`) and then for the CloudFront distribution ID (never hardcoded), include explicit confirmation prompts (with an extra caution when `prod` is selected), and create a timestamped backup file (`dist-backup-YYYYMMDD-HHMMSS.json`) before making changes.

## Scripts

### `s3/switch-to-holding-page.sh`

Switches selected paths to the S3 holding page for the chosen environment (`test` or `prod`) and entered distribution ID, then invalidates CloudFront.

```bash
sh ./switch-to-holding-page.sh
```

### `s3/switch-to-live.sh`

Restores selected paths to live load balancer origins for the chosen environment (`test` or `prod`) and entered distribution ID, then invalidates CloudFront.

```bash
sh ./switch-to-live.sh
```

### `s3/restore-from-backup.sh` - Be careful with this!

Restores from a backup file and invalidates CloudFront.
Prompts for the CloudFront distribution ID before restoring.

```bash
sh ./restore-from-backup.sh dist-backup-20260414-162948.json
```

If run without an argument, it prints usage and available backup files.

### `s3/update-holding-page.sh`

Updates `holding-page/index.html`, uploads the generated page to the selected environment bucket (`qa` or `prod`), and invalidates `/index.html`.

What it prompts for:

- Environment (`qa`/`prod`)
- CloudFront distribution ID (never hardcoded)
- Optional custom page message (defaults to `Please try again later.`)
- Confirmation (plus an extra production warning prompt for `prod`)

```bash
sh ./update-holding-page.sh
```

### `s3/clear-cache-invalidate.sh`

Prompts for a CloudFront distribution ID and creates a full invalidation (`/*`) for that distribution.

```bash
sh ./clear-cache-invalidate.sh
```

## Suggested maintenance procedure

1. Update the holding page content first (optional):
   ```bash
   sh ./update-holding-page.sh
   ```
2. Switch traffic to the holding page:
   ```bash
   sh ./switch-to-holding-page.sh
   ```
3. Verify key URLs show the holding page.
4. Perform maintenance.
5. Switch traffic back to live:
   ```bash
   sh ./switch-to-live.sh
   ```
6. Verify live traffic is restored.

## Recovery procedure

If needed, restore from a known backup file - Be very careful though!

```bash
sh ./restore-from-backup.sh dist-backup-YYYYMMDD-HHMMSS.json
```

Note: `restore-from-backup.sh` fetches the current ETag before update, so backup-file ETag staleness is not a problem.
