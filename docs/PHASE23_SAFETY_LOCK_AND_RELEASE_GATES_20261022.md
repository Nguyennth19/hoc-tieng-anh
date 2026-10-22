# Phase 2.3 / Speaking Architecture — Safety Lock and Release Gates

**Date:** 2026-10-22 (Asia/Ho_Chi_Minh)
**Status:** SAFETY BASELINES RECORDED; RELEASE **BLOCKED** pending outstanding evidence
**Purpose:** preserve existing production / RC / UI branch baselines before the future shared architecture work.
**Branch for this report only:** `audit/phase23-safety-lock-20261022` (created from RC tip, documentation only).
**No code changes, no Sheet writes, no Apps Script deployment actions, no PR merge.**

## 1. Pinned repository baseline (verified through GitHub compare)

| Stream | Immutable Git SHA at audit | Relationship / policy |
| --- | --- | --- |
| `main` | `4b8dc04495427780d7012dc7a052c3232d6c891c` | GitHub main baseline. Not asserted to match published Apps Script v74. |
| `release/speaking-phase23-rc-20261021` | `20dad550e81854bf0f7ba75173be9199e7cdebac` | 45 commits ahead / 0 behind main; **freeze scope**, no architecture UI changes in this RC. |
| `feature/speaking-part4-ui-20261022` | `bde8b905377c5d840349f1c16b61531ccc9e6860` | 44 commits ahead / 0 behind main, separate changes. Not integrated with RC. |
| `audit/phase23-safety-lock-20261022` | based on RC SHA above | Documentation-only branch; it is not a Git tag, GitHub branch protection or production deployment. |

The RC diff against main includes `Database.gs`, `Migration.gs`, `Progress.gs`, `SkillSpeaking*.gs`, `JS_Speaking.html` and docs.
The UI feature diff against main includes `JS_Speaking.html`, `JS_SpeakingPart4.html`, `Styles_Speaking.html`, `Styles_SpeakingPart4.html`, `ViewSpeaking.html`, `ViewSpeakingPart4.html`, QA docs/tests.
**Never merge these two branches blindly**: both have a `JS_Speaking.html` diff and different release concerns. Review and manually reconcile on a future isolated integration branch.

