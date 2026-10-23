# S6.3 — Shared Compact Timer & Mode Visibility (QA only)

**Date:** 2026-10-23  
**Branch:** `refactor/speaking-shared-compact-timer-s63-20261023`  
**Base:** user-accepted S6.2 branch `refactor/speaking-shared-layout-s62-20261022`  
**Current gate:** implemented and source/regression/synthetic Chromium checks PASS; **staging /dev visual/runtime acceptance still pending**.

## Accepted requirements

- One reusable Speaking Timer row for Part 1–4: **time on left, controls on right**; no center status text, label, progress bar, or extraneous instructions. Shared geometry/color/spacing in `Styles_Speaking.html`, never a separate Part 4 CSS timer.
- **Memorize** must have **no Timer** and **no Mark learned / Mastery** actions. Timer and existing learner-initiated completion controls remain accessible in Learn and/or Test, according to previously accepted per-Part persistence rules.
- **Do not change exam durations**, teacher models, Q-bank, audio, backend, cache, user Progress/Mastery semantics or writing behavior. Timer completion must never auto-save.

## Verified timing policy (actual source)

| Part | Timing boundary | Server source / frontend | Expected |
| --- | --- | --- | --- |
| Part 1 | Each individual question | `Config.gs:APP_CONFIG.PART1_TEST_SECONDS`; `currentTimerSeconds()` | **30 sec per Q** |
| Part 2 | Each of Q1/Q2/Q3, independently | `Config.gs:APP_CONFIG.PART2_TEST_SECONDS`; selecting Test Q calls `resetTimerDisplay()` | **45 sec per Q** |
| Part 3 | Each of Q1/Q2/Q3, independently | `Config.gs:APP_CONFIG.PART3_TEST_SECONDS` | **45 sec per Q** |
| Part 4 | Preparation for entire three-question Topic | `clock('prep',60)` | **60 sec preparation** |
| Part 4 | Speaking for entire three-question Topic | `clock('speak',120)` | **120 sec speaking Q1–Q3 together** |

`SkillSpeaking.gs` embeds Part 1–3 backend configuration in bootstrap. `window.AptisSpeakingTimer.defaultSeconds` matches 30/45/45/60/120. The timer engine continues using `Date.now()-startedAt`, unchanged Pause/Resume and a single active clock per page. **Not one 120-second timer per Part 4 question.**

## Changed files and safe boundaries

1. `ViewSpeaking.html`: compact common Timer row, keep clock ID `timer` and Start/Pause/Stop button IDs. Delete now-unneeded `testLabel`, `testInstruction`, `speakingTimerStage`, `timerBar`. Keep the independent `markLearnedBtn` and confirmation UI unchanged.
2. `ViewSpeakingPart4.html`: compact common row with `p4Time`, `p4Begin` (prep), `p4Next` (speak), `p4Pause`, `p4Stop`. Delete now-unneeded `p4Stage`, `p4TimerBar`, the long timer instruction and footer disclaimer. **Do not** remove `p4SaveMastery`, `p4MasteryLevel`, `p4Review` or its save workflow.
3. `JS_Speaking.html`: remove writes to deleted Timer DOM nodes (avoids `null.textContent` errors), replace dynamic instruction label with concise Start label, toggle Timer and completion footer off in Memorize through existing `setMode()`. Existing `currentTimerSeconds()`, start/pause/stop, per-Q selection, Progress, rating and confirmation handlers remain unchanged.
4. `JS_SpeakingPart4.html`: remove writes to deleted stage/progress nodes; `p4ApplyStudyMode()` handles hiding Timer/Mastery in Memorize and restoring them for Learn/Test while retaining existing explicit Save Mastery and Save Attempt endpoints. Completed practice review survives when returning to Learn/Test from Memorize. No backend changes.
5. `Styles_Speaking.html`: replaces duplicated vertical Timer rules with single responsive `speaking-practice-timer` grid, tabular numeric clock and right-hand controls. At <=650px actions wrap to a **2-column button grid** to prevent horizontal overflow; clock stays to the left. Deletes obsolete timeline bar CSS.
6. `Styles_SpeakingPart4.html`: deletes obsolete Part 4 disclaimer CSS; leaves only topic-unique rules.
7. `tests/SpeakingSharedTimer_S6_ReadOnly.gs`: retains all original runtime/save gates, updates three intentionally superseded progress-bar/layout expectations.
8. `tests/SpeakingCompactTimer_S63_ReadOnly.gs`: new source/geometry/timing/visibility regression (45 checks).

