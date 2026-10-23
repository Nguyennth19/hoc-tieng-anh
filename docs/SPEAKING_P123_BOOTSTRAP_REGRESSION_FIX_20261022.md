# Critical regression: Parts 1–3 stuck at "Preparing your study plan" (2026-10-22)

**Branch:** `feature/speaking-part4-ui-20261022` only. No production write, no merge/deploy.

## Root cause (reproduced)
When limiting shared Part tabs to the three selectors with `data-part`, a bad JS string replacement unintentionally changed `$$('.part-tab')` (array selector) into `$('.part-tab[data-part]')` (single-element selector), while retaining `.forEach(...)`. The application's `$ = id => document.getElementById(id)` returned no iterable, throwing **`TypeError: $(...).forEach is not a function`** inside `bindEvents()`. Initialization aborted *before* `getBootstrapData()` could be called. This explains the indefinite Speaking loader and affects P1–P3.

## Fix
All 3 shared selector accesses in `JS_Speaking.html` now use `$$('.part-tab[data-part]')`:
1. `bindEvents` click binding;
2. `switchPart` loading-state active tab update;
3. `switchPart` normal active tab update.

Part 4 still has its separate `[data-p4-home]` handler, so no NaN/fallback to P1.

## Regression evidence
- Compared against main: entire `JS_Speaking.html` is **byte-identical** to main after substituting only those three valid filtered selectors back to main selectors.
- A lightweight JavaScript DOM/bootstrap harness reproduced the **broken** source: zero `getBootstrapData` requests; `TypeError: $(...).forEach is not a function`.
- The **corrected** source with the same harness: **one `getBootstrapData()` call, zero initialization errors**, and Part 1 tab click listener bound.
- `tests/Part4_UI_FullSourceHardQA.gs` hardened to require exactly **three `$$('.part-tab[data-part]')` occurrences** and no singular-selector `.forEach` regression. The original static assertion erroneously allowed the broken selector.
- Full static source guard: **17/17 PASS**, `issues=[]`, 58 Part 4 ID references checked.
- This is a source/mock result; actual staging browser + Google Apps Script runtime must still be checked.

## Staging acceptance (without production changes)
1. Pull latest `feature/speaking-part4-ui-20261022` into `APTIS_B2_PART4_UI01_STAGING`.
2. Run **read-only** `testPart4FullSourceHardQAReadOnly()` (expect `ok:true`, 17/17).
3. Open staging `/dev`, hard refresh. Check Speaking Home P1, P2, P3 load and show practice banks; check P4 Home, Topic Library, Topic Detail and return to P1.
4. Check P1 49, P2 51, P3 52 active valid topics *if database source is the same accepted QA data*.
5. If loading persists, inspect the Apps Script Executions for `getBootstrapData`/migration or network failures; note that source-level tests do not prove backend access.
6. Keep `APTIS_DATABASE_ID` and media folder mapped to QA only. Do not write to production.