Draft release PR: [#5](https://github.com/Nguyennth19/hoc-tieng-anh/pull/5), observed open; do not merge.

## 2. Production/deployment baseline

**Operator-reported, not independently verified in Apps Script management UI:**

- Apps Script project: `1AM0lir8dXszB0oYzQwgZTOV8Nkp0zBYmGe1UTdl65zuBvIYZjY744F1j`
- Published Web App deployment ID: `AKfycbwRIZDVJVkZAfY2vS4jzM-ULezgzu2aZAW3Y85hUL8D2iBvf8jo3LC4FHqa0nFQIXk1wg`
- Published `/exec`: https://script.google.com/macros/s/AKfycbwRIZDVJVkZAfY2vS4jzM-ULezgzu2aZAW3Y85hUL8D2iBvf8jo3LC4FHqa0nFQIXk1wg/exec
- Version 74, deployed 2026-10-21 08:53 (operator report)
- Script Property `APTIS_DATABASE_ID=10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0` (operator report)
- Script Property `APTIS_MEDIA_FOLDER_ID=1ePeeEej3E_E-NkdIw2X7L2oHKxa3Msmc` (operator report)

**Verified via read-only Google Drive metadata on 2026-10-22:**

- Production Google Sheet exists and is named `Ôn thi B2 Aptis`, ID `10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0`.
- A separate backup Google Sheet exists and is named `APTIS_B2_PRODUCTION_FULL_BACKUP_PRE_PHASE23_2026-10-22_V74`, ID `12bN6WoZyS3WACPp-vv01qDV_AbZjWhv22lyPLNEdbsY`.
- Production media folder exists and is named `APTIS_B2_APP_MEDIA`, ID `1ePeeEej3E_E-NkdIw2X7L2oHKxa3Msmc`.
- These metadata checks **do not** verify the deployed script, media permission/access, Google Sheet content equality or backup immutability.

Prior verified backup evidence: `docs/PHASE23_BACKUP_ROLLBACK_VERIFICATION_20261022.md` in RC reports 50/50 tab names/order matching, and 12/12 selected critical A1:AK1000 FORMULA-range comparisons. Remaining 38 tab contents, formatting, protections, Apps Script v74 source, deployment access settings and media file completeness were **not** comprehensively audited. The backup is a normal writable Drive copy, not an immutable archive.

## 3. Release gate matrix

| Gate | Evidence required | Current state | Allowed next action |
| --- | --- | --- | --- |
| G0: baseline & isolation | Git SHAs, distinct branches, target workbook/deployment IDs | **PASS for inventory** | Keep main, RC and production unchanged. |
| G1: rollback source | Independent exact export/snapshot of production Apps Script **v74** and active deployment/access configuration | **BLOCKED** — only operator-reported version exists | Read-only export/archive with authorized Apps Script access. Do NOT guess that GitHub main matches v74. |
| G2: workbook recovery | 50 tabs / all critical formulas, formatting, protections and an access-controlled archival copy; procedure to reconcile post-backup learner progress | **PARTIAL** — name/order 50/50, selected ranges 12/12; 38 tabs unverified | Extend read-only backup QA and preserve immutable/offline recovery. |
| G3: media | Verify production Drive folder ownership, sharing/access and representative real URLs | **PARTIAL** — folder ID/name verified, permissions unverified | Read-only media audit. |
| G4: automatic migrations | Explicit guard on `ensureSchema_() -> runMigrations()`, no unintended startup writes; rollback of non-transactional Sheet/Drive mutations | **PARTIAL** — RC migration/startup QA passed on disposable staging; live source settings not audited | Keep separate disposable migration tests; never run on production now. |
| G5: RC data/regression | P1=49, P2=51, P3=52; Master Q1-Q3 Test-only and idempotency; cache and progress persist | **PASS in prior QA** but release-specific browser verification still required | Re-run on isolated RC staging after any merge/rebase. |
| G6: cross-skill compatibility | Writing and Part 4 on isolated copy of the complete production workbook; Reading/Listening shell navigation smoke | **BLOCKED** | Stage read/write tests on disposable copy only. |
| G7: architecture refactor | Shared shell/study/audio/timer/Progress code reconciled with RC and tested against all Parts 1–4 | **NOT STARTED** | Build on a *new* architecture branch, not RC; incremental QA. |
| G8: approval controls | Explicit approval for PR merge and a separate explicit approval for Apps Script production deploy | **NOT GRANTED** | No merge, no production deploy, no production migration. |

**Release verdict: NO-GO** until G1, G2, G3, G4, G5, G6 and approvals are complete, and G7 if architecture refactor is included in the intended release.

## 4. Rollback runbook (prepared; NOT exercised on production)

1. Before any future deployment, capture confirmed current project source/version 74, deployment ID, executing identity, access policy and configuration properties, plus a verified full data/media backup.
2. Record the exact new Git commit, Apps Script version and pre-release Sheet checksum plus user progress watermark. Require scheduled maintenance/release window and owner approval.
3. If only UI/code fails and no data mutation occurred: use **Manage deployments** to point the same published deployment ID back to **v74**, preserving /exec URL if supported; smoke-test all skills.
4. If any migration wrote data: **code rollback does not restore Sheet data**. Stop writes, compare changed rows/columns, preserve learner changes after backup, reconcile selectively under explicit recovery approval. Never overwrite progress blindly with an old workbook snapshot.
5. Verify P1/P2/P3, Part4, Writing, media, Progress, settings and access after any rollback. Record evidence.

## 5. Architecture change isolation policy

- The proposed Shared UI Architecture is **not** in RC 2.3. Develop it separately; retain the pinned RC SHA as a stable future integration input.
- No deletion of stable RC migration/progress tests, no copy of QA workbook or media IDs into production source.
- No production Script Properties changes.
- When integration becomes necessary, create a dedicated branch from the approved baseline, explicitly reconcile conflicting `JS_Speaking.html`, and run full cross-skill staging QA and data checks.
- This record is **procedural freeze**; GitHub branch protection rules and immutable Git tags have **not** been configured.

## 6. Step 1 exit / next recommended step

**Step 1 outcome:** Baseline SHAs and Drive identities verified, dedicated documentation branch created, release gates and rollback runbook established. Outstanding blockers remain open. No production modification.

**Step 2 proposal (requires user confirmation):** Shared Layout Foundation: first write a selector ownership/container map for `AppShell`/`global-stage`/`speaking-main` and Part 1–4, then refactor only shared layout/spacing on a new isolated architecture branch; perform P1–4 desktop/mobile visual regression. No changes to backend, progress schema, timers or RC v2.3 in Step 2.
