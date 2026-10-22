# Phase 2.3 — Production Backup and Rollback Verification (2026-10-22)

## Scope and safeguard
- The production spreadsheet was READ ONLY throughout backup verification; no production Script Properties, Apps Script deployment, media or GitHub main mutation.
- Original: https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit
- Fresh backup copy: https://docs.google.com/spreadsheets/d/12bN6WoZyS3WACPp-vv01qDV_AbZjWhv22lyPLNEdbsY/edit
- Backup title: APTIS_B2_PRODUCTION_FULL_BACKUP_PRE_PHASE23_2026-10-22_V74
- Copy created via Google Drive Copy API. It is a working Drive copy, not a guaranteed immutable/offline archival snapshot; restrict edits to backup and preserve independent recovery copy if needed.

## Verified
- Workbook sheet metadata: 50 tabs in source, 50 tabs in copy; names and ordering exact match.
- A1:AK1000, FORMULA mode, exact 2D values compared for:
  SPEAKING, SPEAKING_P2, SPEAKING_P3, PROGRESS, ATTEMPTS, SETTINGS, MEDIA,
  WRITING, P4_PROGRESS, P4_ATTEMPTS, P4_MASTERY, P4_FINAL_CONTENT_QA_51.
  All **12/12 exact matches** at the checked ranges.
- Remaining 38 tab contents, formatting, Drive file attachments/media ownership, Apps Script-bound code and protections NOT independently compared; copy operation does not guarantee Apps Script project/version backup.

## Apps Script rollback baseline (operator-reported)
- Production script project: https://script.google.com/u/0/home/projects/1AM0lir8dXszB0oYzQwgZTOV8Nkp0zBYmGe1UTdl65zuBvIYZjY744F1j/edit
- Current published deployment: https://script.google.com/macros/s/AKfycbwRIZDVJVkZAfY2vS4jzM-ULezgzu2aZAW3Y85hUL8D2iBvf8jo3LC4FHqa0nFQIXk1wg/exec
- Deployment ID: AKfycbwRIZDVJVkZAfY2vS4jzM-ULezgzu2aZAW3Y85hUL8D2iBvf8jo3LC4FHqa0nFQIXk1wg
- Version: 74, released 2026-10-21 08:53 local (operator-supplied).
- APTIS_DATABASE_ID: 10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0.
- APTIS_MEDIA_FOLDER_ID: 1ePeeEej3E_E-NkdIw2X7L2oHKxa3Msmc.
- Script content snapshot and project deployment settings for **v74** not yet archived independently. Deployment version listing is not a full backup, and no Apps Script export/REST capability is connected.

## Compatibility audit (static / not runtime PASS)
- release candidate vs main: Database.gs, Migration.gs, SkillSpeaking*.gs, Progress.gs, JS_Speaking.html, documentation. No Writing or Part 4-specific source files changed in the diff.
- Shared Database.gs setSetting_ now forces plain text before write; Migration.gs startup behavior changed. Runtime side effects could touch shared SETTINGS; compatibility cannot be inferred solely from unchanged Writing/Part4 files.
- WRITING and representative P4 sheet data exact match in source and backup; this verifies **backup copy**, not release candidate runtime compatibility.
- Keep Writing/Part 4 regression as an explicit release blocker until tested on fully isolated staging cloned from full production workbook.

## Rollback runbook
1. BEFORE release, export/archive current production Apps Script project/version 74 source (and deployment web app access configuration); do not change deployment.
2. Preserve and protect the full 50-tab backup, verify all remaining tab data/formulas and critical formatting/protections if applicable. Consider separate immutable archival copy.
3. On deployment failure, select prior known good version 74 in Manage deployments for the existing deployment. Keep the deployment ID/URL consistent where possible.
4. If migration wrote production Sheet/Drive data, restoring version 74 **does not** revert it. Restore data from verified backup only with separate explicit permission, while preserving post-backup learner progress or reconciling changes.
5. Verify Speaking P1 49/P2 51/P3 52, Writing, Part 4, progress, media and other modules after recovery.

## Verdict
- Production full-workbook copy CREATED.
- Full tab names/order VERIFIED (50/50).
- Sampled core and cross-skill data/formula copies VERIFIED (12/12 exact).
- Rollback deployment baseline DOCUMENTED; independent source export and live rollback drill NOT DONE.
- Writing/Part4 RUNTIME REGRESSION PENDING.
- Draft PR must remain unmerged; no production deploy approval.
