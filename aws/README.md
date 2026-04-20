# CloudFront Holding Page Runbook

This folder contains helper scripts used to switch Find a Grant between live origins and a static S3 holding page, and to update the holding page content.

## Script locations

- Runtime scripts are in `gap-find-web/aws/s3/`

## First stage: download scripts in CloudShell

Start by copying the latest scripts from S3 into your current CloudShell directory:

```bash
aws s3 cp "s3://gap-setup-holding-page" . --recursive
```

## Environments and IDs

| Environment | CloudFront distribution ID | Holding page S3 bucket | Holding page origin |
|---|---|---|---|
| `qa` | `E2YMATUXLSFFJV` | `gap-qa-holding-page` | `gap-qa-holding-page.s3-website.eu-west-2.amazonaws.com` |
| `prod` | `E3GJQ1JB1DFNU4` | `gap-prod-holding-page` | `gap-prod-holding-page.s3-website.eu-west-2.amazonaws.com` |

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

Both switch scripts prompt for `qa` or `prod`, include explicit confirmation prompts, and create a timestamped backup file (`dist-backup-YYYYMMDD-HHMMSS.json`) before making changes.

## Scripts

### `s3/switch-to-holding-page.sh`

Switches selected paths to the S3 holding page for the chosen environment (`qa` or `prod`), then invalidates CloudFront.

```bash
sh ./switch-to-holding-page.sh
```

### `s3/switch-to-live.sh`

Restores selected paths to live load balancer origins for the chosen environment (`qa` or `prod`), then invalidates CloudFront.

```bash
sh ./switch-to-live.sh
```

### `s3/restore-from-backup.sh` - Be careful with this!

Restores from a backup file and invalidates CloudFront.
Prompts for environment (`qa` or `prod`) before restoring.

```bash
sh ./restore-from-backup.sh dist-backup-20260414-162948.json
```

If run without an argument, it prints usage and available backup files.

### `s3/update-holding-page.sh`

Updates `holding-page/index.html`, uploads the generated page to the selected environment bucket (`qa` or `prod`), and invalidates `/index.html`.

What it prompts for:

- Environment (`qa`/`prod`)
- Optional custom page message (defaults to `Please try again later.`)
- Confirmation (plus an extra production warning prompt for `prod`)

```bash
sh ./update-holding-page.sh
```

### `s3/clear-cache-invalidate.sh`

Prompts for environment (`qa` or `prod`) and creates a full invalidation (`/*`) for that distribution.

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
