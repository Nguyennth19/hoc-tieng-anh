# Speaking Part 02 — Teacher-first 53-set upgrade (staging)

## Current authoritative staging
Google Sheet: https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit

New tab: `P2_53_SETS_TEACHER_FIRST_STAGING`
- 53 source sets; 159 Q1/Q2/Q3 positions; 1 blank original slot
- Original source wording preserved, including variants
- Existing `SPEAKING_P2`, `PROGRESS`, `ATTEMPTS` untouched.
- Do NOT copy answers from generated AI to a teacher-verified field.

## Non-negotiable teacher-first pedagogy
1. Preserve teacher's exact answer formula and learning order. Do not expand vocabulary just to sound advanced.
2. Q1 (45s): who / where / activity / clear visible details / cautious impression.
3. Q2 (45s): direct answer / time-place / one experience / feeling. Use teacher's story wherever available.
4. Q3 (45s): direct opinion / two short reasons / one easy example. Use teacher's model wherever available.
5. The above are fallback **editorial scaffolds**, NOT claims about teacher-authored templates.
6. Learn a small number of reusable core answers; map many source question variants to them, without losing original wording or changing question intent.
7. Keep `source_set_id` and individual `question_id`, including duplicates and missing slots; never auto-fill a missing exam question.

## Proposed release gates
- G0 source question exact and source URL traceable
- G1 visual asset inspected for the exact image (not just matching filename)
- G2 teacher answer/model and target tense checked against actual Q1/Q2/Q3
- G3 45-second learner readability and timing checked (slow and clear, with optional extension)
- G4 all three questions present, no contradictory source
- G5 backward compatibility: existing topic IDs, progress, attempts, image refs
- G6 smoke QA for app and source evidence, then release selectively

Currently **STAGING ONLY**, do not deploy to PROD or change `SPEAKING_P2`.
Historical snapshot in `P123_FINAL_RELEASE_MATRIX` reports unresolved image/text QA. The missing question must remain blank until resolved.

## App integration intent
After teacher content is approved, add a versioned read-only bank loader from staging to separate 53 sets from study templates. Preserve existing `SP2-EX-xxx` IDs and only expose verified `Q1/Q2/Q3`. Track prompt-level progress independently. Do not turn a topic into "mastered" when only the picture description is complete.
