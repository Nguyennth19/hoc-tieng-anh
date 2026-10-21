# Phase 2.3 — Production Read-Only Audit and Rollback Gate

Date: 2026-10-21
State: READ-ONLY AUDIT, production not modified.

## Grounded production database
Live Google Sheet (confirmed by exact mapped Drive ID):
https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit
Spreadsheet ID: 10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0
Title: Ôn thi B2 Aptis
50 tabs found. The workbook includes Writing and Part 4 assets: full workbook backup is mandatory.

### Live read-only observations
- SPEAKING 49 rows, 49 active.
- SPEAKING_P2 64 rows, 51 active.
- SPEAKING_P3 60 rows, 52 active.
- PROGRESS 4 rows; ATTEMPTS 1 row; MEDIA 106 rows; SETTINGS 13 rows.
- SETTINGS schema_version display: 3.2.2000.
- SETTINGS app_version display: 3.2.2001.
- SETTINGS p1_content_version display: 2026.10.19.49.
- SETTINGS p2_description_version display: 2.1.2000.
- SETTINGS p3_description_version display: 2.1.2000.
- SETTINGS last_migration_at: 2026-10-21T04:55:11.216Z (metadata value only; actor/deployment unknown).
- SETTINGS media_folder_id exists; do not replace with staging folder.
- Live counts correspond to previous accepted QA counts, but this alone is not a full content checksum comparison.

## GitHub production source review
- `main` Config.gs DATABASE_SPREADSHEET_ID is placeholder, not a reliable production database pointer.
- `main` Database.gs prioritizes Script Property APTIS_DATABASE_ID; if unset, bridges from Config constant when valid.
- Release candidate compared with main: 42 commits ahead, 0 behind, 12 files modified/added as of audit.
- No known connected action currently reads Apps Script Script Properties, deployments, versions, or project settings. They are NOT VERIFIED.
- Current main code is not proof of the published Apps Script deployment/version or runtime code.

## Remaining immutable production gate
Before PR approval or deploy, authorized project operator must provide READ-ONLY:
1. Production Apps Script project editor URL and project name.
2. Project Settings > Script Properties: check APTIS_DATABASE_ID equals exact production spreadsheet ID above; APTIS_MEDIA_FOLDER_ID corresponds to correct production Drive media folder. Redact any other sensitive properties.
3. Deploy > Manage deployments: current active Web App deployment ID, URL and version, WITHOUT editing deployment.
4. Backup a new full 50-tab production workbook, and preserve last known good deployment/version and source commit.
5. No QA properties, QA guard functions or QA media folder references in deployed code.

## Rollback plan
- Prior to release: capture current deployment ID/version, full Sheet backup, code commit and permissions.
- If new app fails: restore previous Apps Script deployment version first.
- Code rollback cannot undo migration writes. Any data restoration needs explicit authorization, validated backup, and a separate recovery plan covering ALL workbook tabs.
- PR merge is not equivalent to Apps Script deploy; project source syncing and deployment must be separately audited.

## Verdict
Production Google Sheet identity/content structure: VERIFIED READ ONLY.
Runtime script property ID, live deployment, actual production media permissions: UNKNOWN (must be supplied by owner/authorized operator).
Not ready to merge/deploy.
