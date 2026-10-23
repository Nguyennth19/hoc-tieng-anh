# Speaking S2 — Shared Layout Foundation (2026-10-22)

Branch: `refactor/speaking-shared-layout-s2-20261022`  
Based on: `feature/speaking-part4-ui-20261022`  
**Status: IMPLEMENTED / SOURCE QA PASS / STAGING BROWSER QA PENDING**

No production deployment, no `main` or Phase 2.3 RC merge, no Google Sheet read/write/migration, no backend/API/schema or learner data changes.

## 1. Root-cause audit

Previous hierarchy:
- `Index.html`: `<main class="global-stage">` with viewport gutters, max-width 1440.
- `ViewSpeaking.html`: another `<main class="speaking-main">`, inheriting broad `main{width:min(100%,var(--max));padding:20px 16px 38px}` from `Styles_Speaking.html`; at mobile another broad `main{padding:14px 10px 30px}`.
- Speaking shared header and Part 1–4 switch were outside `speaking-main`.
- Part 4 mounted dynamically into `.speaking-shell` but had a separate `width:min(calc(100% - 32px),var(--max))` and a separate mobile width workaround in `Styles_SpeakingPart4.html`.
- Part 4 CSS contained a broad `.p4-mode > :not(...)` hide rule, overlapping ownership with other Speaking components.

This caused misaligned left/right edges and different effective inner widths across Part 1–3 and Part 4. Fixing Part 4 with more CSS alone did not fix the duplicated nesting/gutters.

## 2. New ownership matrix

| Owner | Responsibility | Shared/reusable | What must NOT be duplicated |
| --- | --- | --- | --- |
| `Index.html` / `Styles.html` | One semantic app `<main class="global-stage">`; app viewport gutters and responsive root | Global reusable | Skill-local `main` viewport rules |
| `Styles.html` | `.skill-content-frame` + `--skill-content-max:1120px`; same max width and zero extra gutters | Reusable by Reading/Listening/Writing when ready | Custom Part width hacks |
| `ViewSpeaking.html` | Speaking shell, header, one Part switch, `div.speaking-main`, bottom nav | All Speaking Parts | Nested semantic `<main>` |
| `Styles_Speaking.html` | Home/study cards, Part switch active/responsive state, hide only `.speaking-main` in P4 mode | All Speaking Parts | Global bare `main{}` CSS, P4-specific root sizing |
| `ViewSpeakingPart4.html` | Part 4 source/library/question/timer markup | Part 4 only | Own header or Part selector |
| `Styles_SpeakingPart4.html` | Only P4 topic, Q1–Q3, controls, timer-specific rules | P4 only | Own shell width/padding/Part switch or blanket hide |
| `JS_Speaking.html`, `JS_SpeakingPart4.html` | Existing tested navigation, bootstrap, cache, progress behaviour | Unchanged in S2 | No event/logic rewrite in S2 |

### Single content-frame visual contract

The SAME `skill-content-frame` class is now present on:
1. `.skill-page-head`
2. `.shared-part-switch`
3. `.speaking-main` (all P1–P3 Home and Topic Detail)
4. `#speakingPart4Future` (P4 Home and Topic Detail)

The only outer page gutters come from `.global-stage`. The content frame has width min(available width, 1120px), zero horizontal padding, centered margins and min-width zero.

## 3. Files changed

- `ViewSpeaking.html`: replace nested `<main class="speaking-main">` with `<div class="speaking-main skill-content-frame">`, change matching close tag; attach shared frame to Speaking header and Part selector.
- `ViewSpeakingPart4.html`: attach shared frame to its root only.
- `Styles.html`: add one reusable `.skill-content-frame` primitive and CSS variable.
- `Styles_Speaking.html`: remove bare `main{}` layout rules (including mobile); move shared part-switch CSS here; four columns, responsive rules; hide only P1–P3 `.speaking-main` in P4 mode, not other shell elements.
- `Styles_SpeakingPart4.html`: delete competing global-shell width, four-part tabs and blanket hide selectors; keep Part 4-specific CSS.
- `tests/SpeakingSharedLayout_S2_ReadOnly.gs`: source regression + estimated width checks without data access.

## 4. QA/QC run against latest branch source

**PASS — 24/24** `testSpeakingSharedLayoutS2ReadOnly()` (`failed:[]`): one semantic main, no nested Speaking main, four frame sites, width/gutters, four shared tabs, no P4 shell overrides, five bottom nav items, safe P1–P3 selectors, P4 mount, all 58 P4 ID references present and mobile breakpoint checks.

**PASS — 17/17** prior `testPart4FullSourceHardQAReadOnly()`.

**PASS — source syntax** for `JS_Speaking.html` and `JS_SpeakingPart4.html`. This S2 step did not edit either JS file. Mock client event regression: Part 4 opens in shared shell and returns to Part 1 successfully.

Expected unified inner width derived from current `.global-stage` responsive padding (model, NOT browser screenshot):

| Viewport | Frame width |
| --- | --- |
| 1440px | 1120px |
| 1024px | 976px |
| 768px | 740px |
| 390px | 370px |
| 320px | 300px |

**Not yet verified**: real Apps Script `/dev` loading, computed DOM bounding boxes, iOS/Android layout, image and long-question overflow, cross-skill layout, live QA Mastery/Progress, Writing or production. Static QA does not imply runtime acceptance.

## 5. Staging acceptance gates

Use separate Apps Script staging based on S2 architecture branch, connected ONLY to disposable QA workbook/media.

1. Pull S2 branch; run `testSpeakingSharedLayoutS2ReadOnly()` and prior Part 4 read-only source test.
2. Open staging `/dev`; ensure P1=49, P2=51, P3=52 and P4 library=51 (only when connected QA dataset contains those accepted items).
3. At widths 1440, 1024, 768, 390 and 320 CSS pixels, compare bounding boxes of Speaking header, Part selector and displayed hero/study card; left/right x-coordinates of the shared **container edges** must match within <=2 CSS pixels; no horizontal scrolling.
4. Click P1–P4, open a Topic in each, Prev/Next, return to library and switch modes; no white space or hidden headers.
5. Check bottom navigation 5 equal-width buttons, fixed positioning, safe from overlays; mobile orientation.
6. Verify actual Speaking bootstrap/Part4 loads, no browser console error. Confirm no automatic data mutation. Saves should only be tested on disposable QA workbook with explicit safe properties.
7. Regression check Reading, Listening and Writing navigation/layout because `Styles.html` adds a reusable global class (not yet applied to other skills).

Do not merge/deploy on source-only PASS.

## 6. Future integration risk

The Phase 2.3 RC remains an **independent frozen branch** with backend/migration/progress changes. Do not merge S2 or P4 feature into RC without conflict resolution, particularly `JS_Speaking.html`, and renewed isolated QA. Published production Web App v74 remains a separate rollback baseline.

## 7. Next step — proposal only (requires user approval)

**S3 — Shared Topic Detail Foundation**: reconcile Topic Detail markup (header/status, Q cards, Learn/Memorize/Test controls) across P1–P4 while retaining P4 data adapter/mastery and all teacher text. Build reusable visual components, not a separate Part4 lookalike. Defer audio/timer/mastery behaviour changes to subsequent scoped steps. S3 must wait for S2 browser QA acceptance.
