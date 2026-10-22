# Speaking Part 4 — full-source HARD QA/QC and recovery (2026-10-22)

Branch: `feature/speaking-part4-ui-20261022`. **No merge, deployment or production database writes**.

## Root causes confirmed
1. **Nested template include broke rendering.** `Code.gs` implements `include(name)` using `HtmlService.createHtmlOutputFromFile(name).getContent()` without recursively evaluating template statements. Putting `<?!= include('ViewSpeakingPart4'); ?>` within `ViewSpeaking.html` therefore left a literal directive rather than an actual Part 4 DOM subtree. The JS Part 4 initializer then could not find required elements.
2. **Shared tab handler accidentally handled Part 4.** `JS_Speaking.html` previously attached Part 1–3 `switchPart(Number(btn.dataset.part))` to **all** `.part-tab` buttons. Part 4 lacks `data-part`, so `Number(undefined)` was NaN and `switchPart` fell back to Part 1, causing hidden state churn/races.
3. The old large empty gap was because Part 4 was a sibling of the whole Speaking shell and the shell remained in page flow even while its inner view was hidden. Fixing layout by nested include without checking template processing caused (1).

## Structural correction
- `Index.html`: exactly one **top-level** `include('ViewSpeakingPart4')` inside `#page-speaking`, alongside other included module files.
- `ViewSpeaking.html`: no nested `include` directive.
- `JS_SpeakingPart4.html`: on DOMContentLoaded, move the already-rendered `#speakingPart4Future` element to be a **direct child** of the shared `.speaking-shell`, before binding listeners; `open()` defensively remounts if required.
- `JS_Speaking.html`: bind/update Part 1–3 tab UI only via `.part-tab[data-part]`, leaving Part 4 to its dedicated event handler.
- Existing Part 1–3 source templates and their logic otherwise remain intact.

## Part 4 source / UX checks
- P4 Topic Library, Topic Detail, Prev/Next, Q1–Q3 UI IDs and shared header persist.
- P4 inherits common Home `welcome-card`, `focus-grid`, `focus-card`, `library-section`, buttons and design variables, retaining only specific P4 CSS for topic cards, Q1–Q3, tools and timer.
- Part 4 data adapter `SkillSpeakingPart4Dev.gs`: matching client calls for read learn/exam, read Mastery/Progress, save Mastery/Attempt; exam eligibility still checks QA approval.
- P4 client content cache **per mode** (Learn vs Exam), verified DEV payload, 120-second TTL. Mastery is never served from content cache: it is re-read on every content activation; Refresh forces reload.
- Starting the speaking timer **does not force Learn into recall**, so teacher model or Memorize cues remain at the selected visibility; Exam mode remains answer-free.
- Loading/backend errors are visible in the Topic Library as well as Topic Detail.
- No edited teacher text, Sheet schema, backend function or media folder configuration in this recovery.

## Tests performed on latest feature source
- Apps Script read-only static QA source assertions: **17/17 PASS**, `issues=[]`. Versioned test: `tests/Part4_UI_FullSourceHardQA.gs` with `testPart4FullSourceHardQAReadOnly()`.
- All **58** Part 4 `byId(...)` dependencies match exactly one element across the shared Speaking and Part 4 views.
- No duplicate IDs in the two source views.
- Client JS syntax check: `JS_Speaking`, `JS_SpeakingPart1`, `JS_SpeakingPart2`, `JS_SpeakingPart3`, `JS_SpeakingPart4`, `JS_Home`, `AppJS` all PASS parsing.
- **7/7 simulated UI checks PASS** with a mock DOM: mount P4 into shell, open from top tab, set p4-mode, show library, hide detail, expose library error on failed backend, exit to P1, and reopen from bottom Part 4 nav.
- Client–server Part 4 API names checked against `SkillSpeakingPart4Dev.gs`: all calls have declared backend functions.

## Not yet proven (do not call browser PASS)
- Actual Apps Script evaluated `/dev` page rendering, full Google Apps Script runtime, P4 workbook ID, content/mastery RPC responses, detailed Q1–Q3 and visual parity on desktop/mobile require staging QA.
- Browser E2E for Learn, Memorize, Test, save Mastery, 60/120s timer, audio, and P1–3 regression.
- Subjective mobile visual comparison including focus grid and bottom nav.

## Safe staging QA procedure
1. Pull this branch into **APTIS_B2_PART4_UI01_STAGING** only; verify `APTIS_DATABASE_ID` and `APTIS_MEDIA_FOLDER_ID` target **QA-only**, not production.
2. Run `testPart4FullSourceHardQAReadOnly()` in Apps Script Editor; expected `ok:true`, `issues:[]`, **17 checks**.
3. Open staging `/dev`, hard refresh. Part 4 should appear immediately under the shared part tabs and be clickable. Test Top Part 4, bottom Part 4, Topic Library, Topic Detail, Prev/Next, switch to Part 1–3 and back.
4. Confirm Learn teacher answer stays visible when speaking starts; Memorize cue stays selected; Test answers hidden.
5. Confirm when reopened within two minutes, Part 4 reuses content while fetching fresh Mastery, and Refresh requests new content.
6. Test saves **only in disposable QA workbook**, never production.
7. Share screenshots and execution log to accept or reject the release gate.

## Production safety
- All work on feature branch. No `main` merge, no PR #5 amendment, no deployment to production v74, no production Sheet modification.
