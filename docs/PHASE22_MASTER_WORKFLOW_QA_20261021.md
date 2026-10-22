# Phase 2.2 — Master workflow QA (STAGING ONLY)

Scope: user-confirmed speaking + writing; Q1/Q2/Q3 individual progress; Master button **only in Test**; Learn/Memorize unaffected.

## Automated read-only
In staging Apps Script, open `tests/Phase22_MasterWorkflowRegression.gs`, run `phase22TestMasterWorkflowReadOnly()`. Expect `ok:true`, `totalChecks:12`, empty `failed`. Do not rerun migration.

## Manual functional regression
1. Staging /dev preview with latest refactor code; Part 2 EX topic (then Part 3 EX topic).
2. Learn and Memorize: Master control hidden. Test: Q1/Q2/Q3 selectors, status ○ or ✓, Master control centered and refers to selected Q.
3. Q1: confirm after speaking and writing; expect backend-confirmed popup 1/3, then close. Do not expect full topic Mastered.
4. Select Q2; click Master; expect 2/3. Select Q3; click Master; expect 3/3, Topic mastered. Dashboard topics mastered increments by exactly one.
5. Reload staging; revisit topic; statuses Q1/Q2/Q3 remain ✓ and full topic count persists.
6. Revisit already mastered Q1: button disabled; no new review increment. Direct duplicate save on backend also idempotent.
7. Repeat Part 3. Verify Part 1 continues to save in Test; Part 4 unaffected.
8. Ensure QA workbook PROGRESS has distinct prompt IDs per topic (e.g., SP2-EX-001-1/2/3). No production writes.
9. Verify popup is absent if backend fails or returns invalid payload. Verify navigation and mode changes restore button visibility correctly.
10. Record screenshots and before/after QA PROGRESS row count, totals, and response status; do not merge until all pass.

Known: Dashboard percentage counts fully mastered **topics**; one mastered response does not change topic percent. Read-only QA does not prove UI/Sheet integration; manual tests are required.
