# S6 — Shared Timer & Manual Completion

Date: 2026-10-22 · Source branch: `refactor/speaking-shared-timer-s6-20261022` (based on user-accepted S5).

**Status: IMPLEMENTED + SOURCE/MOCK QA PASS; ISOLATED /dev BROWSER QA PENDING.**

No `main`, Phase 2.3 RC, production Apps Script/Web App v74, or production Google Sheets changed. No `.gs` application backend/schema/API/migration changes. No PR merge/deploy.

## Source audit and why S6 is needed

Previously, Part 1–3 Test mode implemented its own `state.timerId` interval, 30 seconds for Part 1, 45 seconds for Part 2/3 (using existing `state.data.app.timers` config when available); timer UI was hidden inside the Test panel. Part 4 had a separate 60-second preparation → 120-second speaking timer using `S.deadline` and another `setInterval`, shown below all questions. Both used different button sizes/styles. Part 1–3 directly saved `learned` when the learner clicked Mark learned; Part 4 directly saved the selected level when clicking Save mastery. Auto timer finish itself did not save, and that safety policy must continue.

## S6 implementation ownership

| Source | Action |
| --- | --- |
| `JS_Speaking.html` | Adds one exported, reusable `window.AptisSpeakingTimer` factory: `create(onTick,onDone)`, `start(seconds)`, `pause()`, `resume()`, `stop(reset)`, `snapshot()`, `format(seconds)`. Accurate elapsed duration uses `Date.now()`, not interval count. One active timer across all Parts; starting another stops the old one. The core has NO Sheets or save calls. P1–3 now use this timer. Existing `finishSelfRating`, `saveProgress`, `saveAttempt` semantics remain. Adds `window.AptisSpeakingCompletion.confirm` modal controller, which calls a persistence callback only after an explicit Confirm click. |
| `ViewSpeaking.html` | Moves ONE existing timer panel outside Test-only panel so the same 30s/45s timer is available in Learn/Memorize/Test; adds Pause and timer stage, retains original self-rating area in Test; adds one confirmation dialog. |
| `JS_SpeakingPart4.html` | Uses shared timer for 60s prep and 120s speaking. Resume/pause handles each stage; prep auto advances to speaking only when prep fully expires; stopping in prep cancels without a completed attempt or stale review; stopping/finishing speaking shows review but does NOT save. Existing Save practice still requires click. Part 4 Save mastery now invokes the same explicit confirmation overlay before calling the **unchanged** backend `saveSpeakingPart4Mastery`. Stale-topic confirmation is rejected. |
| `ViewSpeakingPart4.html` | Same shared timer component with Start preparation / Start speaking / Pause↔Resume / Stop, time status and progress bar. Keeps the separate P4 user-selected mastery level and original practice-review UI. |
| `Styles_Speaking.html` | One responsive `.speaking-practice-timer`, `.speaking-timer-actions`, `.speaking-completion-actions`, and confirmation overlay style used by all four Parts. |
| `Styles_SpeakingPart4.html` | Deletes competing sticky Part4 timer and button styling. |
| `tests/SpeakingSharedTimer_S6_ReadOnly.gs` | 43 read-only invariants for timer ownership, phase transitions, button/markup parity and explicit-save gates. |

## Timing and manual save policy — frozen

- Part 1: 30 seconds per response (existing app config takes precedence).
- Part 2: 45 seconds per response (existing app config takes precedence).
- Part 3: 45 seconds per response (existing app config takes precedence).
- Part 4: 60 seconds preparation, then 120 seconds for the *three* questions (not 120 seconds per question). Preparation auto-transition is preserved when the timer reaches zero.
- **Start/Pause/Resume/Stop/timeout does not create Progress, Mastery or Attempt rows.**
- Part 1–3: explicitly choosing self-rating in Test still invokes the existing `finishSelfRating` policy; clicking Mark learned now requires a second explicit confirmation, then existing `saveProgress(5,'learned')`.
- Part 4: clicking Save mastery requires an explicit confirmation and invokes existing `saveSpeakingPart4Mastery`; existing manual Save practice retains its own click gate. Neither is triggered by timer finish.
- Swapping Part/topic/mode, refreshing, and entering another module must not retain an active orphan timer or copy status to the new topic.

## QA performed against GitHub branch source

- S6 `testSpeakingSharedTimerS6ReadOnly()`: **43/43 PASS**.
- S5 `testSpeakingSharedMemorizeS5ReadOnly()`: **41/41 PASS**.
- S4 `testSpeakingSharedAudioS4ReadOnly()`: **33/33 PASS**.
- S3 `testSpeakingSharedTopicS3ReadOnly()`: **30/30 PASS**.
- S2 `testSpeakingSharedLayoutS2ReadOnly()`: **24/24 PASS**.
- Prior Part4 full-source regression: **17/17 PASS**.
- TOTAL **188/188 static checks PASS**; JS syntax and HTML tag balance verified.
- Clock simulation (fake Date and interval): Start 30s → +10s → Pause → elapsed wall-clock while paused does not consume remaining time → Resume → finish once. Starting Part B cancels Part A; no running interval remains.
- Part4 simulation (60s prep/120s speaking): pausing prep at 40s remaining and advancing simulated time does not count down; prep auto-advances to speaking; speaking auto-finishes with 120 seconds; canceling preparation hides stale review and creates no session; manually stopping speaking after 33 seconds captures 33 seconds and displays review only.

