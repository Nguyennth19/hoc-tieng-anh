# Phase 1 Speaking backend — staging review (2026-10-21)

Baseline: `4b8dc04495427780d7012dc7a052c3232d6c891c`; backup branch `backup/phase0-2026-10-21-speaking-baseline`.

## Changes
- `SkillSpeakingPart3Full.gs`: create full Q1–Q3, images, descriptions, sourceLabel, practiceMode in **one** `SPEAKING_P3` getDataRange/getValues pass, no mutation; preserves compatibility with existing bootstrap payload.
- `SkillSpeaking.gs`: no call to old `ensurePart3ExamBankReady_` on bootstrap; old entry point is retained as write-free compatibility stub. Validate cache type; malformed JSON discarded; cache write failure logged without dropping loader results.
- `Migration.gs`: no automatic Q1-only P3 seed. Empty P3 raises explicit restore-from-backup error.

## Static QA
- JavaScript syntax: PASS (three edited .gs files)
- `getSpeakingPart3Full_`: one Sheet read, zero write calls, Q1/Q2/Q3 order intact.
- Bootstrap P3 auto-seed path: disabled.
- Migration P3 auto-seed path: disabled.

## Required tests before merge / deployment
1. Run smoke test against a disposable copy of the Phase 0 workbook (not production).
2. Compare exact IDs, questions, models, keywords, structures, images, sourceLabel and progress for all 52 active P3 topics against Phase 0.
3. Confirm P1=49, P2=51, P3=52 visible and Part 04 unaffected.
4. Verify malformed cached payload recovery and simulated CacheService failure.
5. Verify unchanged progress & attempts and three-topic audio/learn/memorize/test UI in sandbox deployment.
6. Verify schema migration on a copy of a populated bank and empty-bank fail-closed behavior.

## Remaining risks
- Legacy `upgradeSpeakingPart3Description_` function remains declared inside the 1.48 MB `SkillSpeakingPart3.gs`; manual direct execution can still overwrite content. Automatic calling paths have been disabled in this branch. Do not run it manually.
- `runMigrations` still has Part 1 content upgrade and Part 2 seed when its table is empty, plus Part 2 media creation. Out of scope here; inspect before production promotion.
- GitHub code has not been pulled to Apps Script or deployed. No live/runtime tests have been performed.
- No Google Sheet rows/columns/IDs or media have been changed.
