# Part 02 teacher-first reusable language & 51-topic rewrite (20 Oct 2026)

## Sources & editorial rules
- Teacher original [Speaking APTIS Part 1–2.docx](https://docs.google.com/document/d/1PWJzTmpGIj2Y-8wCoz_SzDRIXBp2y-jq/edit).
- Supplementary exam-teaching [02. Speaking_Part 2.pdf](https://drive.google.com/file/d/1AerkBYO-pQoKgNBGjRu8nLhwhCERncHs/view).
- Correct teacher's observable picture-description order: people, where, verb-ing, visible clothing/details, then cautious personal reaction/recommendation only where relevant. Do **not** guess facts from a photograph.
- Q2 may be a PAST story (when, with whom, where, what, feeling), HABIT/preference, or experience/benefits. Q3 direct opinion/why/how + clear reasons and topic-specific example. Don't use a generic opinion on unrelated prompts.
- Recycle easy sentences/ideas like enjoy time with family, relax and reduce stress, improve physical and mental health, gain knowledge and skills, save time, make life convenient. Do not endlessly repeat connectors alone.
- Teacher-sourced patterns are distinguished from editorial derivations; **AI drafts are not teacher-verbatim**.

## Actual workbook changes
- Created `P2_TEACHER_REUSE_LIBRARY_V1` (gid 603049770): 20 reusable source-labelled formula families.
- Created `P2_51_TEACHER_FIRST_ANSWER_STAGING` (gid 872833266): 51 active topics; exact Q1/Q2/Q3 prompts; existing image-specific Q1 model preserved; 102 Q2/Q3 teacher-method-based editorial drafts, 54–74 words (mean 60), zero identical exact responses in stage.
- Published **102 Q2/Q3 answers** to production `SPEAKING_P2` for all 51 active topics; the original 51 Q1 image descriptions were intentionally **preserved** until image-by-image review. Not all 153 answers have been rewritten: 51 Q1s are held unchanged. Student progress, IDs, activation flags and media untouched.
- Existing `SP2-EX-012` remains inactive because source Q2/Q3 are missing. No guessing/promotion.
- Source label appended `P2_TEACHER_METHOD_REUSE_B1_Q2Q3_20261020; AI_EDITORIAL_NOT_TEACHER_VERBATIM`. Staging labels say published but teacher sign-off pending.
- `SkillSpeaking.gs` P2 revision bumped to `.teacher-reuse-q23-v04.20261020` to refresh server cache when deployed.

## QA and caveats
- Structural QA: 51 active topics, 102 completed drafts, no identical answers, 54–74 words per Q2/Q3.
- This is not teacher answer-by-answer sign-off, oral CEFR certification, or 45s spoken timing validation; source picture-to-Q1 QA remains outstanding.
- Reuse clauses are deliberately repeated across semantically related topics, while question-specific opening sentences answer the exact prompt. Further human review should inspect length, factual personal-claims suitability and unnatural generalizations; students should personalize stories.
- The 51 existing Q1 answers were intentionally **not** changed because pictures were not fully checked in this task and blindly rewriting them could harm teacher fidelity.
- No client UI files changed; import only `SkillSpeaking.gs` from `main`, save, update Apps Script deployment version. Cache duration may mean a forced in-app refresh is needed to see new content.

[Production workbook](https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit).
