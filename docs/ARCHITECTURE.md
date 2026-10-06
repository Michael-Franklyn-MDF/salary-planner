# Salary Planner: Architecture

Last checked against the repo on 2026-10-06.

## 1. Summary

Static, client-only PWA. No server. All data lives on the device. Deployed as static files on GitHub Pages.

```
Browser / installed PWA
 ├─ UI (vanilla HTML + inline CSS + inline JS)
 ├─ App state + calculations
 ├─ Local storage layer (localStorage)
 └─ Service worker (offline cache)
        ▲
        └── static files from GitHub Pages
```

## 2. Stack

| Layer | Choice |
|---|---|
| Language | JavaScript |
| UI | Single-page app, no framework |
| Styling | Inline CSS in `index.html` |
| Storage | `localStorage` under `salary-planner-v1` |
| Offline | Service worker + web app manifest |
| Hosting | GitHub Pages |

## 3. Expected file layout

```
/
├─ index.html
├─ manifest.json
├─ sw.js                  service worker
├─ icon-192.png           PWA icon
├─ icon-512.png           PWA icon
├─ inline styles          in index.html
├─ inline script          in index.html
└─ docs/                  PRD, ARCHITECTURE, TASKS
```

## 4. Data model

Current stored state:

```
{
  schemaVersion: 1,
  income: number,
  exp:     [{ name: string, amount: number, due: string }],
  oneoff:  [{ name: string, amount: number, due: string }],
  debt:    [{ name: string, amount: number, due: string }]
}
```

Rules:
- The current model has no IDs.
- Amounts are stored as JavaScript numbers.
- `due` is free text, not a parsed date.
- Planned daily-spend work should add stable IDs where needed, migration, `dailySpend[]`, and `categories[]`.

## 5. Calculations

- `committed = sum(exp) + sum(oneoff) + sum(debt)`
- `remaining = income - committed`
- `remainingToSpend = remaining - sum(dailySpend this month)` (NEW)

Current calculation code lives in `index.html` inside `sumOf()` and `renderTotals()`. A future safety-net task should isolate it so the redesign cannot break it.

## 6. Persistence and migration

- The whole state is saved as one JSON object in `localStorage` under `salary-planner-v1`.
- The current object uses `schemaVersion: 1`; legacy objects without `schemaVersion` are normalized on load.
- Adding `dailySpend` and `categories` changes the data shape. On load:
  1. Read stored data.
  2. If `schemaVersion` is missing or older, add the new fields with empty defaults.
  3. Save with the new `schemaVersion`.
- Never overwrite stored data with defaults.

## 7. PWA and offline

- Service worker precaches the app shell and serves cache-first, while refreshing the cache from the network in the background when online.
- Every release that changes cached files must bump the cache version so installed copies update.
- The manifest holds name, icons, `theme_color`, and `background_color`. The redesign must update these.
- Test offline by loading the app, going offline in DevTools, and reloading.

## 8. UI structure

Current screen: a single-page layout with summary/home, income, recurring expenses, upcoming one-off costs, and debts sections.

Planned:
- Add a **Daily Spend** tab.
- Navigation: bottom tab bar (default assumption, owner to confirm).
- Redesign through design tokens in CSS variables:

```
--color-bg, --color-surface, --color-text, --color-muted, --color-accent
--space-1..6, --radius, --font-sans, --text-sm/md/lg/xl
```

## 9. Deployment

- Push or merge to the `main` branch. GitHub Pages serves the static files from this repo.
- After deploy: open the live URL, hard refresh, confirm the new service worker version activates, and check the installed app updates.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Data loss on schema change | Versioned migration, test with old data first |
| Stale cache after deploy | Bump the service worker cache version every release |
| Calculation bugs during redesign | Keep calculations isolated, redesign is visual only |
| Browser storage cleared | Consider a simple export/import backup (see TASKS) |
