# Copilot instructions for Salary Planner v2

## Project context

Salary Planner is a single-user budgeting PWA for GitHub Pages. v2 is a React + TypeScript rebuild with four tabs (Home, Spend, Calendar, Plan), a mini-player showing "left to spend", and an Apple-style design. There is no backend, no accounts, no analytics. All data stays in the browser.

Read these before changing anything:

- `docs/PRD.md`: what to build and why
- `docs/ARCHITECTURE.md`: structure, data model, migration, PWA
- `docs/UI_UX_SPEC.md`: tokens, components, screens
- `docs/TASKS.md`: the backlog and the current task

v1 (vanilla JS) is archived at tag `v1.0` and in `docs/v1/`. Do not edit it.

## How to work

- Work on one task from `docs/TASKS.md` at a time. State the task before starting.
- Write tests first for anything in `src/domain` and `src/storage`.
- If a task has an open design or product choice, stop and ask the owner. Offer 2 or 3 concrete options.
- After each task, summarize: what changed, which files, how to test it, what is next. Keep it short.
- Update `docs/TASKS.md` when a task is done, and update the other docs if behaviour or structure changed.
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

There is no single-test script. Run one Vitest file with `npx vitest run path/to/file.test.ts` or filter a test name with `npx vitest run -t "test name"`.

## Code rules

- TypeScript strict. No `any`. No non-null assertions without a comment explaining why.
- `src/domain` is pure: no React, no DOM, no `Date.now()` hidden inside (pass "today" in).
- Do not add dependencies without asking. Allowed: React, Tailwind, shadcn/ui and its Radix/vaul parts, lucide-react, vite-plugin-pwa, Vitest, React Testing Library, Sonner.
- No router library, no state library, no date library.
- No backend, no network calls, no analytics.
- Match the existing style. Do not reformat unrelated code.
- Plain, readable code. Comment the why, not the what.
- Never render user text as HTML. React escapes by default; do not use `dangerouslySetInnerHTML`.

## Data safety (most important)

- Never delete or reset user data except through the explicit "Clear all data" flow with confirmation.
- Never overwrite stored data if loading or migration fails. Show the error screen instead.
- Keep the storage key `salary-planner-v1`. Do not rename it.
- Any change to the data shape needs a new `schemaVersion`, a migration, and fixture tests.
- Keep v1 calculation results identical (see `docs/PRD.md` section 4).
- Never commit real financial figures, backups, or secrets. Use dummy data in tests and fixtures.

## Dates and money

- Amounts are numbers in KES. Round to 2 decimals after summing.
- Dates are `YYYY-MM-DD` in local time. Never use `toISOString()` to get today's date.
- Week starts on Monday.

## Design rules

- Use design tokens only. No hardcoded colours, sizes, or radii in components.
- Tap targets at least 44px. Contrast WCAG AA in both light and dark.
- Mobile-first. Content is centred with a max width on desktop.
- Respect safe-area insets and `prefers-reduced-motion`.
- Follow `docs/UI_UX_SPEC.md`. If the spec does not cover something, ask.

## PWA rules

- Keep `sw.js`, `manifest.json`, `scope: './'`, and `start_url: './index.html'` unchanged so the installed phone app updates in place.
- Test the service worker with `npm run preview`, not `npm run dev`.
- After PWA changes, verify: installs, loads offline, update prompt appears after a new build, old data still shows.

## Git

- Work on the `v2` branch. One focused commit per task or sub-step.
- Prefixes: `feat:`, `fix:`, `style:`, `test:`, `refactor:`, `docs:`, `chore:`.

## Definition of done

- Tests pass, `npm run lint` and `npm run typecheck` are clean, `npm run build` succeeds.
- Works on a mobile viewport and a desktop browser, in light and dark.
- Works offline.
- Existing data still loads.
- No console errors.
- `docs/TASKS.md` updated.