These are source checks/simulations, **not physical Chrome/mobile acceptance, live QA data validation or real backend-saving tests**.

## Manual staging acceptance checklist

1. Pull `refactor/speaking-shared-timer-s6-20261022` into the isolated Apps Script **QA** project. Verify `APTIS_DATABASE_ID` and `APTIS_MEDIA_FOLDER_ID` resolve only to disposable QA resources; do not edit production.
2. Run read-only `testSpeakingSharedTimerS6ReadOnly()`; expect `ok:true`, `totalChecks:43`, `failed:[]`. Re-run S5/S4/S3/S2/P4 suites (41/33/30/24/17).
3. Open Web App QA **/dev**. Verify home libraries and topic details for Part 1–4 load; no duplicate headers, progress/voice controls or timer.
4. On Part 1 Topic Detail, test timer in Learn, Memorize and Test: Start (30s) → Pause → Resume → Stop. Stop before expiry must not automatically mark learned. Test self-rating still works only when clicked.
5. On Part 2/3, use Q1 then Q2 to check **45s for each question**, timer resets on prompt navigation, no overlap or orphan interval.
6. On Part 4, Start preparation (01:00) → Pause → Resume → automatic transition to 02:00 Speaking, then Stop; verify Learn/Memory text stays visible in those modes and Test hides teacher answer, irrespective of timer.
7. Stop Part4 during preparation: no Finished attempt and no Review. Stop during speaking: Review appears, **no save** until explicit Save practice.
8. Click **Mark learned** (P1–3) and **Save mastery** (P4): shared confirmation opens; Cancel must not save; Confirm triggers only the original endpoint. Test persistence only on isolated QA Sheet, never production.
9. Check desktop/mobile (1440/1024/768/390/320), bottom nav overlap, hidden modes, voice playback interruption and no console errors.
10. Confirm Writing, Reading, Listening navigation unaffected (no backend changes). Record browser screenshots and actual QA data row checks before accepting S6.

## Next recommendation — only after explicit acceptance

**S7: Speaking final cross-Part UI & data-integrity QA, then isolated Phase 2.3 RC integration plan.** Verify Practice/Test/Timer/Audio/Mastery/Progress and Writing/Reading/Listening with a disposable workbook. Prepare a conflict-resolution PR and rollback; **do not merge/deploy production without a separate approval**.


## S6.1 — Deep source QA after staging reported 41/43 (2026-10-22)

**Original report:** `timerFactoryDoesNotWrite`, `part4StopDoesNotSave` failed on Apps Script staging. Direct GitHub source originally passed 43/43. Real staging source was NOT retrieved by the connector; therefore no claim of live staging equivalence.

**Root-cause mechanism reproduced exactly:** Previous source-only test sliced JS files at two English *comment* markers. When both end comments are changed/absent, `indexOf()` returns `-1` and `slice(start,-1)` reaches unrelated valid progress/mastery save handlers. The test then gives the exact **41/43** result and the same two failed names despite the timer functions having no save calls. This proves the test is vulnerable; whether staging has this exact comment drift must be checked with the new diagnostic.

**QA hardening:** In `tests/SpeakingSharedTimer_S6_ReadOnly.gs`, added `s6QaFunction_()` that extracts balanced named function scopes without comment-marker boundaries. Its missing/unbalanced functions fail closed. Checks now inspect only the shared factory and five P4 timer functions, with `s6QaForbiddenWrites_()`. Added read-only `diagnoseSpeakingSharedTimerS6ReadOnly()`, which prints source lengths, old marker presence/positions, function-extraction results and any forbidden write token detections.

**Negative tests:** On latest GitHub source the revised QA passes with original comments (**45/45**) and when both comments are deliberately renamed (**45/45**). Injecting an actual `saveProgress()` call inside the shared timer factory makes the correct guard FAIL. No production data or service calls were needed.

**Additional genuine lifecycle defect identified and fixed on S6 branch:** Opening Part 4 while a Part 1–3 timer is active previously did not immediately stop that clock (P4 only stopped it when starting another clock). Added a `stopActive()` method to the already-shared timer controller and invoked it inside Part 4 `open()`. Mock timer regression confirms the former interval is canceled and status resets to idle. Two new read-only checks prevent this from regressing.

**Current branch QA:** S6 45/45 + S5 41/41 + S4 33/33 + S3 30/30 + S2 24/24 + P4 regression 17/17 = **190/190 PASS** in source-harness tests. Client JS syntax checks PASS. This is not yet the Apps Script staging `/dev` acceptance.

### Correct staging action

1. In the **isolated** `APTIS_B2_PART4_UI01_STAGING` Apps Script project, pull `refactor/speaking-shared-timer-s6-20261022` (do not pull into production).
2. Run `diagnoseSpeakingSharedTimerS6ReadOnly()` first. This is strictly source-only. Inspect whether the old comment markers were absent on that staging copy; a `-1` value supports the root-cause hypothesis.
3. Run `testSpeakingSharedTimerS6ReadOnly()` and expect `ok:true`, `totalChecks:45`, `failed:[]`.
4. Reconfirm runtime timer handoff Part1/2/3 → Part4 and that Cancel/Stop never saves. Test all writes only against QA workbook. Do NOT merge, release or deploy production.

**Release gate remains CLOSED** until staging source and browser QA pass.
