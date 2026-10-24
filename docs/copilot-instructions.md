# Copilot instructions for Salary Planner v2.1

## Project context

Salary Planner is a single-user budgeting PWA for GitHub Pages: React, TypeScript, Vite, Tailwind. Four tabs (Home, Spend, Calendar, Plan) and a mini player showing "left to spend". There is no backend, no accounts, no analytics. All data stays in the browser.

v2.1 is a UI/UX release: Savanna (light) and Midnight (dark) themes, Inter typeface, a cleaner Home, a launch animation and a bilingual greeting. It also includes a data-safety fix and a structure refactor first (Phase A).

Read these before changing anything:

- `docs/V2.1_PRD.md`: what v2.1 is and why
- `docs/DESIGN_AUDIT.md`: every finding, by ID
- `docs/FLOW.md`: how the app moves and how the numbers work
- `docs/ARCHITECTURE.md`: structure, data model, migration, PWA (section 12 is the v2.1 plan)
- `docs/UI_UX_SPEC.md`: tokens, components, screens
- `docs/TASKS.md`: the backlog and the current task
- `docs/TESTING.md`: automated and manual checks

v1 is archived at tag `v1.0` and in `docs/v1/`. Do not edit it.

## How to work

- Work on one task from `docs/TASKS.md` at a time, in order. State the task before starting.
- Write tests first for anything in `src/domain`, `src/storage` and `src/state`.
- If a task has an open design or product choice, stop and ask the owner. Offer 2 or 3 concrete options.
- Phase A tasks must not change what the app does (except A0, which makes saving work).
- After each task, summarize: what changed, which files, how to test it, what is next. Keep it short.
- Update `docs/TASKS.md` when a task is done, and the other docs if behavior or structure changed.
- Preserve unrelated work already in the working tree.

## Commands

Run from the repository root:

```
Install:    npm install
Dev:        npm run dev
Build:      npm run build
Preview:    npm run preview     (use this to test the service worker)
Lint:       npm run lint
Typecheck:  npm run typecheck
Test:       npm test
```

Run one test file with `npx vitest run path/to/file.test.ts`, or filter by name with `npx vitest run -t "test name"`.

## Code rules

- TypeScript strict. No `any`. No non-null assertions without a comment explaining why.
- `src/domain` is pure: no React, no DOM, no hidden `Date.now()` (pass "today" in).
- Do not add dependencies without asking. Allowed in v2.1: `@fontsource-variable/inter`. Remove `@fontsource-variable/geist` and the unrelated `cn` package. No router, no state library, no date library.
- No backend, no network calls, no analytics.
- Use shared pieces: `lib/format.ts` for money and dates, `Sheet`, `ConfirmDialog`, `ListGroup`. Do not copy a formatter or hand-build a sheet inside a feature.
- Match the existing style. Do not reformat unrelated code.
- Plain, readable code. Comment the why, not the what.
- Never render user text as HTML. Do not use `dangerouslySetInnerHTML`.

## Data safety (most important)

- Never delete or reset user data except through the explicit "Clear all data" flow with confirmation.
- Load saved data before any save. Never call `saveState` before loading has finished successfully.
- Never overwrite stored data if loading or migration fails. Show the error screen instead.
- Keep the storage key `salary-planner-v1`. Do not rename it. Theme choice goes in a separate key, `salary-planner-prefs`, never inside app data.
- Any change to the data shape needs a new `schemaVersion`, a migration, and fixture tests. Do not start one (for example mark-as-paid) without the owner's approval.
- Keep calculation results identical to v1 (`docs/FLOW.md` section 3).
- Never commit real financial figures, backups, or secrets. Use dummy data in tests and fixtures.

## Dates and money

- Amounts are numbers in KES. Round to 2 decimals after summing.
- Dates are `YYYY-MM-DD` in local time. Never use `toISOString()` to get today's date.
- Week starts on Monday.
- Show dates in the one format from `docs/UI_UX_SPEC.md`, never raw `YYYY-MM-DD`.

## Design rules

- Use token classes (`bg-surface`, `text-muted`, `text-title`, and so on). No arbitrary values such as `text-[34px]` or `bg-[color:var(--x)]`, and no hardcoded colours, sizes or radii in components.
- One accent colour. Danger red only for overdue, over budget and destructive actions.
- Tap targets at least 44px. Contrast WCAG AA in both themes.
- Mobile-first. Content is centred with a max width on desktop, and the bars match that width.
- Respect safe-area insets and `prefers-reduced-motion`. Animations under 900 ms and never block a tap.
- Follow `docs/UI_UX_SPEC.md`. If the spec does not cover something, ask.

## PWA rules

- Keep `sw.js`, `manifest.json`, `scope: './'` and `start_url: './index.html'` unchanged so the installed phone app updates in place.
- `theme_color`, `background_color`, name and icons may change as the spec says.
- Test the service worker with `npm run preview`, not `npm run dev`.
- After PWA changes verify: installs, loads offline, update prompt appears after a new build, old data still shows.

## Git

- Work on the `v2.1` branch. One focused commit per task or sub-step.
- Prefixes: `feat:`, `fix:`, `style:`, `test:`, `refactor:`, `docs:`, `chore:`.

## Definition of done

- Tests pass, `npm run lint` and `npm run typecheck` are clean, `npm run build` succeeds.
- Works on a mobile viewport and a desktop browser, in light and dark.
- Works offline.
- Existing data still loads, and data survives closing and reopening the app.
- No console errors.
- `docs/TASKS.md` updated.
