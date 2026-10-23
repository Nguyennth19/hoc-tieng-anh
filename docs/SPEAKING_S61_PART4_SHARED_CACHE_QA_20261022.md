# S6.1 — Part 4 Loading & Shared Frontend Cache Hard-Fix
Date: 2026-10-22
Branch: `refactor/speaking-p4-shared-cache-s61-20261022`
Base: `refactor/speaking-shared-timer-s6-20261022`

## Delivery and safety boundary

**Branch-implemented; GitHub read-only regression PASS; simulated browser network QA PASS; Apps Script staging /dev user acceptance pending.**

No changes to `main`, Release Candidate Phase 2.3, production Apps Script/Web App v74, production database, Google Sheets, Drive folders, migration or server-side `.gs` application files. Keep QA-only files out of production.

## Verified root cause

- Part 1–3 hydrate from versioned localStorage bootstrap, show usable cache first, and check revision in the background.
- Part 4 previously owned `P4_CONTENT_CACHE={learn:null,exam:null}` with a 120,000 ms TTL. Every `open()` called `load()`, whose first actions showed `Loading Part 4 data...` and cleared `p4Content` **before** consulting that cache.
- The old `p4ApplyPayload_()` called `p4RefreshMastery()` on each content application; mastering 51 rows could trigger a redundant backend call even on an otherwise valid content cache.
- Learn and Exam/Test have different backend eligibility semantics; an unapproved Learn draft must never become Exam data by reusing the wrong cache entry.

## Implemented design (reuse shared code; do not fork again)

`JS_Speaking.html`: `window.AptisSpeakingCache` is the **single owner** of read/write/clear, validation, time-to-live/fallback, concurrent-request deduplication and read-only request counters. Existing P1–3 primary/backup cache keys remain unchanged; their cache wrappers now delegate to this shared owner. The existing manifest version check for P1–3 remains unchanged.

`JS_SpeakingPart4.html`: removed private 120-second `P4_CONTENT_CACHE` and corresponding constants. Part 4 now delegates to `window.AptisSpeakingCache`, retaining only mode-specific cache-key names, content validation, Google Apps Script endpoint adapters and explicit per-topic render functions. The `learn` payload must have exactly **51 unique, complete Q1–Q3 sets with all three teacher models**. `exam` has a separate key and must satisfy server-provided `APPROVED`/`releaseApproved` gate, with no Learn → Exam fallback. Cached P4 content has the same freshness policy as P1–3: 6 hours fresh / up to 7 days last-good; stale content renders immediately while being refreshed in the background. Explicit Refresh invalidates P4 content (both modes), not P1–3's content.

Mastery remains logically and physically separate from content: 51 unique valid rows, **90 seconds fresh**, up to 10 minutes fallback, memory-only to avoid long-lived progress snapshots. New Mastery is applied on successful backend refresh; write success invalidates Mastery cache only. Progress/Attempt/Mastery backend functions unchanged. No synthetic zeros when live Mastery is unknown.

Safe concurrency: in-flight same-key requests share a single backend call; navigated-away responses may fill validated cache but cannot rewrite an obsolete view (request sequence guard). A background content response cannot interrupt preparation/speaking. A return to an already-cached view does not reset its Topic/timer. The read-only `window.AptisSpeakingPart4.qaCacheInfo()` reports requests per content mode and Mastery, topic count, content mode and active requests; it does **not** expose teacher content or user progress.

## Automated QA

- `testSpeakingPart4SharedCacheS61ReadOnly()`: **41/41 PASS**
- S6 Shared Timer: **45/45 PASS**
- S5 Shared Memorize: **41/41 PASS**
- S4 Shared Audio: **33/33 PASS**
- S3 Shared Topic Detail: **30/30 PASS**
- S2 Shared Layout: **24/24 PASS**
- Part4 Full Source HardQA (updated to require shared cache rather than the deleted private cache): **17/17 PASS**
- Overall source checks: **231/231 PASS**; both modified JavaScript templates parse.
- Isolated manager simulation: valid 51 items, fresh/stale read, validation rejection, safe invalidation, concurrent requests deduplicated to one backend call.
- Frontend source executed with a mocked DOM and simulated Google Apps Script callbacks: **51 library cards in every step**, no mock runtime exceptions.

### Simulated network sequence — cumulative calls

| Action | getSpeakingPart4Dev(learn) | getSpeakingPart4Dev(exam) | getSpeakingPart4Mastery |
|---|---:|---:|---:|
| Initial Learn | 1 | 0 | 1 |
| Close/reopen | 1 | 0 | 1 |
| Memorize | 1 | 0 | 1 |
| Return Learn | 1 | 0 | 1 |
| First Test | 1 | 1 | 1 |
| Return Learn | 1 | 1 | 1 |
| Test again | 1 | 1 | 1 |
| Explicit Force Refresh while Test | 1 | 2 | 2 |

**Important:** This verifies mocked transport behavior, not live Apps Script latency, network calls, datastore or browser persistence. It is also expected that the *first* Test entry requires one server call to enforce Exam approval.

## Exact staging acceptance actions

