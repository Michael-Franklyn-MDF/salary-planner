# Salary Planner: Architecture

Status: verified against codebase.

## 1. Summary

Static, client-only PWA. No server. All data lives on the device. Deployed as static files on GitHub Pages.

```
Browser / installed PWA
 ├─ UI (HTML + CSS + JS)            (vanilla, single index.html file)
 ├─ App state + calculations        (pure functions in index.html)
 ├─ Local storage layer             (localStorage: 'salary-planner-v1')
 └─ Service worker (offline cache)  (sw.js: cache-first with network update)
        ▲
        └── static files from GitHub Pages
```

## 2. Stack

| Layer | Choice |
|---|---|
| Language | JavaScript (ES6+, vanilla) |
| UI | Single-page app (vanilla JS, embedded in `index.html`) |
| Styling | Vanilla CSS (embedded `<style>` in `index.html`) |
| Storage | Browser `localStorage` (key: `salary-planner-v1`) |
| Offline | Service worker (`sw.js`) + web app manifest (`manifest.json`) |
| Hosting | GitHub Pages (served from `main` branch) |

## 3. Current file layout

```
/
├─ index.html             UI, styles, scripts, and calculations
├─ manifest.json          web app manifest
├─ sw.js                  service worker (cache name: salary-planner-v5)
├─ icon-192.png           Maskable PWA icon (192x192)
├─ icon-512.png           Maskable PWA icon (512x512)
├─ logo.svg               Wallet/ledger app mark
├─ GEMINI.md              agent rules and commands
└─ docs/
   ├─ PRD.md              requirements
   ├─ ARCHITECTURE.md     architecture & data design
   └─ TASKS.md            task backlog
```

## 4. Data model

Current data model in code (`localStorage['salary-planner-v1']`):

```javascript
{
  schemaVersion: 1,
  income: 0,           // number (monthly take-home)
  exp: [],             // array of { name: string, amount: number, due: string }
  oneoff: [],          // array of { name: string, amount: number, due: string }
  debt: []             // array of { name: string, amount: number, due: string }
}
```

Current model:

```javascript
{
  schemaVersion: 2,
  income: 0,
  exp: [],             // { id, name, amount, due }
  oneoff: [],          // { id, name, amount, due }
  debt: [],            // { id, name, amount, due }
  dailySpend: [],      // { id, amount, category, date (YYYY-MM-DD), note? }
  categories: []       // { id, name }
}
```

Rules:
- Amounts are stored as decimal numbers in KES (`parseFloat` / `Number`), formatted for display via `fmt(n)` to 2 decimals with thousands separators.
- Legacy item lists use index-based manipulation; daily spend records use unique IDs.
- Due field in v1 is a free-text input for due date or notes. Daily spend dates will use strict `YYYY-MM-DD`.

## 5. Calculations

Formulas in code (`calculateSummary(data)`):

- `expTotal = sum(exp.amount)`
- `oneoffTotal = sum(oneoff.amount)`
- `debtTotal = sum(debt.amount)`
- `outflow = expTotal + oneoffTotal + debtTotal`
- `remaining = income - outflow`

Current addition:
- `dailySpendTotal = sum(dailySpend this month)`
- `remainingToSpend = remaining - dailySpendTotal`

Calculations are encapsulated in `calculateSummary()` and `sumItems()`, isolated from DOM manipulation.

## 6. Persistence and migration

- State is saved in `localStorage` under key `'salary-planner-v1'`.
- State has `schemaVersion: 2`. Migration function `migrateState(raw)` sanitizes input and assigns defaults.
- Adding `dailySpend` and `categories` changes the data shape:
  1. Read stored data.
  2. If `schemaVersion` is missing or older, add the new fields with empty defaults.
  3. Save with the new `schemaVersion`.
- Never overwrite stored data with defaults.

## 7. PWA and offline

- Service worker precaches `['./index.html', './manifest.json', './icon-192.png', './icon-512.png']`.
- Caching strategy: Cache-first with network update (serves from cache if present, fetches network in background to update cache).
- Every release that changes cached files must bump `CACHE_NAME` in `sw.js` (currently `salary-planner-v11`).
- Manifest holds `name`, `short_name`, `theme_color` (`#C9A227`), `background_color` (`#12181B`), and maskable PNG icons.
- Test offline by loading the app, going offline in DevTools, and reloading.

## 8. UI structure

Current structure: Single-page vertical scroll with Overview and Daily Spend tabs. The Overview tab contains:
1. Header & description
2. Summary card (income, recurring, upcoming, debts, remaining balance)
3. Income input section
4. Recurring expenses list with inline inputs and "+ Add expense" button
5. Upcoming one-off costs list with inline inputs and "+ Add upcoming cost" button
6. Debts to repay list with inline inputs and "+ Add debt" button
7. Footer with "Clear all data" button and transient "Saved" status indicator

The Daily Spend tab contains today and current-month totals, an entry form for amount, category, date, and optional note, category management, and entries grouped by date descending. Categories can be added and renamed; deleting a category moves its existing entries to `Other`. Entries are normalized and saved to `dailySpend`.

Planned:
- Add a **Daily Spend** tab.
- Navigation: bottom tab bar (to confirm with owner).
- Redesign through design tokens in CSS variables:

```
--color-bg, --color-surface, --color-text, --color-muted, --color-accent
--space-1..6, --radius, --font-sans, --text-sm/md/lg/xl
```

The current token names are implemented in `index.html` as `--bg`, `--panel`, `--line`, `--text`, `--dim`, `--accent`, `--good`, `--bad`, `--space-1..6`, `--radius-sm/md/lg`, `--font-sans`, and `--control-size`.

## 9. Deployment

- Push to the `main` branch. GitHub Pages serves static files directly from root.
- After deploy: open the live URL, hard refresh, confirm the new service worker version activates, and check the installed app updates.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Data loss on schema change | Versioned migration, test with old data first |
| Stale cache after deploy | Bump the service worker cache version every release |
| Calculation bugs during redesign | Keep calculations isolated, redesign is visual only |
| Browser storage cleared | Consider a simple export/import backup (see TASKS) |
