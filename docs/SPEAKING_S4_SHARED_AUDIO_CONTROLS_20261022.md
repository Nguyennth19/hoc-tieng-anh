# S4 — Shared Audio Controls · One Voice Configuration (2026-10-22)

**Status:** S4 implemented on isolated feature branch; source QA PASS; **browser/staging acceptance pending**.

Branch: `refactor/speaking-shared-audio-s4-20261022` (created from `refactor/speaking-shared-topic-s3-20261022`).
No `main`, Phase 2.3 RC, production deployment v74, Sheet, media folder, API or backend changes. **No merge/deploy.**

## 1. Confirmed source-level defect

- Part 1–3 previously use `JS_Speaking.html` configured by the common Speaking top bar **♪ → Voice settings** (accent, device voice, listening speed, stored in `aptisAccent`, `aptisVoiceURI`, `aptisRate`).
- Part 4 used a second `SpeechSynthesisUtterance`, hardcoded `en-US`, and its own `p4VoiceRate` default of 0.85x and `p4StopAudio` button inside `Study tools · Audio & mastery`. Both controllers could interrupt/cancel each other.
- P1–3 had a partial toggle/Pause handler rather than a consistent three-button group; P2–3 had individual Listen plus redundant “Listen to all 3 answers”.
- Therefore merely hiding P4 voice dropdown would be unsafe; its audio engine and event handlers must use the shared owner.

## 2. Implementation and code ownership

| File | S4 work |
| --- | --- |
| `JS_Speaking.html` | **Sole SpeechSynthesis owner.** Public `window.AptisSpeakingAudio` API `play(text,group)`, `pause(group)`, `stop()`, `createControls(text,label)`, `settings()`. One utterance/session token, group status, Play/Pause/Resume/Stop states. Uses existing `makeUtterance`/top Voice settings and persisted preferences. P1–3 Learn/Shadow/Memorize and P2–3 Q1–3 use same controls. Removes unused P1 toggle engine and all-three playback. Changing Accent/Voice/Speed first stops active audio to avoid mixed voices. |
| `JS_SpeakingPart4.html` | No independent TTS construction, language/rate or cancellation. P4 Q1–Q3 audio delegates to shared API; phase and Learn/Test guards remain. |
| `ViewSpeaking.html` | P1 model-answer and Learn/Shadow controls now provide one common trio: **▶ Play, ⏸ Pause, ■ Stop**. Existing header ♪ and sheet remain the only voice settings. |
| `ViewSpeakingPart4.html` | Removes entire old blue Study tools panel, including redundant Listening speed, Stop audio, duplicate study mode selector. Keeps `p4StudyView` as hidden UI state for Learn/Memorize and preserves separate compact `My mastery / Save mastery` control below Q1–Q3. Timer, review and teacher answers are unchanged. |
| `Styles_Speaking.html` | Single responsive `.speaking-audio-controls` component shared across Parts 1–4, plus simple `.speaking-mastery-controls` footer. |
| `Styles_SpeakingPart4.html` | Deletes orphaned blue panel/tool grid styles. Keeps only truly Part4-specific timer/content/formula CSS. |
| `tests/SpeakingSharedAudio_S4_ReadOnly.gs` | Read-only source regression gate: voice ownership, P1–4 controls, no duplicates and no P4 independent rate, preserved Mastery and source data guards. |
| `tests/SpeakingSharedTopic_S3_ReadOnly.gs` | S3 guard wording adapted to updated S4 audio/footer layout, all other S3 invariants maintained. |

**Shared UI contract:** same three buttons and disabled/active state for every question in each Part. New audio automatically calls `speechSynthesis.cancel()` on the previous session, resets old controls, plays with current top-sheet accent/voice/rate, then updates current controls; old `onend` token must not reset a newer session.

**Preserved behavior:** teacher model text, formula markers, three question content, P4 Mastery values and save API, Learn/Memorize/Test logic, all timer durations/state, content cache, media and Sheet schema.

## 3. QA evidence against branch source (no production access)

- `testSpeakingSharedAudioS4ReadOnly()`: **33/33 PASS**, issues `[]`.
- `testSpeakingSharedTopicS3ReadOnly()`: **30/30 PASS**.
- `testSpeakingSharedLayoutS2ReadOnly()`: **24/24 PASS**.
- `testPart4FullSourceHardQAReadOnly()`: **17/17 PASS**.
- Total **104/104 static checks PASS**, and client JS files parsed.
- A mocked shared Web Speech API was exercised using saved Accent `en-AU`, Speed `0.75`. Play → Pause → Resume → starting another Part's Q → Stop all PASS. New playback canceled previous audio, previous controls returned to idle and both sessions used one shared setting. This is **simulation**, not real-browser TTS acceptance.
- GitHub compare relative to S3 shows **no backend .gs file edits**; only UI HTML/CSS/JS, read-only tests and report.

## 4. Manual acceptance on isolated staging /dev

1. Pull **only** `refactor/speaking-shared-audio-s4-20261022` into a disposable QA Apps Script project. Confirm Script Properties `APTIS_DATABASE_ID` and `APTIS_MEDIA_FOLDER_ID` point to QA, not production.
2. Run read-only `testSpeakingSharedAudioS4ReadOnly()` → expected `ok:true`, `totalChecks:33`, `failed:[]`. Run S3/S2/P4 source regression tests too.
3. Open staging `/dev` and ensure all Part 1=49, Part 2=51, Part 3=52, Part 4=51 topics load, given the same approved QA dataset.
4. At top Speaking header, open **♪ → Voice settings**: choose British/US/Australian accent, select installed device voice, choose 0.75×/0.90×/1.00×, and preview. This must be the **only voice/speed settings**.
5. On Part 1 Learn, Part 2 Q1–Q3, Part 3 Q1–Q3 and Part 4 Q1–Q3: ▶ Play, ⏸ Pause, ▶ Resume, ■ Stop. When Q2 starts during Q1, Q1 must stop; switching Part must stop any ongoing audio. Changing voice/accent/speed mid-playback must stop old speech; next Play must use new settings.
6. In P4 Topic Detail the old blue `Study tools · Audio & mastery` panel must be **absent**; compact **My mastery/Save mastery** remains and should not alter stored data until clicked. The existing StudyMode select is invisible, but Learn/Memorize/Test still work.
7. Verify timer Start preparation/Start speaking/Stop unchanged; Learn teacher answer remains visible while practicing; Test has no teacher models or audio answer buttons.
8. Verify mobile at 390px and 320px: three audio buttons wrap/fit, no horizontal overflow or clash with fixed bottom nav.
9. Only test a Mastery write if using the disposable QA sheet. No writes to production.

## 5. Unfinished / deferred

- Actual Chrome/Edge/Safari/iOS/Android speech synthesis browser QA and physical audio checks are pending.
- S5 candidate after staging acceptance: **Memorize Part4 LV1–LV3 typed cloze aligned to Part1–3**, without changing teacher content, existing P4 Mastery values or production data.
- Shared Timer and manually confirmed completion flows remain outside S4 and need separate approvals and QA.

**Release gate: NO MERGE / NO PRODUCTION DEPLOY** before staging acceptance and later controlled Phase 2.3 integration.
