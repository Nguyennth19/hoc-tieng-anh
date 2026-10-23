> **S7.1-B updated after staging 117/117 PASS (23 Oct 2026).** The read-only browser probe is now v2. Chrome DevTools must execute the probe in the **`userHtmlFrame` JavaScript context** in Apps Script `/dev`, not the top-level frame. Paste the code in `tests/SpeakingS71BrowserProbe.md` once, then use `S71QA.run()` after each manually selected Learn, Memorize LV1, Memorize LV2, and Test state for Part 1–4. Use `S71QA.report()` for the 16/16 observational coverage. **Sound, user clicks, reload, and Progress/Mastery writes must be checked manually**. Do not install this browser script as an Apps Script `.gs` file.

# S7.1 — Deep Regression Acceptance Protocol (Speaking Part 1–4)

**Status:** QA staging, not production. **Base:** accepted S6.4.  
**Guardrails:** Do not change Google Sheets, teacher answers, migration, backend policies, or production. No automatic marking Mastery. Run on `APTIS_B2_PART4_UI01_STAGING` using the latest branch `refactor/speaking-s71-deep-regression-20261023`.

## A. Automated read-only regression

In Apps Script staging, pull the S7.1 branch, run:

`testSpeakingS71DeepRegressionReadOnly()`

Expected on the unchanged S6.4 application: **117/117 PASS** (includes pure module execution and simulated Audio/Timer/Cache). Categories:

| Category | Checks |
|---|---:|
| Learn structure/topic | 9 |
| Audio integration | 8 |
| Timer contracts | 13 |
| Progress/Mastery save gates | 10 |
| Cache/startup contracts | 12 |
| Responsive CSS/DOM source guards | 8 |
| Audio runtime with silent TTS | 8 |
| Memorize LV1/LV2 runtime | 20 |
| Cache runtime (dedup, TTL, stale, invalid, isolated refresh) | 12 |
| Timer runtime (30/45/60/120, pause/resume, owner, reset) | 11 |
| Negative controls | 6 |
| **Total** | **117** |

Also rerun `testSpeakingStartupS64ReadOnly()` and `testSpeakingCompactTimerS63ReadOnly()`. Expected **27/27** and **45/45**.

### Mutation controls already verified in isolated QA (never applied to app/Sheets)

| Deliberate mutation | Detection |
|---|---|
| Disable Memorize Try again click | Both LV1 and LV2 reset tests FAIL |
| Let cancelled cache response overwrite newer response | Cache stale-response test FAIL |
| Reset paused timer to full duration | Pause/resume/timer completion tests FAIL |
| Remove Part 4 attempt save gate | Progress gate test FAIL |
| Remove Part 4 Learn model renderer | Learn model test FAIL |

The modified source was used **in memory only** during these controls.

## B. Browser visual/runtime QA — mandatory

Open the current Apps Script **/dev** staging URL on Chrome desktop. In DevTools Console, paste the entire source of **`tests/SpeakingS71BrowserProbe.md`**. The probe only reads DOM, geometry and shared client API. It does **not** click controls, play audio, use `google.script.run` or update localStorage.

Run the probe after each of the following state changes. Save the console output `SPEAKING_S71_BROWSER_RESULT` (or screenshot of text logs) for each state.

| Part | Learn | Memorize LV1 | Memorize LV2 | Test |
|---|---|---|---|---|
| Part 1 | Full paragraph + listen, Prev/Next | Check/wrong/correct/Try again/Show | Play/Pause/Stop, type/full recall/clear/reveal | 30-second clock; stop/pause/resume |
| Part 2 | Q1–Q3 full model + audio | Q1–Q3 separate answers & drafts | Q1–Q3 listen and full dictation | 45 seconds **per question**, switch Q |
| Part 3 | Q1–Q3 full model + audio | Q1–Q3 separate answers & drafts | Q1–Q3 listen and full dictation | 45 seconds **per question**, switch Q |
| Part 4 | Q1–Q3 teacher model + audio, Prev/Next topic | Q1–Q3 separate Check/Retry/Reveal | Q1–Q3 audio and dictation | 60s preparation then 120s speaking; pause/resume/stop |

Test at widths **360px**, **768px**, and **desktop at least 1200px**. A console result with overlapping controls, page horizontal overflow, or visible Timer during Memorize is a real QA issue. Inspect visible typography and confirm expanded teacher answers are readable.

### Persistence safety checks (on dedicated staging/test progress records only)

- Record current Progress/Mastery before entering Memorize.
- Perform Check, Try again, Show answer in LV1 and LV2: **Progress/Mastery must remain unchanged**.
- Navigate topics/Parts: no automatic saved attempt or Mastery change.
- In Learn, open Mark learned / Save mastery but **Cancel**: no write. Only an explicit **Confirm** should save.
- In Test, running/pausing/stopping Timer does not save. Only an explicit rating or Save practice with a finished session can save.
- After an authorized test save, refresh the topic/progress and verify the expected change only; compare other unrelated records.

### Cache and startup safety

- Warm reload: return to the same usable content; no infinite loader.
- Force refresh: updated data only, original answers intact, no Progress/Mastery reset.
- Switch P1→P2→P3→P4→P1 and navigate topics; no lost questions or client exceptions.
- Disconnect network in DevTools only after warm content is cached, reload, then reconnect. Verify last-good behavior where the part-specific cache permits it; no unbounded spinner.
- If the Apps Script service never responds, the P1–P3 hard timeout shows a readable error after 30 seconds. A later valid response may still recover.
- Close DevTools network override after testing. Do not clear stored progress or production caches.

## C. Acceptance criteria

S7.1 is **accepted** only when all of the following hold:

1. Apps Script read-only suite **117/117 PASS**, S6.4 **27/27**, S6.3 **45/45**.
2. Live /dev browser tests pass all four parts (including LV1/LV2, 3-question topics, audio controls, timer, topic navigation).
3. Chrome responsive checks at 360/768/1200px show **no actionable overlap** or horizontal page overflow.
4. Progress/Mastery remains unchanged without explicit learner action.
5. No stuck Loading, failed Cache fallback, unhandled JavaScript exception or automatic migration/write.

**If any browser failure occurs, keep this branch in Draft**, report the exact Part/mode/topic/viewport/console error, repair on the S7.1 branch and rerun all regression tests. Do not mark production ready based solely on source/synthetic tests.
