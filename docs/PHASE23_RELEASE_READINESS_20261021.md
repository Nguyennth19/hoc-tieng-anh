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

## Phase 2.3 automatic migration audit — 2026-10-21
- `getBootstrapData()` calls `ensureSchema_()`. When schema/content-version keys differ or cache misses, `ensureSchema_()` may invoke `runMigrations()`. This is an **automatic write path**; opening a new release deployment can trigger migration.
- `runMigrations()` creates/updates SHEET headers, legacy columns, P1 content, Part 2 embedded media, SETTINGS metadata and invalidates caches. Its Sheet/Drive changes are NOT transactional.
- A previous P3-empty check ran after some mutations. Release candidate now runs `assertSpeakingMigrationBanksReady_(ss)` before ANY migration sheet mutation and rejects missing/empty P1/P2/P3. This does not eliminate other migration side effects on valid data.
- A new disposable QA workbook copied from the Phase 0 backup was verified against its source with full A1:AK1000 FORMULA matrices across **all seven tabs**: 49 P1, 64 P2, 60 P3, 4 PROGRESS, 1 ATTEMPTS, 13 SETTINGS, 106 MEDIA rows; 7/7 exact match.
- Fresh QA workbook: https://docs.google.com/spreadsheets/d/1M4I1ZmwscCVsihxTuAVSEPHdRdYjIEV0DEGQyYDFpeI/edit
- Fresh QA media: https://drive.google.com/drive/folders/10XYy1NgFzpKO51ZjleFIsmae3BN7Lcts
- Separate QA harness branch: `qa/speaking-phase23-release-test-20261021` based on this release-candidate; contains `tests/Phase23_ReleaseQAGuard.gs`. This test harness must NEVER be merged into main.
- To exercise RC in a **new, isolated** Apps Script project, import the QA branch only there, configure Script Properties `APTIS_DATABASE_ID` and `APTIS_MEDIA_FOLDER_ID` to the above QA IDs *before opening any app preview*, run `phase23ReleaseQAPreflight`, then await review before granting `APTIS_PHASE23_QA_RUN_ONCE` and calling `phase23RunReleaseQAOnce`.
- No Phase 2.3 migration has been executed yet. No production deployment/merge.

## Phase 2.3 release-final-review progress
- Controlled migration QA confirmed PASS, `issues: []`. Bank, progress, attempts and media hashes unchanged; SETTINGS metadata intentionally updated.
- Startup QA after legacy version matching patch confirmed PASS with P1=49, P2=51, P3=52 on both bootstraps; all seven Sheet hashes unchanged.
- Root cause: Sheets can date-coerce dotted strings such as `3.2.0` into display text `3.2.2000`. `ensureSchema_` now recognizes this pre-existing legacy representation to avoid unnecessary repeated migration.
- `Database.gs` `setSetting_` now sets plain-text number format **before** writing each SETTINGS value, preventing the conversion on future metadata writes.
- QA-only function `phase23TestVersionTextStorage()` in the QA branch tests three dotted version strings using a temporary Sheet and confirms all original seven sheets remain unchanged. NOT YET EXECUTED; needs tester log.
- Production Script Properties / live deployment details NOT VERIFIED. PR and merge are intentionally withheld.

## QA acceptance — Version text persistence
- User-provided `PHASE23_VERSION_TEXT_QA_RESULT`: `ok: true`, `issues: []`.
- Expected and actual versions matched: `3.2.0`, `3.2.1`, `2.1.0`.
- All three Google Sheets cell number formats were `@` (plain text).
- `originalSevenSheetsUnchanged: true`.
- **PASS** on Phase 2.3 disposable QA; not yet validated on production.
- Remaining gates: verify original production workbook and deployment IDs by read-only audit, assess rollback and PR readiness. No production merge/deploy approved.
