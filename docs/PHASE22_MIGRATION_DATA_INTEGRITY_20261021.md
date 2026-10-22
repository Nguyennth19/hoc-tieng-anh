# Phase 2.2 — Workbook Copy & Migration Integrity (2026-10-21)

## Isolation
Source Phase 0 backup (NOT production): https://docs.google.com/spreadsheets/d/1gkq6RBQDtARL0v7jb5J_HT_5ZRAuYci1-lqE0lIsPoY/edit
Disposable QA copy: https://docs.google.com/spreadsheets/d/1yCG2GmoQ0ki9IpmoZeD_kKHN-RJHgUeX0d89UE19GxI/edit
Original production workbook was not modified.

## Pre-migration exact-value baseline
Both workbooks fetched via Sheets read-only range A1:AK1000 using FORMULA rendering. Compared complete 2D matrices, including IDs, blanks, values, and formulas. All six tabs matched exactly:
| Sheet | Nonempty data rows | Copy compared exactly |
| --- | ---: | --- |
| SPEAKING | 49 | PASS |
| SPEAKING_P2 | 64 | PASS |
| SPEAKING_P3 | 60 | PASS |
| PROGRESS | 4 | PASS |
| ATTEMPTS | 1 | PASS |
| SETTINGS | 13 | PASS |

Note: Physical bank rows (64 P2, 60 P3) are **not** the filtered UI topic counts (51 P2, 52 P3).

## Migration execution: NOT RUN (gate)
A Google Drive workbook copy is not itself an Apps Script staging runtime. Existing Apps Script code points at the production database via Config.gs. Never run `runMigrations()` without a separately bound staging script or a verified staging-specific database ID.

To complete:
1. Copy the Apps Script project into an isolated staging script, change only the staging script's spreadsheet ID to the QA copy, and independently verify `getDatabase_().getId()` matches the QA copy.
2. Take complete pre-migration snapshots of all tabs (values/formulas; compare media and settings separately).
3. On QA copy only, execute `runMigrations()` and capture the returned report and execution log.
4. Compare post-migration SPEAKING_P3, PROGRESS, ATTEMPTS exact matrix to pre-migration; zero modifications are expected for P3/progress/attempts if schema already current.
5. Also check SPEAKING and SPEAKING_P2/media/settings separately; current migration may intentionally upgrade P1 or P2 media/settings. Any unsanctioned content change is FAIL.
6. Create another QA copy, deliberately empty P3 there only, and verify fail-closed without P3 reseed. A thrown error alone does not prove atomic rollback; compare the entire workbook before/after and consider refactoring preflight validation ahead of mutating operations.
7. Never execute destructive legacy Part 3 upgrade manually.

## Status
Copy created: PASS
Pre-migration data equality: PASS (6/6 tabs)
Post-migration equality: PENDING (migration not executed)
Empty-P3 fail-closed behavior: PENDING
Phase 2.2 final verdict: NOT YET ACCEPTED.
