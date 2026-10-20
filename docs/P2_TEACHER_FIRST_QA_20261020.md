# Speaking Part 02 — QA checkpoint, 2026-10-20

## What was checked
- PROD spreadsheet P2_53_SETS_TEACHER_FIRST_STAGING contains 53 sets / 159 Q slots (one Q3 blank at SPK-P02-T007-V02-Q3).
- Teacher's 02. Speaking_Part 2.pdf read directly: 45 seconds per Q; Q1 description / Q2 related question / Q3 related opinion; follow teacher's exact learning pattern.
- Read seven teacher answer PDFs. TEST 01, 02, 04, 05, 06, 07 yielded 18 transcribed Q1–Q3 answers; TEST 03 Part 02 answer text empty, HOLD.
- Answer transcripts in P2_TEACHER_VERBATIM_ANSWERS: 18 rows. Six sets only. TEST 06 Q1 retains source typo 'severa;' as extracted; requires editorial approval before live release.
- For all other 35+ source sets, do not present generated text as teacher answer.
- Original source sheet flags S05 cross-source disagreement and many image QA pending.

## App code findings (static)
- JS_Speaking.html startTimer reads currentTimerSeconds(), 45 seconds for Part2.
- JS_Speaking.html setPrompt() can switch Q1–Q3 and resets the timer.
- saveProgress() uses currentProgressId() = item.id + '-' + currentPrompt for Part2/3.
- recalcPart2Aggregate only marks mastered when every prompt is learned.
- New SkillSpeakingPart2TeacherPreview.gs (feature branch) provides getApprovedPart2TeacherFirstSets_() but is *not* merged into the old getSpeakingPart2_ path.
- Preview gate requires exact image QA, editorial answer QA, source release approval and complete Q1–Q3. No current source sets meet this gate.

## Remaining blockers before enabling 53-set bank
1. Verify 53 actual image contents (not just asset filenames), photograph/question congruence and rights.
2. Check extracted 18 source answers against PDFs individually, editorial corrections strictly in a separate reviewed value.
3. Obtain or author clearly labelled non-teacher draft answers for remaining questions. Never mark as verified teacher text.
4. Resolve missing Q3 and S05 cross-source disagreement.
5. Wire getApprovedPart2TeacherFirstSets_ to read-only app staging, smoke-test 45s Q1/Q2/Q3 and per-question progress on disposable DEV database. No production data updates.
6. Only then approve selected sets, merge PR and deploy GAS via the normal pipeline.

No student progress or attempts changed in this checkpoint. No production publish asserted.
