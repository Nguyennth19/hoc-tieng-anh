# Speaking Part 01–04 — Teacher-first deep check / hard QA
Date: 2026-10-20 | QA record: **SPEAKING_HARD_QA_20261020** in the authoritative spreadsheet.

## Rules
1. Teacher material takes priority: `01. Speaking_Part 1.pdf`, `02. Speaking_Part 2.pdf`, `04. Speaking_Part 3.pdf`, and `06. Speaking_Part 4.pdf`.
2. Simple, repeatable structure is preferred: direct answer -> detail -> reason/example. Vocabulary should be easily pronounced and at least B1 appropriate.
3. Reuse **sentence patterns**, not entire irrelevant answers. Never attribute AI supplements to a teacher.
4. Preserve source prompt strings in `P123_FINAL_COVERAGE_P2/P3`; show corrected spelling/grammar only in app-facing question cells and cite each change in `sourceLabel`.
5. Do not mutate `PROGRESS`, `ATTEMPTS`, their per-prompt keys, or existing topic IDs.

## Observed release inventory
- Part 1: **49 active** questions, one per practice item.
- Part 2: **52 active** topics; **51** have Q1–Q3, while `SP2-EX-012` has Q1 only (no verified source Q2/Q3).
- Part 3: **54 active** topics; **52** have Q1–Q3; `SP3-EX-012` has Q1 only and `SP3-EX-017` has Q1–Q2 (source Q3 missing).
- Part 4: **51** source/answer sets in `P4_EDITORIAL_51_REVIEW`. **0** sets approved for exam release by `P4_FINAL_CONTENT_QA_51`; all 51 lack measured spoken delivery times.
- Structured hard QA worksheet: **418 records** (P1 49 + P2 156 + P3 162 + P4 51), **152** records have REVIEW flags. Do not conflate all flags with text mistakes: unreviewed images, mismatched media and P4 timing are included.

## Corrections carried out
- Restored Part 2/3 Q2–Q3 source questions from original sheets without modifying original source-bank wording.
- Fixed erroneous P2 column placement; recovered original Q1 model and keywords from description fields. Kept only genuine source-missing prompt slots blank.
- Added 15 teacher-first B1 formula entries in `SPEAKING_TEACHER_FIRST_B1_FORMULAS`, with exact-teacher versus simplified-B1 source labels.
- Saved **574 answer snapshots** in `SPEAKING_ANSWERS_SNAPSHOT_20261020` before linguistic edits.
- Rewrote repetitive generic AI drafts to simple, topical B1 answers using recurring frameworks; preserved source teacher transcripts and marked AI work with `AI_NOT_TEACHER`.
- Cleansed selected display typos including P2-EX-020, P2-EX-034, P2-EX-037, P3-EX-027, P3-EX-032, P3-EX-039, and a P3-EX-009 Q3/Q4/Q5/Q6 source-boundary error. The original prompts remain traceable in the original source bank and snapshot.
- Reviewed the **22** A/S Part 3 image pairs directly (44 image assets). **16 pairs** support source-informed topic labels and Q1 answers (A01–A15, S05). **6** remain in-app pending user feedback due to mixed or unrelated source image pairings (S01–S04, S06–S07); user-approved practice availability is **not** equivalent to visual QA PASS.
- The image file presence of older BANK2026 Part 2/3 topics is traceable but does **not** prove every picture was visually checked.
- Original Part 2 teacher answer transcript library is preserved (18 documented Q1–Q3 answers from six tests). Other AI draft answers are not represented as teacher-authored.

## Remaining hard QA blockers — do not claim all-pass
1. Confirm images for BANK2026 Part 2 and Part 3, and several earlier Part 2 A/S sets. One Part 2 A01 shopping/read-books source disagreement needs special review.
2. Correct S01–S04 and S06–S07 Part 3 composite/incorrect second-image mappings. Some actual two-picture exam images were extracted as a single composite source file while the additional asset belongs to a different exercise.
3. Recover original source Q2/Q3 for P2-EX-012, P3-EX-012, and original Q3 for P3-EX-017. Never synthesize missing source prompts without explicitly marking a practice-only variant.
4. Part 4: measure 2-minute spoken output per set (one minute preparation), seek editorial/teacher sign-off for all 51 before calling them exam-locked approved. Avoid confusing 0.85x audio playback setting with a measured speaking speed.
5. Runtime smoke QA of new GAS deployment: caches, per-Q status `0/3`, 45s each for P2/P3, preserving all old progress.
6. 11 exact-repeat instances in the final QA list may include legitimate same-prompt/teacher reuse; review meaning before de-duplicating. The pre-edit QA found 217 repeated models; blindly replacing them would have harmed some valid reusable examples.

## Runtime/source protection
- `Migration.gs` no longer reruns destructive P2/P3 seed content updates for populated sheets; previously this reset curated Q2/Q3.
- `SkillSpeaking.gs` content versions and `JS_Speaking.html` browser-cache revision were advanced.
- A bootstrap validity gate now requires 52 P2 and 54 P3 topics **and** 51 complete P2 Q1–Q3 sets plus 52 complete P3 Q1–Q3 sets. Merely showing 52/54 topic cards while each item still says 0/1 is an invalid stale release.
- This commit updates GitHub and Google Sheet content. It does **not** push/trigger a Google Apps Script deployment or attest that runtime testing passed.

Spreadsheet: https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit
