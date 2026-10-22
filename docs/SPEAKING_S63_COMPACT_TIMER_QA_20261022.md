# S6.3 — Compact Shared Timer & Memorize Visibility (2026-10-22)

**Branch:** `refactor/speaking-compact-timer-s63-20261022`  
**Base:** user-accepted `refactor/speaking-shared-layout-s62-20261022`  
**Status:** source QA PASS, isolated timer/visibility simulations PASS; staging browser `/dev` user acceptance pending. **Do not merge/deploy production.**

## Approved scope and exact timing contract

One compact horizontal speaking timer: time **left**, buttons **right**. No separate visible stage/status, no timer progress bar, no repeated teaching instructions or extra footer disclaimer.

| Speaking Part | Preparation | Speaking timer | Reset rule |
| --- | --- | --- | --- |
| P1 | none | 30 seconds **per question** | reset when moving to another question |
| P2 | none | 45 seconds **per Q1/Q2/Q3** | each question is a separate timed response |
| P3 | none | 45 seconds **per Q1/Q2/Q3** | each question is a separate timed response |
| P4 | 60 seconds **per topic** | 120 seconds **for all three questions together** | one 60s→120s cycle for the full topic |

These are **existing** S6 rules, not changed by S6.3. Backend config still owns P1/P2/P3 timer values (`APP_CONFIG.PART1_TEST_SECONDS=30`, `PART2_TEST_SECONDS=45`, `PART3_TEST_SECONDS=45`); P4 uses its existing `clock('prep',60)` and `clock('speak',120)` flow. `AptisSpeakingTimer` remains the single shared timer factory.

## Mode visibility

| Mode | Timer | Manual completion |
| --- | --- | --- |
| Learn | show | show |
| Memorize (all LV1/LV2/LV3) | **hide** | **hide** |
| Test | show | existing per-Part visibility and save rules (P4 Mastery is still Learn-only) |

Shared `window.AptisSpeakingPracticeChrome.sync(card,mode)` is **one frontend owner** for timer + completion visibility. P1/2/3 call in `setMode()`, P4 calls in `p4ApplyStudyMode()` and before asynchronous test content requests. The caller only changes DOM `hidden` properties. It never saves progress, changes duration, calls backend or modifies teacher answers. Shared CSS makes `[hidden]` override older `display:flex`.

## Source changes

- `ViewSpeaking.html`: P1–3 clock and three action buttons only; removes `testLabel`, `speakingTimerStage`, `timerBar` and `testInstruction`.
- `ViewSpeakingPart4.html`: P4 clock and four buttons (Start preparation, Start speaking, Pause/Resume, Stop); removes `p4Stage`, `p4TimerBar`, timer instructional paragraph and redundant Part4 disclaimer.
- `Styles_Speaking.html`: common one-row layout with right-side button area, compact clock, robust `hidden`, 760px and 380px responsive controls. Mobile Part4 wraps its four controls into two columns **on the right** while clock remains left.
- `Styles_SpeakingPart4.html`: deletes obsolete disclaimer rules; no Part-specific timer geometry.
- `JS_Speaking.html`: removes writes to deleted DOM ids, adds shared mode visibility adapter, leaves 30/45s timer engine untouched.
- `JS_SpeakingPart4.html`: removes writes to deleted DOM ids and applies shared mode visibility; keeps two-phase 60/120 and save gates untouched.
- `tests/SpeakingSharedTimer_S6_ReadOnly.gs`: updates three old checks that required deleted progress/status bar to instead verify compact clock/no obsolete IDs.
- `tests/SpeakingCompactTimer_S63_ReadOnly.gs`: adds 45 read-only QA gates.

No changes to `Config.gs`, `Migration.gs`, `Progress.gs`, Media, any backend application .gs code, Google Sheets, GitHub `main`, RC Phase 2.3 or production v74.

## Automated QA

**316/316 read-only source checks PASS** in GitHub content evaluation:

- S6.3 **45/45**
- S6.2 **38/38**
- S6.1 **43/43**
- S6 **45/45**
- S5 **41/41**
- S4 **33/33**
- S3 **30/30**
- S2 **24/24**
- P4 Full Source **17/17**

Both updated JavaScript templates pass V8 syntax parsing.

### Isolated runtime simulation (not a live Google Apps Script browser test)

- Timer factory: start=45s, elapsed=15s, pause=30s left, remaining unchanged during 45s fake wall-clock while paused, resume=30s remaining, stop=0s; PASS.
- Part4 **real source timer functions** with fake clock: prepare 01:00→00:30, pause/resume without changing remaining, auto 60s→speak 02:00, auto 120s→finish 00:00, **no Mastery save** and no running interval remaining; PASS.
- Shared mode helper: Learn visible, Memorize both timer/completion hidden, Test visible; P4 Memorize also hides its own Mastery, P4 Test retains Learn-only Mastery gating; PASS.

## Mandatory live staging /dev QA before S6.3 acceptance

**Use Apps Script `APTIS_B2_PART4_UI01_STAGING` with QA-only Script Properties.**

1. Pull `refactor/speaking-compact-timer-s63-20261022`. Do not touch `main` or production.
2. In `tests/SpeakingCompactTimer_S63_ReadOnly.gs`, run `testSpeakingCompactTimerS63ReadOnly()`. Expect `ok:true`, `totalChecks:45`, `failed:[]`.
3. P1 Topic Detail: Learn shows **00:30** and buttons to the right. Start, Pause after 10s, Resume, Stop; Memorize hides timer and Mark learned in LV1–3; Test restores Timer.
4. P2, P3: for Q1, Q2, Q3 in Test, reset to **00:45** on changing each question; no cross-question countdown. Learn has timer; Memorize must hide timer and Mark learned for all levels. Do not validate a whole topic after only one Q.
5. P4 Topic Detail: Learn shows **01:00** preparation; Start preparation, Pause/Resume, then press Start speaking (or let preparation finish) → **02:00** for *all three questions*. Memorize hides timer and Mastery; Test shows timer but **never teacher model answers**.
6. In P4 Test/learn while speaking, text is hidden **only in Test**, not Learn. Stop during preparation must not record an attempt; Stop while speaking displays existing self-rating option but does not save without user's explicit confirmation.
7. Check desktop 1440/1024 and mobile 390/320: clock left and buttons right, no horizontal overflow, no bottom nav overlap, no redundant instruction/status/bar.
8. Re-run original S6–S6.2 read-only tests, review browser Console and browser refresh/cache behavior; confirm P1=49/P2=51/P3=52 and P4=51 QA topics. Verify no unexpected Google Script Properties or sheet writes.

## Next proposal (requires separate approval)

**S6.4 — Shared Memorize Two Levels**: LV1 fill missing words, LV2 listen and write complete answer, shared Check/Try again/Show answer; preserve teacher text, P2/3 Q progress and P4 Mastery. Do not proceed without S6.3 staging acceptance.
