# S3 — Shared Speaking Topic Detail Foundation

Date: 2026-10-22
Branch: `refactor/speaking-shared-topic-s3-20261022` (created from user-approved S2 `refactor/speaking-shared-layout-s2-20261022`).
Scope: presentation structure, shared styles and listener ownership. **No migrations, Sheet edits, backend changes, production deployment or merges.**

## Goal and reusable ownership

Use the *existing* Part 1–3 Topic Detail visual primitives as the single Speaking Topic Detail **design contract**, not another Part 4-specific styling system.

| Component/owner | Parts 1–3 | Part 4 after S3 |
| --- | --- | --- |
| Shared header/navigation — `Styles_Speaking.html` | `.study-topline`, `.study-top-actions`, `.secondary-btn.study-nav-btn` | Same classes; `All topics` stays Part 4-specific but uses shared `.back-btn` |
| Study surface and badges — common stylesheet | `.study-card`, `.study-meta`, `.badge`, `.question-title` | Same classes; only data IDs differ |
| Three-step tabs — common stylesheet | `.mode-tabs.p1-three-steps` / `.mode-tab` | Same classes and 01/02/03 labels, different Part 4 `data-p4-step` handler |
| Question cards — common stylesheet | Part 2–3 `.p2-topic-card` | Part 4 `.speaking-question-card` shares **the identical CSS declaration** with `.p2-topic-card` |
| Teacher model — common stylesheet | `.model-text`, `.listen-pill` | Same classes within collapsible answer block; same existing `p4AnswerHtml(answer)` formatter |
| Data/behavior ownership | Existing `JS_Speaking.html` & Progress backend | Existing `JS_SpeakingPart4.html` and separate P4 Mastery/Dev adapter |

## Code changes

1. `ViewSpeakingPart4.html`: Topic navigation moved **outside** the inner study card (as in Part 1–3); shared Prev/Next button styling; one topic title, status and position badges; shared 3 mode tabs; old hidden P4 controls retained for existing handlers. Study tools moved below question cards (like action/footer area); timer and review remain functionally unchanged.
2. `JS_SpeakingPart4.html`: `renderSet()` outputs one shared-style question card for each Q1/Q2/Q3. The existing `escapeHtml(q)`, `p4AnswerHtml(answer)`, `data-answer` audio click hooks, study-mode logic and Exam answer guard are unchanged; only the HTML wrappers/classes/button position changed.
3. `Styles_Speaking.html`: common P2–3 question-card rule also owns the P4 question-card class; shared answer disclosure styling added.
4. `Styles_SpeakingPart4.html`: obsolete duplicate P4 navigation/card/title/tab/model/listen button styling **removed**; only actual P4 controls/tools/timer and topic-library styles remain.
5. `JS_Speaking.html`: critical listener isolation: all 3 common `.mode-tab` selections changed to `#speakingModeTabs .mode-tab`, and the common `.focus-card` handler scoped to `#homeView .focus-card`. This allows Part 4 to use shared classes without Part 1–3 handlers hijacking P4 events. Selector is `$$()` (NodeList), **never `$()` (single element)**.

### Behavior intentionally unchanged

- Original teacher content and formula markers.
- Part 1–3 study and Progress save logic.
- Part 4 `P4_MASTERY`, Practice/Attempt, Q1–Q3 answer data and APIs.
- Audio playback engine/speech voice logic, timer state machine, mark-learned policies, time limits, and server cache.
- S2 shared container/width, Home and bottom navigation structure.

## HARD QA/QC evidence performed on GitHub branch sources

- `testSpeakingSharedTopicS3ReadOnly()`: **30/30 PASS**; no source assertion failures.
- `testSpeakingSharedLayoutS2ReadOnly()`: **24/24 PASS**.
- `testPart4FullSourceHardQAReadOnly()`: **17/17 PASS**.
- Syntax of `JS_Speaking.html` and `JS_SpeakingPart4.html`: PASS.
- Source-level P4 render smoke with 3 fixture questions/models: Learn outputs **3 question cards, 3 unchanged teacher models, 3 shared audio buttons, 3 `model-text` blocks**; Exam outputs **3 question cards, zero teacher models and zero audio answer buttons**.
- Speaking client initialization mock after listener scoping: zero initialization errors, exactly **one** `getBootstrapData()` call, 3 shared mode-tab listeners bound. Same mock with a deliberately injected single-element `$()` selector fails before bootstrap as designed; the regression can be detected.
- No Google Apps Script backend `.gs` changes (except additive read-only test file), no production data access.
- HTML structure and dynamic visual parity still require actual browser inspection; this is NOT a browser/E2E pass.

## Staging manual verification — acceptance gate

1. Pull S3 branch into the **isolated** Apps Script staging project only, with disposable `APTIS_DATABASE_ID` and `APTIS_MEDIA_FOLDER_ID`. Do not run migration or production.
2. Run read-only Apps Script functions: `testSpeakingSharedTopicS3ReadOnly()`, `testSpeakingSharedLayoutS2ReadOnly()`, `testPart4FullSourceHardQAReadOnly()`. Expected 30/30, 24/24, 17/17.
3. Open staging `/dev` and compare the same viewport for P1, P2, P3 and P4 Topic Detail:
   - One topic header, status, previous/next aligned above study-card, no duplicate Part4 heading.
   - Study-card, teacher text fonts/line heights, Learn/Memorize/Test tabs, shared purple/white nav and audio-button styling match common CSS.
   - P4 three question cards have their teacher answers and listen buttons in Learn; Test hides all answers; Memorize cues still appear with the original logic.
   - Existing All topics, Prev/Next, audio, timer, refresh, saved P4 Mastery continue to function. Do not assume UI refactor adds new timer or memorization behavior.
   - P1/P2/P3 bootstrap and progress unaffected, check Writing/Listening/Reading navigation smoke.
4. Compare 1440px / 1024px / 768px / 390px / 320px: no horizontal overflow; same S2 container edge placement; fixed bottom bar does not hide key buttons.
5. Do actual Mastery write/reload tests only on verified disposable QA Sheet; don't change any production Script Properties.

## Unfinished items and handoff

- No browser/device screenshot E2E was available to this tool session; user must sign off staging behavior.
- Audio `Play/Pause/Stop` unified controls **deferred** to S4.
- Memorize LV1–LV3 typed-cloze **deferred** to a later scoped step.
- Timer durations, self-confirmed completion and Mastery save workflow **deferred** to later scoped steps.
- Integration with RC Phase 2.3 is **not authorized** and is blocked by cross-branch conflicts and release gates.

**Next recommended step (requires user confirmation AFTER S3 staging PASS): S4 — Shared Audio Controls**. Build a common Play/Pause/Stop bar, preserve learner text and separate P4 data adapter, test cross-Part playback and no double listeners. No RC/production changes.
