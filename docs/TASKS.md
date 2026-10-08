# Salary Planner v2: Task Backlog

Work top to bottom. One task at a time. State the task before starting. Update this file after each task.

Status: `[ ]` todo, `[~]` in progress, `[x]` done

## Phase 0: Setup

- [x] **T0.1** Tag the current `main` as `v1.0`. Create the branch `v2`. (Owner runs the git commands.)
- [x] **T0.2** Archive the v1 docs into `docs/v1/`. Put the v2 docs in `docs/`. Replace `.github/copilot-instructions.md`. Ask the owner before deleting `GEMINI.md` (superseded by Copilot).
- [x] **T0.3** Scaffold Vite + React + TypeScript in the repo root. Remove the v1 root files on this branch (they remain at `v1.0`). Set `base` in `vite.config.ts` to match the live Pages path. Confirm the live URL first.
- [x] **T0.4** Add Tailwind and initialise shadcn/ui. Add ESLint, Vitest, and these scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`.
- [x] **T0.5** Fill in the real commands in `.github/copilot-instructions.md` and confirm each one runs.



## Phase 1: Domain core (no UI)

Write the tests first, then the code.

- [x] **T1.1** `domain/types.ts`: the v3 types from `ARCHITECTURE.md`.
- [x] **T1.2** `domain/calc.ts` with tests.
  - Income 100000, recurring 30000, one-off 10000, debt 20000, spend this month 5000: remaining 40000, remainingToSpend 35000.
  - Empty state: everything 0.
  - Spend dated last month is ignored. Spend dated today is included.
  - A non-numeric amount counts as 0.
  - `0.1 + 0.2` style inputs return 0.3, not 0.30000000000000004.
  - Overspent state returns a negative `remainingToSpend`.
- [x] **T1.3** `domain/dates.ts` with tests: local `today()`, `daysInMonth`, `lastDayOfMonth`, `isValidDateString`.
  - February 2024 has 29 days, February 2025 has 28.
  - `today()` at 00:30 local time returns the local date, not the UTC date.
  - `2025-02-30` is invalid.
- [x] **T1.4** `domain/migrate.ts` with tests and fixtures (dummy data only).
  - v1 fixture (no `schemaVersion`, only `income`, `exp`, `oneoff`, `debt`) migrates with no item lost.
  - v2 fixture (with `dailySpend` and `categories`) migrates with entries and categories intact.
  - `due: "5th"` becomes `dayOfMonth: 5`, note empty. `due: "end of month"` becomes `'last'`.
  - `due: "when Dad pays"` becomes `dayOfMonth: null`, note `"when Dad pays"`.
  - One-off `due: "2026-11-03"` becomes `date: "2026-11-03"`. `due: "soon"` becomes `date: null`, note `"soon"`.
  - Garbage input (`null`, a string, an array) returns a valid default state without throwing.
  - Running `migrateState` twice gives the same result.
  - `schemaVersion: 4` is rejected.
- [ ] **T1.5** `domain/calendar.ts` with tests.
  - Recurring on day 31 appears on 28 Feb 2025, 29 Feb 2024, 30 Apr, 31 May.
  - `'last'` appears on the last day of every month.
  - One-off appears only on its date.
  - Debt with `endDate: 2026-12-15` appears on 15 Dec 2026 and not on 15 Jan 2027.
  - Item with `null` day or date never appears.
  - Range query across a month boundary returns items in date order.
- [ ] **T1.6** `storage/storage.ts`: load, save, pre-migration raw backup, error path. Tests with a fake `localStorage`.
  - First load of v2 data creates `salary-planner-v1-pre-v3-backup` and does not overwrite it on the next load.
  - Corrupt JSON does not overwrite stored data and returns an error result.
- [ ] **T1.7** `storage/backup.ts`: export to JSON file, import from file (v1, v2, v3). Tests for each version and for a rejected file.



## Phase 2: App shell and Plan tab

- [ ] **T2.1** State: `AppStateProvider` and reducer (add, update, delete for each list, set income, replace all, clear). Reducer tests.
- [ ] **T2.2** Design tokens in `styles/index.css`, light and dark, from `UI_UX_SPEC.md`. Theme the shadcn components to match.
- [ ] **T2.3** `TabBar` (four tabs, bottom, translucent) and `MiniPlayer` (hidden on Home, tap opens Home).
- [ ] **T2.4** Plan tab: income row and the three grouped lists with the add/edit/delete bottom sheet. Show a "No date" tag on items without a day or date.
- [ ] **T2.5** Plan tab "Data" group: export, import, clear all, with in-app confirmation dialogs.



## Phase 3: Spend tab

- [ ] **T3.1** Keypad and amount display. Blocks a third decimal place and a second `.`. Backspace works. Add is disabled at 0.
- [ ] **T3.2** Category chips, date picker (default today), optional note. Adding an entry takes under 10 seconds.
- [ ] **T3.3** Entry list grouped by day, newest first. Edit and delete in a bottom sheet.
- [ ] **T3.4** Today and month totals. Categories management (add, rename, delete with entries moved to "Other").



## Phase 4: Home tab

- [ ] **T4.1** Hero "Left to spend" with correct colour state and caption.
- [ ] **T4.2** "After commitments" line and summary cards.
- [ ] **T4.3** "Coming up" list (next three due items in 14 days). Tap opens that day in Calendar.



## Phase 5: Calendar tab

- [ ] **T5.1** Week strip (Monday start) with day selection and week navigation.
- [ ] **T5.2** Day view with **Due** and **Spent** groups.
- [ ] **T5.3** Month grid toggle with day markers.
- [ ] **T5.4** Empty states (nothing due, nothing spent, no dated items yet).



## Phase 6: PWA and polish

- [ ] **T6.1** `vite-plugin-pwa` with manifest parity (`sw.js`, `manifest.json`, `scope`, `start_url` unchanged).
- [ ] **T6.2** Update prompt toast and legacy cache cleanup (`salary-planner-v`*).
- [ ] **T6.3** New icons (any and maskable), logo, `theme_color`, `background_color`. Open design choices go to the owner first.
- [ ] **T6.4** Accessibility pass: contrast in both themes, 44px targets, labels, focus states, screen reader order, reduced motion.
- [ ] **T6.5** Lighthouse (PWA, accessibility) on the built app. Fix what it flags.



## Phase 7: Release

- [ ] **T7.1** Owner exports a backup from the live v1 app on the phone and keeps it safe. Do not commit it.
- [ ] **T7.2** Import that real backup into the v2 build locally. Check every item, total, and entry against v1.
- [ ] **T7.3** Add `deploy.yml`. Switch the Pages source to "GitHub Actions".
- [ ] **T7.4** Merge `v2` into `main`. Confirm the deploy succeeds.
- [ ] **T7.5** On the phone: open the installed app, accept the update, confirm data is intact and it loads offline.
- [ ] **T7.6** Write the rollback steps in `README.md` and tag `v2.0`.



## Later (not committed)

- [ ] Monthly history and simple charts
- [ ] Recurring spend reminders
- [ ] Debt payoff projection
- [ ] Manual light/dark toggle



## Current task

Next up: **T1.5** (`domain/calendar.ts` with tests).