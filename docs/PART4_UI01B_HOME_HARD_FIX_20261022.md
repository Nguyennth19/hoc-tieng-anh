# Part 4 — UI-01B Home Hard-Fix (2026-10-22)

Feature branch only, no production write.

## Source-based correction
- Reuse **exact same shared** Home CSS components used by P1–P3: `welcome-card`, `welcome-copy`, `progress-hero`, `today-section`, `focus-grid`, `focus-card`, `library-section`, `library-controls`, common buttons and typography.
- Rewrite `Styles_SpeakingPart4.html` to remove layered duplicate selectors and obsolete P4 header/switch CSS; retain unique P4 Topic Card/Detail/Q1-3/timer/Study tools CSS.
- Align P4 container and shared Part 1–4 switch with the same `--max` and horizontal gutters.
- Modify shared `Styles_Speaking.html` bottom bar from six grid tracks for five buttons to five equal tracks. Applies to all P1–4.
- Do not claim default-zero / untouched topics were practised. `Practised` counts distinct active topic IDs with a real Mastery level of 1, 2, or 3; Reading/Hints/Independent each count levels 1/2/3. A Mastery level 0 or missing row is not counted as practised.
- Home stats show em dash until Mastery response returns; real reading/hints/independent levels come from the P4 Mastery endpoint.
- `Quick review` selects saved Reading or With hints (levels 1/2) only; no unstarted topic is falsely marked due. If no reviewable item exists, only display practised filter, no synthetic due item.
- `Continue learning` prefers a saved incomplete item then first available set.
- P4 Topic bank uses common search/filter controls and shared Home components; content card layout remains P4-specific.
- Preserve existing Q1–3, timer, save Practice and Mastery backend.

## Static QA/QC
12/12 source assertions confirmed:
1. Shared bottom nav grid has five equal tracks.
2. Shared welcome-card reused.
3. Shared focus-grid reused.
4. Shared library-section reused.
5. Shared large primary CTA reused.
6. No legacy duplicate P4 Home CSS for obsolete headers/switches / 1020px cap.
7. No P4-only welcome-card styling override.
8. Practised count requires saved level 1–3.
9. Data pending shows em dash.
10. Quick review requires saved level 1 or 2.
11. No extra Part selector in Part4 view.
12. Topic Detail retained.

## Browser QA pending
- Desktop P1/2/3/4 compare gutters & hero width/height/font/padding and progress ring.
- Today cards match height/spacing/colors; first metric labelled Practised with sourced count.
- Validate selected / default filters, Search, Continue learning, Quick review; no unintended server writes on navigation.
- Confirm P4 progress source and values against QA workbook, including scenario with only new/untouched topics; Part 1–3 regression.
- Mobile header, card layout, 5-column bottom nav, no overlays.
- Do not merge/deploy until screenshots and user acceptance.
