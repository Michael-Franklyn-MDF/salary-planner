# Salary Planner v2.1: Task Backlog

Work top to bottom, one task at a time. State the task before starting. Update this file after each task. One focused commit per task, on the `v2.1` branch.

Status: `[ ]` todo, `[~]` in progress, `[x]` done. Task sources: `V2.1_PRD.md` and `DESIGN_AUDIT.md` (IDs in brackets).

## v2 (released)

Phases 0 to 7 of v2 are complete: setup, domain core, Plan, Spend, Home, Calendar, PWA and release (tag `v2.0`, live on GitHub Pages).
Not verified: **T7.5** (on the phone: data intact after update). Data persistence turned out not to be wired in (audit X-01), so this is covered by A0 below.

## Phase A: Data safety and architecture

No behavior change except A0. A1 may change date labels to the formats in the spec. Each task keeps all existing tests green.

- [~] **A0 (release blocker)** Wire storage into the app [X-01].
  - Tests first, in `src/state/AppStateProvider.test.tsx` and `src/storage`: empty storage gives the empty state; stored v3 data loads; stored v1 data migrates and the raw backup key `salary-planner-v1-pre-v3-backup` is written before parsing; corrupt data shows the error screen and leaves storage untouched; add an item, unmount, remount, the item is there; a failed save shows a visible message.
  - `AppStateProvider` loads with a lazy initializer from `loadState()`. On failure render a `StorageErrorScreen` with "Download raw data". Save with `saveState` after every state change, skipping the first run and skipping entirely if loading failed.
  - Load always runs before any save.
  - Manual check on the phone (see `TESTING.md` items 1 and 2) is required before A0 can be marked done. Owner authorized continuing while these checks remain pending.
- [x] **A1** `src/lib/format.ts` with `formatMoney` and date formatters, tested. Replace the five copies of `formatAmount` [X-02]. One date format everywhere [G-07]. No visible change except dates.
- [x] **A2** Register colours and type sizes in Tailwind `@theme` (names in `UI_UX_SPEC.md`). Replace arbitrary values such as `text-[color:var(--text-muted)]` and `text-[34px]` with token classes [X-03]. Screens look the same as before.
- [x] **A3** Shared `Sheet`, `ConfirmDialog` and `ListGroup` components. Use them in `SpendTab` and `PlanTab`, then split those files into smaller parts [X-04].
- [x] **A4** Keep an unsaved Spend amount when switching tabs [X-05].
- [x] **A5** Cleanup in one commit [X-06, X-07]: remove the stray `@/` folder (first check nothing imports it), unused Vite template files (`src/App.css`, `src/assets/*`), committed `.DS_Store` files (add to `.gitignore`), the unrelated `cn` package (use `clsx` plus `tailwind-merge` in `src/lib/cn.ts`), `@fontsource-variable/geist`, and move `shadcn` out of runtime dependencies. Update this file and `README.md`.

## Phase B: Behavior

- [ ] **B1** Cold-launch sequence on Home: `useColdLaunch()` with a `sessionStorage` flag. Ring draws and number counts up under 900 ms, bars slide in. Never on tab switches. Instant under reduced motion [B-01].
- [ ] **B2** Bilingual greeting: `lib/greetings.ts` (English, Spanish). Shows the first, swaps once, stays. Same cold-launch rule [B-02, G-05].
- [ ] **B3** Home first-run state: neutral zero and an EmptyState with an Open Plan button [H-04].
- [ ] **B4** Spend fits one view: amount, chips, all 12 keys and Add visible without scrolling on a 360 x 640 viewport, amount visible while typing [S-01].
- [ ] **B5** Plan: items with no day show an "Add day" prompt [P-02]. Verify the v2 to v2.1 update path on the phone [B-04].
- [ ] **B6 (needs owner decision first)** Mark as paid on due items [C-03, B-03]. Needs `schemaVersion` 4, a migration, fixture tests and no effect on the calculation. Ask the owner before starting.

## Phase C: Visual

- [ ] **C1** Savanna and Midnight tokens in `theme.css`, `data-theme` handling, inline pre-render script to avoid a flash, per-scheme `theme-color` meta tags, manifest `theme_color` and `background_color` [G-01, G-06]. Keep `scope` and `start_url`.
- [ ] **C2** Inter via `@fontsource-variable/inter`, fallback stack, confirm it is precached and works offline [G-08].
- [ ] **C3** Home layout: greeting, hero with HeroAmount and Ring, "Add spend" button, "Where it goes" breakdown, Coming up [H-01, H-02, H-03, H-05, H-06].
- [ ] **C4** Spend polish: AmountDisplay alignment, chips (hidden scrollbar, fade, accent), keypad key shapes and pressed state, compact summary line, Recent day totals [S-02 to S-08].
- [ ] **C5** Calendar polish: 44px controls, dots on every day with items, today ring, selected fill [C-01, C-02].
- [ ] **C6** Plan polish: counts and totals on headers, chevrons, helper text on backup, "Clear all data" in its own group [P-01, P-03, P-04].
- [ ] **C7** Mini player and tab bar: new tokens, within content width on wide screens, bottom padding on scroll areas [G-04, G-09, S-07].
- [ ] **C8** Sentence-case section labels and contrast check of every text and background pair in both themes [G-03].
- [ ] **C9** New logo and app icons in the Savanna palette; add `<link rel="icon">` for `favicon.svg`.

## Phase D: Later

- [ ] **D1** Settings button (top right) and sheet with Appearance: System, Light, Dark. Choice stored under `salary-planner-prefs` [B-05].
- [ ] **D2** Wide-screen refinements.
- [ ] Greeting languages in settings, more languages in the list.

## Release

- [ ] **R1** All automated checks pass and the manual phone checklist in `TESTING.md` passes.
- [ ] **R2** Owner exports a fresh backup from the installed app and keeps it safe. Do not commit it.
- [ ] **R3** Merge `v2.1` into `main`, confirm the Pages deploy succeeds.
- [ ] **R4** On the phone: accept the update prompt, confirm data is intact, loads offline, theme and animation behave. Tag `v2.1`.

## Current task

B1: cold-launch sequence on Home.