1. In the isolated staging Apps Script project `APTIS_B2_PART4_UI01_STAGING`, confirm `APTIS_DATABASE_ID` and Part4 QA database references still target **QA/disposable resources only**. Do not pull into production. Pull the branch `refactor/speaking-p4-shared-cache-s61-20261022`.
2. Execute **`testSpeakingPart4SharedCacheS61ReadOnly()`** in `tests/SpeakingPart4SharedCache_S61_ReadOnly.gs`; expect `ok:true`, `totalChecks:41`, `failed:[]`. Optionally re-run S2–S6 + Part4 QA (231 total).
3. Open staging `/dev` and use the browser console: `window.AptisSpeakingPart4?.qaCacheInfo?.()`. Note: if the app is inside a Google Apps Script iframe, open console in the app's actual frame; this is read-only and returns counts only.
4. On a fresh QA tab, open Part4 Learn: 51 Topic cards, no missing Q1/Q2/Q3. Expected first requests: content Learn 1, Mastery 1.
5. Switch to Part1, then Part4 again, and toggle Learn/Memorize: no new content request while cache is fresh; Topic view should not flash `Loading Part 4 data...`.
6. Visit Test for the first time: exactly one Exam content request; 51 Exam Topic cards if all QA rows are approved. Subsequent Test ↔ Learn toggles should produce no new Exam/Learn content calls.
7. On Part4 explicit Refresh, expect one additional content call for the active mode and one Mastery call; no P1–3 cache/data changes.
8. To test Mastery writing, use **QA database only**. Save one Mastery value, confirm one Mastery reload, no Part4 content reload, and persistence on reopening.
9. Repeat with browser reload and narrow/mobile viewport. Recheck P1=49, P2=51, P3=52 and Writing, Listening, Reading navigation. Validate no stale Learn model appears inside Test.
10. Return screenshots/logs plus calls from `qaCacheInfo()` to accept S6.1. If an error or blank screen appears, do not update production; report the exact /dev behavior.

## Next proposed stage (approval required)

**S6.2 — Shared Layout & Header Cleanup** after user approval: harmonize page width, Topic Detail header, Prev/Next and back navigation, reuse common CSS and remove competing Part4-only styles. No backend, Mastery or migration edits.

## S6.1.1 — Staging evidence and Bootstrap hard-fix (2026-10-22)

User browser evidence confirms `topicCount:51`, `masteryLoaded:true`, `inflight:[]`, and accumulated S6.1 counters `content:learn=2`, `content:exam=0`, `mastery:live=3`. These counters are **since page load** and do not reveal which user actions triggered them; they are not proof of redundant calls. No real Exam-mode visit was represented in those counters.

**Verified production-independent frontend defect in staging:** Chrome console reported `Uncaught TypeError: Cannot set properties of null (setting 'textContent')` at `applyBootstrap`, line 432. Direct GitHub source confirms that `JS_Speaking.html` dereferenced `$('appTitle')`, while current `ViewSpeaking.html` and `Index.html` no longer contain `id="appTitle"`. The obsolete write has been removed on **S6.1 branch only**; the page header is already owned by the shared AppShell / ViewSpeaking markup. No server/backend fix required. Additional source gates verify that this deleted DOM id is not dereferenced again.

**First visit latency:** Part 4 Learn first visit and Test first visit each fetch a distinct, server-validated resource (`getSpeakingPart4Dev('learn')` and `getSpeakingPart4Dev('exam')`). A cache **cannot eliminate network latency on a true first-ever request**. Once each mode is successfully cached, mode revisits use it without showing the Blocking Loading label. The current branch deliberately does not add global speculative prefetch from the home page, which would consume extra Google Apps Script quota, slow other modules and potentially increase server traffic. A separate *controlled* warm-up gate may be proposed if first-click latency remains unacceptable after safe staging QA.

Browser console `An iframe ... allow-scripts and allow-same-origin ...` is a browser warning about the Google-hosted execution environment, distinct from the real `appTitle` TypeError. No project code can categorically suppress that platform warning.

**Regression after S6.1.1:** 43/43 S6.1 + 45/45 S6 + 41/41 S5 + 33/33 S4 + 30/30 S3 + 24/24 S2 + 17/17 P4 hard QA = **233/233 PASS** in source harness; two edited frontend JavaScript assets syntax PASS. AppScript staging browser retest after pulling the latest branch is **pending**.

### Re-test instructions

1. Pull `refactor/speaking-p4-shared-cache-s61-20261022` into the QA-only Apps Script project.
2. Run `testSpeakingPart4SharedCacheS61ReadOnly()`; expect `ok:true`, `totalChecks:43`, `failed:[]`.
3. Reload the staging `/dev` (not production); verify Chrome Console has **no new `applyBootstrap` / `appTitle` TypeError**, then visit Part 1, 2, 3 and 4.
4. In the correct Apps Script iframe Console, run `window.AptisSpeakingPart4?.qaCacheInfo?.()` **before** each action and record content Learn, Exam and Mastery counters. On cached re-entry, Learn → Memorize and subsequent Learn/Test toggles, matching per-mode counters should remain unchanged. First Exam visit is allowed one call. Explicit Refresh necessarily increments its mode's counter.
5. On a fresh browser profile, expect initial cold content load latency; the acceptance test is **no redundant re-fetch and no blocking-loader flash after verified cache has been populated**. Do not alter Google Sheet production data to test caching.

**Release gate:** Do not claim final staging PASS until the user confirms the live app no longer throws, all 51 topics persist across reload, and cached navigation is nonblocking.
