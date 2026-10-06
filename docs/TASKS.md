# Salary Planner: Task Backlog

Work top to bottom. One task at a time. Update this file after each task.

Status: `[ ]` todo, `[~]` in progress, `[x]` done

## Phase 0: Setup

- [ ] **T0.1** Inspect the repo and correct every **[CONFIRM]** item in `PRD.md`, `ARCHITECTURE.md`, and `GEMINI.md`.
- [ ] **T0.2** Move the docs into `/docs` and put `GEMINI.md` at the repo root.
- [ ] **T0.3** Confirm the app runs locally and works offline. Record the commands in `GEMINI.md`.
- [ ] **T0.4** Create a git branch per phase.

## Phase 1: Safety net (before changing data)

- [ ] **T1.1** Add `schemaVersion` to stored data, with a migration function that preserves existing data.
  - Done when: loading old data works and nothing is lost.
- [ ] **T1.2** Isolate calculation code from UI code if it is mixed.
  - Done when: calculations live in one place and results are unchanged.
- [ ] **T1.3** Add export/import of data as a JSON file (backup).
  - Done when: export, clear data, import restores everything.

## Phase 2: Daily spend tab

- [ ] **T2.1** Extend the data model: `dailySpend[]` and `categories[]` with defaults. Migrate.
- [ ] **T2.2** Add the Daily Spend tab to navigation (empty state included).
- [ ] **T2.3** Add-entry form: amount, category, date (default today), note. Validate amount.
  - Done when: an entry can be added in under 10 seconds.
- [ ] **T2.4** List entries grouped by day, newest first. Edit and delete.
- [ ] **T2.5** Show today's total and month total.
- [ ] **T2.6** Add `remainingToSpend` to the summary using the existing calculation.
- [ ] **T2.7** Manage categories (add, rename, delete with entries kept).
- [ ] **T2.8** Bump service worker cache version and test offline.

## Phase 3: UI/UX redesign (visual only)

Decisions needed from the owner before starting T3.2. Ask and offer 2 to 3 options each:
- Color direction and dark mode
- Logo concept
- Navigation pattern

- [ ] **T3.1** Audit the current UI. List the problems in a short note (hierarchy, spacing, contrast, tap targets).
- [ ] **T3.2** Agree the direction with the owner: palette, type, logo, nav.
- [ ] **T3.3** Introduce design tokens (CSS variables) and replace hardcoded values.
- [ ] **T3.4** Redesign the home/summary screen with "what's left" as the hero.
- [ ] **T3.5** Redesign the Daily Spend tab.
- [ ] **T3.6** Redesign income, recurring, upcoming, and debts screens.
- [ ] **T3.7** New logo and PWA icons (all sizes, maskable). Update manifest `theme_color` and `background_color`.
- [ ] **T3.8** Accessibility pass: contrast, tap targets, labels, focus states.
- [ ] **T3.9** Bump service worker cache version, test install and offline, run Lighthouse.

## Phase 4: Release

- [ ] **T4.1** Test with real old data from the installed app (use export from T1.3 first).
- [ ] **T4.2** Merge to main, deploy to GitHub Pages.
- [ ] **T4.3** Confirm the installed PWA updates and data is intact.

## Later (not committed)

- [ ] Monthly history and simple charts
- [ ] Recurring daily-spend reminders
- [ ] Debt payoff projection

## Current task

None selected. Start with **T0.1**.
