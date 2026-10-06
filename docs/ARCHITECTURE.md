# Salary Planner: Architecture

Items marked **[CONFIRM]** were written without access to the code. Verify and correct them.

## 1. Summary

Static, client-only PWA. No server. All data lives on the device. Deployed as static files on GitHub Pages.

```
Browser / installed PWA
 ├─ UI (HTML + CSS + JS)            [CONFIRM: vanilla or framework]
 ├─ App state + calculations
 ├─ Local storage layer             [CONFIRM: localStorage or IndexedDB]
 └─ Service worker (offline cache)
        ▲
        └── static files from GitHub Pages
```

## 2. Stack

| Layer | Choice |
|---|---|
| Language | JavaScript **[CONFIRM]** |
| UI | Single-page app **[CONFIRM: framework or none]** |
| Styling | CSS **[CONFIRM]** |
| Storage | Browser storage **[CONFIRM which]** |
| Offline | Service worker + web app manifest |
| Hosting | GitHub Pages |

## 3. Expected file layout

**[CONFIRM]** against the repo.

```
/
├─ index.html
├─ manifest.json (or .webmanifest)
├─ sw.js                  service worker
├─ icons/                 PWA icons
├─ css/ or inline styles
├─ js/ or inline script
└─ docs/                  PRD, ARCHITECTURE, TASKS
```

## 4. Data model

**[CONFIRM]** field names and shapes in the code. Intended model:

```
income:        { monthlyAmount }
recurring[]:   { id, name, amount }
upcoming[]:    { id, name, amount, dueDate }
debts[]:       { id, name, totalOwed, monthlyPayment?, paid? }
dailySpend[]:  { id, amount, category, date (YYYY-MM-DD), note? }   // NEW
categories[]:  { id, name }                                         // NEW
meta:          { schemaVersion }
```

Rules:
- IDs are unique and stable.
- Amounts are stored as numbers in whole currency units, or integers in minor units, whichever the app already uses. **[CONFIRM]** Do not mix.
- Dates are stored as `YYYY-MM-DD`.

## 5. Calculations

**[CONFIRM]** the exact formulas in the code. Intended:

- `committed = sum(recurring) + monthly debt payments + upcoming costs due this month`
- `remaining = income - committed`
- `remainingToSpend = remaining - sum(dailySpend this month)` (NEW)

Keep calculation code in one place, separate from UI code, so the redesign cannot break it.

## 6. Persistence and migration

- The whole state is saved under one versioned key, or one object store **[CONFIRM]**.
- Adding `dailySpend` and `categories` changes the data shape. On load:
  1. Read stored data.
  2. If `schemaVersion` is missing or older, add the new fields with empty defaults.
  3. Save with the new `schemaVersion`.
- Never overwrite stored data with defaults.

## 7. PWA and offline

- Service worker precaches the app shell and serves cache-first, with network fallback **[CONFIRM strategy]**.
- Every release that changes cached files must bump the cache version so installed copies update.
- The manifest holds name, icons, `theme_color`, and `background_color`. The redesign must update these.
- Test offline by loading the app, going offline in DevTools, and reloading.

## 8. UI structure

Current screens **[CONFIRM]**: summary/home, income, recurring, upcoming, debts.

Planned:
- Add a **Daily Spend** tab.
- Navigation: bottom tab bar (default assumption, owner to confirm).
- Redesign through design tokens in CSS variables:

```
--color-bg, --color-surface, --color-text, --color-muted, --color-accent
--space-1..6, --radius, --font-sans, --text-sm/md/lg/xl
```

## 9. Deployment

- Push to the main branch. GitHub Pages serves it **[CONFIRM branch and path]**.
- After deploy: open the live URL, hard refresh, confirm the new service worker version activates, and check the installed app updates.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Data loss on schema change | Versioned migration, test with old data first |
| Stale cache after deploy | Bump the service worker cache version every release |
| Calculation bugs during redesign | Keep calculations isolated, redesign is visual only |
| Browser storage cleared | Consider a simple export/import backup (see TASKS) |