## QA results

| Gate | Result |
| --- | --- |
| S6.3 compact Timer | **45/45 PASS** |
| S6.2 shared layout | **38/38 PASS** |
| S6.1 shared cache | **43/43 PASS** |
| S6 timer semantics | **45/45 PASS** |
| S5 memorize | **41/41 PASS** |
| S4 audio | **33/33 PASS** |
| S3 topic detail | **30/30 PASS** |
| S2 layout | **24/24 PASS** |
| Part4 full-source | **17/17 PASS** |
| **Total source regression** | **316/316 PASS** |

Additional isolated runtime checks:

- Deadline-safe shared Timer exercised with a simulated clock: 45 sec → advance 15 sec → 30 sec remain → Pause 20 sec → still 30 sec → Resume 30 sec → completion triggered **once**. PASS.
- Isolated client mode state: Part 2/3 Memorize hides Timer/completion; Test restores them. Part 4 Memorize hides Timer/Mastery, Learn restores both, Test shows Timer and hides Mastery. PASS.
- Chromium/Playwright **synthetic Timer fixture**, viewports 320/390/650/768/1024/1440/1680: no horizontal overflow; clock on left; all buttons within row/container; hidden Memorize Timer not displayed. **This is not the full Apps Script app.**
- Edited `JS_Speaking.html` and `JS_SpeakingPart4.html` syntax accepted in V8-compatible parser.

## Staging /dev acceptance steps

In **`APTIS_B2_PART4_UI01_STAGING` only**, with disposable QA database/media Script Properties verified:

1. Pull `refactor/speaking-shared-compact-timer-s63-20261023`. Do not merge to RC Phase 2.3, main or production v74.
2. Run `tests/SpeakingCompactTimer_S63_ReadOnly.gs → testSpeakingCompactTimerS63ReadOnly()`: expect `ok:true`, `totalChecks:45`, `failed:[]`. Re-run `testSpeakingSharedTimerS6ReadOnly()` for save-policy guard (45/45).
3. Open QA Web App `/dev`; verify Part 1/2/3/4 **Learn** shows compact left-clock/right-buttons Timer, no status, progress bar or instruction. Confirm color/height/spacing on PC and phone.
4. Switch to **Memorize** in each Part; Timer and `Mark learned` / `Save mastery` must disappear, and memorization input/audio/check/reveal must still work. Switch back to Learn and Test; Timer and any applicable completion control must return.
5. Verify times **individually**: Part1 00:30; Part2 and Part3 Q1→Q2→Q3 each start 00:45 and reset on changing Test Q; Part4 first 01:00 preparation, auto-advance to 02:00 speaking for all 3 questions together. Part4 Speak Now jumps directly to 02:00 while remaining a manual action.
6. Test Timer Start/Pause (count does not change while paused)/Resume/Stop; navigation and mode switching stop old clock. No automatic Progress/Mastery change from any Timer action, including time-out.
7. On disposable QA only, verify manual `Mark learned` and `Save mastery` still invoke their explicit confirmation dialogs and save only after confirmation; existing Mastery remains unchanged on navigation or testing Timer.
8. On mobile widths 320–390px, make sure the buttons stay to the right of the clock (they may occupy two rows), do not overlap the fixed bottom Part navigation and don't create horizontal page overflow. Recheck Learning/Memory/Test, audio, cache, and 49/51/52/51 Topic banks.
9. Confirm Chrome Console contains no new `Cannot set properties of null` exceptions; send screenshot of each Part's Timer in Learn/Test and one screenshot of Memorize.

## Release safety

**No edits to Config.gs, SkillSpeaking.gs, migrations, backend Progress/Mastery, Google Sheets, RC Phase 2.3, main or deployed production v74.** No merge/deploy is authorized.

## Proposed next milestone (requires user acceptance)

**S6.4 — Shared Memorize 2 Levels**: one LV1 word fill and one LV2 listening/full-answer dictation across Part1–4, shared Check/Try Again/Show Answer controls, larger reveal text, no Timer/Mark learned within Memorize.
