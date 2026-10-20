# Speaking Part 03 — teacher-first reusable language and answer QA (20 October 2026)

## Source hierarchy and provenance
1. Teacher-authored source: [Speaking APTIS Part 3.docx](https://docs.google.com/document/d/160tSvbWYpko_ZJ2FJeWr7Rp_25XSi4qy/edit) and [04. Speaking_Part 3.pdf](https://drive.google.com/file/d/1G7Fnv6BKcIQNwKpe4Ipv7874mxx_8iE1/view).
2. Teacher's actual approach: compare the pictures using common theme + visible details + contrast, then use question-intent follow-up families (advice, opinion, past comparison, prediction, why, method). Reusable benefits/idea bank includes improving physical and mental health, reducing stress, connecting with nature, learning new skills, bonding with family and friends, saving time and money, and protecting the environment.
3. Keep teacher original documents unchanged. Rewritten B1-friendly sentences are labelled `ADAPTED_TEACHER` or `AI_DERIVED`, **not verbatim teacher answers**.
4. Work product: 18 sourced/adapted reusable pattern families in tab `P3_TEACHER_REUSE_LIBRARY_V1` (sheet gid `676397322`). Topic-by-topic 52 source questions, existing Q1 image-based answers, and 104 Q2/Q3 rewritten proposals in `P3_52_TEACHER_FIRST_ANSWER_STAGING` (gid `1504853619`).

## Actions and scope
- Rewrote **all 104** Q2/Q3 slots for 52 active Topic IDs in a separated staging workbook tab, generally 55–100 words per answer (mean 63). Every answer answers the actual Q2/Q3 with reusable concept clusters, not the same generic body.
- Published **102** rewritten slots for **51** topics to production `SPEAKING_P3`; maintained source questions, source images, Q1 models, topic IDs, activation flags and learner progress. The published answer provenance includes `P3_TEACHER_METHOD_REUSE_B1_Q2Q3_20261020; AI_EDITORIAL_NOT_TEACHER_VERBATIM`.
- Fixed app-facing `SP3-EX-009` Q3, removing accidentally appended `Q4/Q5/Q6` material from its question text. Raw source remains in source-bank/audit.
- `SP3-EX-054` remains **HOLD** in staging because its S07 images and questions have contradictory mappings; no unsupported answer promoted to production. It remains in the bank for user-led learning/feedback, not hard-QA release.
- AI text QA after publishing: 52 active topics; 0 exact Q2/Q3 pairs identical; 0 exact answer duplication across topics; 0 Q4 leakage into Q3. Some semantic review, source picture QA and oral timing still outstanding.
- Existing Q1 picture descriptions were preserved intentionally, not rewritten indiscriminately; require remaining image QA independently, especially S01–S04, S06–S07. The teacher-priority wording is the authority; AI rewrites do not supersede it.

## Deployment
- `SkillSpeaking.gs` Part03 content revision bumped to `.teacher-reuse-q23-v04.20261020`; import it from GitHub `main` and deploy a new Google Apps Script version.
- No change to P1/P2/P4 content or progress/attempt IDs. New server content-cache key should pick up the latest Q2/Q3 after redeploy. Client can still temporarily hold an older cached payload within its TTL; use in-app refresh if required.
- The 104 answers passed basic textual QA, **not teacher sign-off or spoken CEFR B1 certification**.

Workbook: https://docs.google.com/spreadsheets/d/10ObMk8MNwv0Wbf9hyjCsVqWNAUTGongngmCwPBscMY0/edit
