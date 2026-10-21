# Phase 2.1 — Backend cache safety QA (2026-10-21)

Branch: `refactor/speaking-backend-phase1-20261021`  
Source: current `SkillSpeaking.gs` cache helper functions `speakingCacheRead_` and `speakingCacheWrite_`.  
Test suite: `tests/SpeakingBackendSafety_Phase21.gs`.

## Result
**13/13 PASS** on 2026-10-21 with the actual helper function source dynamically evaluated against in-memory mocks. Stubbed `Utilities.getUuid()`; mocked CacheService get/put/remove and a mock Sheet reader. No live Google services, workbook, or production sheets were accessed.

1. Chunked payload roundtrip, Q1–Q3 preserved — PASS
2. Cold cache falls back to mock Sheet — PASS
3. Warm cache skips Sheet read — PASS
4. Corrupt manifest JSON — PASS
5. Invalid manifest — PASS
6. Missing chunk — PASS
7. Length mismatch — PASS
8. Invalid chunk JSON — PASS
9. CacheService get exception — PASS
10. CacheService remove exception — PASS
11. CacheService put exception — PASS
12. Partial write before manifest — PASS
13. Unicode multi-chunk roundtrip — PASS

## Scope / limitations
This is **unit testing**, not production Apps Script integration testing.
- The fallback uses a test adapter, not live `getBootstrapData`; full bootstrap and schema/migration integration are **not yet verified**.
- CacheService quota/eviction, parallel calls, real Apps Script execution limits, and timing are **not covered**.
- Migration safety, Part 3 data integrity, progress/attempt persistence and content performance remain Phase 2.2/2.3 gates.
- The `tests/` file is a GitHub-only test artifact. Do not assume Google Apps Script deployment or sync tools load nested .gs test files. Keep tests out of production.
- No production data changed and no merge to main.

## Next
Run Phase 2.2 exclusively against a disposable Sheet copy. Require production IDs and full Q1–Q3/content fields to match baseline exactly. Ensure empty P3 migration fails without reseeding. Collect integration timings from staging before release.
