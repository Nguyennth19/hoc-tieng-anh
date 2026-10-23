# S6.2 — Shared Layout & Topic Detail Header Cleanup

**Date:** 2026-10-22  
**Branch:** `refactor/speaking-shared-layout-s62-20261022`  
**Base:** user-approved `refactor/speaking-p4-shared-cache-s61-20261022`  
**Status:** Implemented / static QA + isolated responsive Chrome smoke PASS / full staging browser acceptance pending.

## Scope and non-negotiable safety

Do not merge to `main`, Phase 2.3 RC, Apps Script production or Web App v74. No writes/edits to QA or production Google Sheets, migration, script properties, backend Progress/Mastery, media, teacher answers, S4 audio, S5 Memorize or S6 Timer business rules. Keep all staging-only test scripts outside production sync.

### Audit findings

- Global site uses `.global-stage{max-width:1440px;padding:28px 24px 90px}`, so the usable desktop content max is **1392px**. The generic reusable `.skill-content-frame` capped **1120px** on Speaking and other skills, giving Speaking noticeably larger side gaps than the app-wide Home page.
- Part4 entry had independent `.p4dev` layout ownership for topic-library/detail, a second `← All topics` button, and mobile-only overrides of `.study-topline` and `.study-top-actions` even though S3 established those as shared styles. Meanwhile Part1–3 Detail does not show the shared top Part selector.
- The Part4 tab had been shown whenever `.p4-mode` was set, including Topic Detail. Simply suppressing via `.p4-detail-mode` without guarding the P1–3 home `:has(#homeView:not(.hidden))` selector was insufficient because the P1–3 home can remain in the DOM while its parent main is hidden. The CSS now excludes P4 when evaluating the P1–3 home selector.
- P4 `open()` already returns to `p4ShowLibrary_()` and is bound on the persistent bottom Part4 nav tab. Removing the top redundant Back link does not remove the user path back to Library.

### Changed frontend source

| File | Change |
| --- | --- |
| `Styles_Speaking.html` | Scoped `--skill-content-max:1392px` to `.speaking-shell`; all Speaking header, Part selector, P1–3 main and P4 root share this width. Adds shared Topic Detail `.study-topline` and `.study-top-actions` placement/button geometry and mobile variants. Shows shared Part selector on P1–3 Home / P4 Library only. P1–3 latent Home DOM cannot force selector visible during P4 Detail. No global CSS changed. |
| `ViewSpeakingPart4.html` | Removes redundant top `← All topics` button; retains precisely two shared Prev/Next buttons, one `study-card`, the original topic badges, Learn/Memorize/Test, answers, audio, timer and mastery. |
| `Styles_SpeakingPart4.html` | Deletes independent Part4 width/home-section rules, redundant Back-link styling, competing small-screen `study-topline/study-top-actions` and obsolete `p4dev-time` position override. Keeps only P4-unique grid/card, formula and topic-specific rules. |
| `JS_SpeakingPart4.html` | Part4 `p4ShowLibrary_()` clears `p4-detail-mode`; `p4ShowDetail_()` sets it; `close()` clears both Part4 classes. Removes deleted Back-button handler. Bottom Part4 nav still invokes `open()`, which returns to Library using the existing cached content loader. No new backend calls or persistence changes. |
| `tests/SpeakingSharedTopic_S3_ReadOnly.gs`, `tests/SpeakingSharedLayout_S2_ReadOnly.gs` | Updates old regression assertions for deliberately removed redundant Back link and width; checks backward-compatible bottom-nav navigation and shared timer styles. Not weakened to skip relevant behavior. |
| `tests/SpeakingSharedLayout_S62_ReadOnly.gs` | 38 additional source/geometry checks for width, shell class state, one selector, no duplicate header/back, mobile, request endpoints and safe rendering. |

### Automated source regression

- S6.2 `testSpeakingSharedLayoutS62ReadOnly()`: **38/38 PASS**
- S6.1 cache: **43/43 PASS**
- S6 Timer: **45/45 PASS**
- S5 Memorize: **41/41 PASS**
- S4 Audio: **33/33 PASS**
- S3 Topic Detail (updated expectations): **30/30 PASS**
- S2 Shared Layout (updated width policy): **24/24 PASS**
- P4 FullSource: **17/17 PASS**
- **Total 271/271 source checks PASS.** Both JS files parse in V8-compatible syntax.

### Responsive geometry smoke test

Ran isolated Chromium/Playwright smoke with the S6.2 scoped width, shared Part selector, P4 Library/Detail class states, global stage gutters, mobile selector and bottom navigation. This is a **synthetic layout fixture**, not the full Apps Script `/dev` app and does not prove precise typography, image loading, scroll or touch interactions.

| Browser viewport | Expected Speaking frame | Part selector in P4 Library | Part selector in P4 Detail | Horizontal overflow |
| ---: | ---: | --- | --- | --- |
| 320px | 300px | visible | hidden | no |
| 390px | 370px | visible | hidden | no |
| 768px | 740px | visible | hidden | no |
| 1024px | 976px | visible | hidden | no |
| 1440px | 1392px | visible | hidden | no |
| 1680px | 1392px | visible | hidden | no |

### Explicit staging /dev acceptance

1. In **`APTIS_B2_PART4_UI01_STAGING` only**, pull `refactor/speaking-shared-layout-s62-20261022`; verify Script Properties point to disposable QA resources, never production.
2. Run `tests/SpeakingSharedLayout_S62_ReadOnly.gs → testSpeakingSharedLayoutS62ReadOnly()`: expect `ok:true`, `totalChecks:38`, `failed:[]`.
3. Open isolated `/dev` and refresh. Compare Home/Overview content width and Speaking Part1/2/3/4 Home; Speaking must not have the former 1120px squeeze.
4. Open one Topic Detail in each Part. Shared top Part selector must be absent on all Details, not duplicated. Prev/Next alignment and disabled first/last states must remain correct.
5. In P4 Detail, `← All topics` must be gone. Tap the fixed bottom `Part4` tab to return to the Library and revisit a Topic. The top selector must reappear on P4 Library, with active Part4 state.
6. Test top/bottom Part navigation among all four Parts; 51 Part4 topics and 49/51/52 Part1–3 counts (same approved QA bank) retained; no spinner/cache regression.
7. Inspect at 320,390,768,1024,1440px real Chrome responsive/mobile. Check no horizontal scrolling, clipped tabs, button overlap with bottom fixed nav, header duplication or unexpected vertical gaps; verify at least one real mobile/touch device if available.
8. Smoke Learn/Memorize/Test, audio Play/Pause/Stop, timer Start/Pause/Resume/Stop, Mastery confirmation (only in disposable QA), and all four Parts' navigation.
9. Check DevTools Console for new JavaScript errors and Apps Script execution logs. Writing/Listening/Reading routes must remain unaffected.
10. Send result and screenshots for acceptance. Do not merge or deploy `main`/production.

### Next recommendation — requires new user confirmation

**S6.3 — Compact Shared Timer & Mode Visibility**: align left time / center stage / right actions in one row and hide timer + Mark learned in Memorize while preserving user-confirmed saves and per-Part durations. Do not start until S6.2 staging acceptance.
