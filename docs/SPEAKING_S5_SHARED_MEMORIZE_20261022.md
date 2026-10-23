# S5 — Shared Memorize LV1–LV3 for Speaking Part 4

Date: 2026-10-22 · Project: APTIS B2 Coach · Status: **IMPLEMENTED / SOURCE + MOCK QA PASS / STAGING BROWSER ACCEPTANCE PENDING**

Branch: `refactor/speaking-shared-memorize-s5-20261022`; created from user-approved S4 branch `refactor/speaking-shared-audio-s4-20261022`.

**Isolation:** No merge/deploy, no production Web App v74 update, no Phase 2.3 RC update, no changes to Google Sheets, media, Script Properties, migration, Apps Script backends or data schema.

## 1. Source-derived method and content contract

- Speaking Part 1 already uses interactive LV1–LV2 word cloze (existing hiding cadence every 5th/every 2nd word) and LV3 audio-supported full dictation. **Its original cadence and teacher content are preserved.**
- Speaking Parts 2–3 already use interactive LV1–LV2 word cloze (every 5th/every 3rd eligible word) and LV3 audio-supported full dictation, with per-question Check and Show answer. **Their existing cadence and per-question behavior are preserved.**
- Part 4 previously had formula cues / no-help text, with a hidden study select and no interactive fill-in workflow. S5 replaces only the Part 4 **Memorize** view with the existing P2/P3-style interactive activities for each Q1/Q2/Q3. It does not rewrite any teacher model answer or change Test.

S5 behavioral contract:
- **Learn:** complete teacher model and shared Play/Pause/Stop for each Q1/Q2/Q3; original highlighted reusable formula remains.
- **Memorize LV1:** one missing word at every 5th eligible word, per question; type and Check, Show answer only on request.
- **Memorize LV2:** one missing word at every 3rd eligible word, otherwise same behavior.
- **Memorize LV3:** Play/Pause/Stop each Q, write complete model from listening, Check gives existing word recall percentage, Show answer on request.
- **Test:** no teacher answer markup or answer playback generated.
- Switching LV1/LV2/LV3 or Q/topic does not automatically save Mastery or create Attempts. Memorize drafts are kept **in memory for the browser session only**, keyed by topic/Q/level; not in Sheets/localStorage.
- **My mastery / Save mastery** remain separate manual confirmation controls and use the unchanged backend. Timer is not altered.

## 2. File changes and owner isolation

| File | Specific change |
| --- | --- |
| `JS_Speaking.html` | Introduce pure shared `AptisSpeakingMemorize` API `plan(answer,level)`, `normalize(value)`, `recallScore(answer,attempt)`. Parts 2–3 now invoke this same cloze/recall algorithm instead of duplicating it. Part 1 also invokes shared normalizer and recall scorer while retaining original LV1/LV2 blanks logic (every 5th/every 2nd word). Scope Part1–3 `.level-btn` handlers to `#memorizeMode .level-btn` so they cannot hijack Part 4 LV buttons. |
| `ViewSpeakingPart4.html` | One LV1/LV2/LV3 level group directly below the already shared Learn/Memorize/Test tabs. Same `.memorize-levels` and `.level-btn` visual classes. |
| `JS_SpeakingPart4.html` | Separate `studyStep` and `memLevel` client state, P4 topic/Q/level draft cache, `p4RenderMemorize_` for three independent interactive Q cards, mode-specific render switch, LV1–LV3 click binding limited to `#p4MemorizeLevels`. LV3 inherits the S4 shared audio session via existing P4 delegated Q audio event handler; Test data visibility guard remains. |
| `Styles_Speaking.html` | Minimal P4 responsive layout adjustments while inheriting the original shared `.p1-cloze-input`, `.p2-cloze-line`, `.p2-dictation`, `.p2-memory-actions`, `.level-btn`, question cards and audio buttons. |
| `tests/SpeakingSharedMemorize_S5_ReadOnly.gs` | 41 read-only content/code invariants for all four Parts and no data mutation. |

No changes to `SkillSpeaking*.gs`, `Progress.gs`, `Migration.gs`, `Config.gs`, Google Sheets or existing P4 teacher models.

## 3. QA evidence (branch source, tool simulations; NOT browser E2E)

- New S5 `testSpeakingSharedMemorizeS5ReadOnly()`: **41/41 PASS**, failed `[]`.
- S4 audio source regression **33/33 PASS**.
- S3 Topic Detail regression **30/30 PASS**.
- S2 Shared Layout regression **24/24 PASS**.
- P4 full-source regression **17/17 PASS**.
- Total **145/145 static source checks PASS**; JS syntax of shared and P4 files PASS.
- Pure Memorize planner compared against original P2–3 algorithm for LV1/LV2: exact plan parity; input teacher text reconstructed unchanged; shared scorer gives 100% for exact text, a partial percentage for partial recall, and 0% for unrelated content.
- Mock DOM rendering for a three-question Part 4 topic: **3 question cards** LV1, more blanks in LV2, **3 LV3 dictation textareas and 3 shared-audio groups**, incorrect response produces `0/n` feedback, drafts restored when toggling level, Test renders no teacher model text.
- Mock Speaking initialization: exactly **1** bootstrap request and one click listener on each original P1–3 Memorize level button, without error.
- These tests do **not** prove physical voice playback or layout in a real browser.

## 4. Staging release acceptance (operator action)

1. Pull only `refactor/speaking-shared-memorize-s5-20261022` into **isolated Part 4 Apps Script QA**. Confirm QA workbook/media Script Properties are not production IDs.
2. Run `testSpeakingSharedMemorizeS5ReadOnly()`, `testSpeakingSharedAudioS4ReadOnly()`, `testSpeakingSharedTopicS3ReadOnly()`, `testSpeakingSharedLayoutS2ReadOnly()`, `testPart4FullSourceHardQAReadOnly()`. Expect 41/41,33/33,30/30,24/24,17/17.
3. Open staging `/dev`; Part 1=49, Part 2=51, Part 3=52, Part 4=51 if same approved QA content used.
4. In P4 Topic Detail choose **02 Memorize**. Verify **LV1, LV2, LV3** directly below tabs; LV1 fewer missing words than LV2; Q1–3 independently editable.
5. Type an incorrect missing word, click **Check Q1** and verify feedback; enter correct response, repeat; **Show answer** reveals original teacher model only on click. Change LV2 then back to LV1; draft restores.
6. In LV3, Play/Pause/Stop audio for each Q via global top Speaking **♪ Voice settings**, type the full answer, Check and Show answer; Q1 playback stops when Q2 starts.
7. Switch to **01 Learn**: original highlighted teacher answer/audio restored. Switch to **03 Test**: no teacher model/audio in DOM. Reenter Memorize: return to last selected level/drafts.
8. Check topic navigation, Reload, responsive 1440/1024/768/390/320, bottom navigation, browser console, and existing Part 1–3 Memorize workflows. Verify no automatic Mastery changes or writes during view switches/Check.
9. If testing manual **Save mastery**, do so **only on QA workbook** and confirm idempotency separately. No production writes.

## 5. Next step proposal (requires separate user confirmation)

**S6 — Shared Timer & Manual Completion QA:** normalize timer component/durations across P1–4 while preserving each Part's exam cadence and only allow learner-confirmed progression. Prepare a separate isolated branch/PR *after S5 browser acceptance*. Do not include changes in Phase 2.3 RC or production without dedicated cross-skill integration gates.
