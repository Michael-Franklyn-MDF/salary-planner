# Copilot instructions for Salary Planner

## Project context

Salary Planner is a single-user, client-only budgeting PWA for GitHub Pages. It has no backend, accounts, analytics, or network-dependent application features. User data stays in the browser.

Before making a change, read:

- `docs/PRD.md` for product scope and planned features
- `docs/ARCHITECTURE.md` for the data model, calculations, persistence, and PWA behavior
- `docs/TASKS.md` for the current backlog item
- `GEMINI.md` for repository-specific working rules

Work on one task from `docs/TASKS.md` at a time and update that file when the task is complete. Preserve unrelated work already present in the working tree.

## Commands

There is no dependency manifest, install step, build step, automated test suite, or lint configuration.

Run the app from the repository root with either:

```sh
open index.html
python3 -m http.server 8000
open http://localhost:8000
```

The static-server option is the reliable way to test service-worker behavior; service workers generally require a secure context or localhost.

Validation is manual in a desktop and mobile-sized browser:

- Enter and edit income, recurring expenses, one-off costs, and debts; confirm totals and remaining balance update.
- Reload and confirm data persists.
- Use export, clear, and import to verify backup/restore.
- In DevTools, load once online, switch offline, reload, and confirm the app still opens without console errors.
- For a focused change, test the affected user flow rather than looking for a nonexistent test command. There is no single-test runner.

Deployment is static: push the intended changes to `main`; GitHub Pages serves the repository root.

## Architecture

The runtime is intentionally small and contained:

- `index.html` contains the complete UI, embedded CSS, state management, persistence, calculations, and DOM rendering. It is a single scrollable page.
- `manifest.json` defines the installable PWA metadata and icons.
- `sw.js` precaches the app shell and uses cache-first reads with a background network update.
- `icon-192.png` and `icon-512.png` are the PWA icons.

Application state is held in memory and persisted as JSON in `localStorage` under `salary-planner-v1`. The current schema is version 2:

```js
{
  schemaVersion: 2,
  income: 0,
  exp: [],
  oneoff: [],
  debt: [],
  dailySpend: [],
  categories: []
}
```

`migrateState(raw)` normalizes stored/imported data and supplies defaults. `calculateSummary(data)` and `sumItems(items)` are the calculation boundary: keep financial formulas separate from DOM code and preserve the existing summary behavior unless the active task explicitly changes it.

The current UI renders the legacy income/expense/one-off/debt sections. Daily-spend data and category defaults already exist in the model, while the remaining Daily Spend UI work is tracked in `docs/TASKS.md`.

## Repository-specific conventions

- Keep the project dependency-free and static. Do not introduce a backend, build framework, package manager, account system, analytics, or runtime network API.
- Use the existing plain JavaScript style and embedded CSS structure in `index.html`; avoid unrelated reformatting.
- Amounts are stored as numbers in KES and displayed through `fmt()` as `KSh` values. Normalize untrusted local-storage or import data instead of trusting its shape.
- Any data-shape change must be backward-compatible: preserve existing fields, update `schemaVersion`, extend `migrateState`, and never replace valid stored data with defaults.
- The item lists currently use array indexes for editing/removal. Daily-spend records use IDs; do not silently change the existing item model without a migration.
- Input handlers save immediately. Full list rebuilds are reserved for load/add/remove/reset so typing is not interrupted; totals can be updated without rebuilding active inputs.
- Avoid interpolating user text into HTML without the existing escaping pattern (`escapeAttr`), or use DOM properties/APIs that avoid HTML injection.
- Any change to a file in the service-worker precache must bump `CACHE_NAME` in `sw.js`, then verify installation, reload, and offline behavior.
- Keep `manifest.json`, the document theme color, and PWA icons consistent when changing the visual identity.
- During the UI redesign phase, change presentation only; do not alter calculations or stored data unless the task explicitly requires it.
- Follow the documented UX direction for redesign work: mobile-first layout, at least 44px tap targets, accessible contrast, design tokens for shared visual values, and the remaining balance as the home-screen focal point.
- Use focused commits with `feat:`, `fix:`, `style:`, or `docs:` prefixes when committing. Never include real personal financial figures or secrets.
