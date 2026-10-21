# Phase 2.3 — Speaking Release Candidate / Release Gate
Date: 2026-10-21
Source: refactor/speaking-backend-phase1-20261021
Candidate: release/speaking-phase23-rc-20261021
Target: main (NOT YET MERGED)

## Evidence from staging
- Phase 2.1 cache safety regression: 13/13 as previously logged.
- Phase 2.2 controlled migration: PASS on disposable QA workbook; protected P3/PROGRESS/ATTEMPTS checksums unchanged, speaking IDs/order unchanged, MEDIA 106 -> 106.
- Progress ID regression: 522/522 PASS.
- Master workflow read-only regression: 12/12 PASS.
- Visual regression: user confirmed P1 49, P2 51, P3 52, Learn/Memorize/Test, Q1/Q2/Q3 Test-only mastery, and popup after backend save.
- No production verification or deployment has been performed.

## Release isolation
- In release candidate, Config.gs DATABASE_SPREADSHEET_ID is the original main placeholder. Do not put QA or backup workbook IDs in production source.
- Removed staging-only .gs test harness files from release candidate; tests and workbook/folder IDs remain in the refactor branch.
- docs may include staging QA IDs for traceability but have no executable script functions.
- Must verify production Script Properties APTIS_DATABASE_ID points to the *actual existing production workbook* before any release deployment. Never guess or copy a backup ID.
- Must verify APTIS_MEDIA_FOLDER_ID is production's correct folder if configured; never copy staging QA folder ID.
- Important: getDatabase_ uses Script Properties first and falls back to Config.gs, while ensureSchema_ may invoke runMigrations() as part of startup. Take a fresh immutable backup and verify live bank integrity before permitting initial production startup. A failed migration is not an atomic rollback.
- Do NOT import staging Script Properties when deploying.

## Outstanding release blockers
1. Production workbook identity, Script Properties, deployment target and media folder IDs must be explicitly audited in production without writing.
2. Review automatic ensureSchema_ migration behavior and validate rollback procedure on another disposable staging copy.
3. Run syntax/lint or equivalent build checks against actual production-bound code and verify Part 4 unaffected.
4. Review security/access of Drive thumbnail links (image display in QA does not establish correct production permissions).
5. Human approval before PR merge, production deploy or manual migration.

## Rollback
Preserve last known good production deployment version and matching production data snapshot; revert deployment to previous version if functionality fails. If a migration has written to Sheets, code rollback alone does not revert the data; restore data only from verified snapshot with explicit approval and controlled procedure.

## Recommended final release QA
- Test-only Master button, Q1/Q2/Q3 selector and statuses; each prompt saved once.
- 3/3 -> topic mastered, persists after reload, no duplicate review increment.
- Content counts: P1 49, P2 51, P3 52. Part 4 and all other skills unchanged.
- Test media and cache freshness, browser console, and permissions.
- Check version/rollout and read-only audit after deploy.
