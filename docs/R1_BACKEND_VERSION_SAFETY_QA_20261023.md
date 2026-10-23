# R1 — Backend Version Safety, P3 Migration Lock & Cache Safety

**Ngày:** 2026-10-23  
**Baseline accepted by user:** `hotfix/speaking-staging-load-recovery-20261023` @ `2a605c2e915ea460897f43615e97814e4a2467ca`  
**Implementation branch:** `refactor/speaking-r1-backend-safety-20261023`  
**Scope:** repository-source changes only; no Apps Script project push, production deploy, Sheets write, Script Properties update, or Drive asset write.

## 1. Root causes & safeguards

| Area | Previously | R1 behavior |
|---|---|---|
| P3 legacy migration | `upgradeSpeakingPart3Description_()` could erase Q2/Q3 models, re-activate curated-disabled rows, and overwrite provenance if called directly | Function is retired and always throws `R1_MIGRATION_BLOCKED` before any write |
| P3 startup self-heal | When zero P3 EX active topics, `ensurePart3ExamBankReady_()` could invoke the retired migration and silently swallow errors | Guard only reads; missing/empty/all-inactive P3 fails visibly with `R1_P3_*`; zero automatic reseeding |
| Schema startup | `ensureSchema_()` could invoke `runMigrations()` on SETTINGS mismatch, including side effects to banks, media, or settings | `ensureSchema_()` only checks and caches version matching; mismatch throws `R1_SCHEMA_VERSION_MISMATCH`. Explicit administrator-run migrations remain separate and should require reviewed backup |
| Legacy schema cache | Old cache value could bypass a newly introduced gate | New positive-check namespace `schema:r1:`; explicit migrations clear both old and new keys |
| Speaking content/progress cache | `cache.put(key, JSON.stringify(data))` silently failed on values exceeding Apps Script's per-item size | UTF-16 slices of at most 18,000 code units; up to 16 bounded chunks; manifest published only after `putAll` succeeds; missing/corrupt pieces fall back to source; excessive payloads are not cached |

## 2. Invariants

1. P1/P2/P3 curated data, historical IDs, Q1–Q3 models, active flags, and progress remain unchanged by source-level R1 execution.
2. No code in R1 automatically invokes retired P3 Q1-only seed on bootstrap.
3. Both normal bootstrap and progress endpoints validate SETTINGS but never auto-run `runMigrations()`.
4. `runMigrations()` remains an **explicit** administrative operation, which can still write Sheets/Drive and must **not** be invoked casually or just for QA.
5. `getSetting_()` keeps legacy date normalization for the three known version keys. R1 does not silently fix physical cell types in the live workbook.
6. Cache is best effort: cache failure never destroys the authoritative Sheet data or changes returned payloads.

## 3. Local verification (no remote execution)

| Suite | Result |
|---|---|
| R1 Node mock backend safety | **25/25 PASS** |
| S7.1 Deep Regression | **117/117 PASS** |
| S6.4 Startup | **27/27 PASS** |
| S6.3 Compact Timer | **45/45 PASS** |
| **Total** | **214/214 PASS** |

Commands on a local copy of the repository:

```bash
node tests/SpeakingR1BackendSafety_ReadOnly.node.js
node tests/SpeakingR1ExistingQA_ReadOnly.node.js
```

Important limitations: These are isolated VM/source/mock tests, not real Apps Script/Sheets/Drive `/dev` tests. They do not confirm live SETTINGS data types, backend timings, cache longevity, real user progress or production readiness.

## 4. Review/acceptance gate before staging

- [ ] Review GitHub branch diff against the accepted baseline, particularly `Migration.gs`, `SkillSpeaking.gs`, `SkillSpeakingPart3.gs`.
- [ ] Obtain a separate read-only verification of the live `SETTINGS` values and types: `schema_version=3.2.0`, `p1_content_version=2026.10.19.49`, `p2_description_version=2.1.0`, `p3_description_version=2.1.0`, or the documented physical Date equivalents.
- [ ] Verify curated P3 bank has active exam topics; do not run auto-restoration.
- [ ] If and only if authorized separately, test the R1 branch in QA `/dev` while retaining a rollback reference to the accepted hotfix. Confirm P1/P2/P3 content counts and Progress writes through supported user UI, with pre/post fingerprints.
- [ ] Do not deploy to `/exec` or production until separate browser/functional and data-preservation acceptance.

**Status:** R1 local source/mock QA completed. Staging and production **unchanged**, live acceptance pending.
