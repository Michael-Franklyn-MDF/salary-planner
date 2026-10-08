# Salary Planner v2: Architecture

Status: planned. Update this file whenever the structure changes.

## 1. Summary

Static, client-only PWA built with Vite. No server. Data lives on the device. Deployed to GitHub Pages by a GitHub Actions workflow.

```
Browser / installed PWA
 ├─ React UI (4 tabs + mini-player)     src/features, src/components
 ├─ App state (context + reducer)       src/state
 ├─ Domain logic (pure TypeScript)      src/domain   <- no React, fully tested
 ├─ Storage (localStorage)              src/storage
 └─ Service worker (vite-plugin-pwa)    src/pwa
```

## 2. Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (`strict: true`, no `any`) |
| Build | Vite |
| UI | React |
| Styling | Tailwind CSS with CSS-variable design tokens |
| Components | shadcn/ui, themed to the Apple look (Button, Input, Label, Drawer, AlertDialog, Sonner) |
| Icons | lucide-react |
| State | React context + `useReducer`. No state library. |
| Storage | `localStorage`, key `salary-planner-v1` (unchanged from v1) |
| Tests | Vitest (domain logic first), React Testing Library for key flows |
| PWA | `vite-plugin-pwa` |
| Hosting | GitHub Pages via GitHub Actions |

Use current stable versions. Run the official `npm create vite@latest` and `npx shadcn@latest init` flows and follow their output. Do not add other runtime dependencies without asking (no date libraries, no router, no state library).

## 3. Folder layout

```
/
├─ index.html
├─ vite.config.ts              base: '/salary-planner/'  (must match the Pages path)
├─ package.json
├─ public/                     icons (192, 512, maskable), logo.svg
├─ .github/
│  ├─ copilot-instructions.md
│  └─ workflows/deploy.yml
├─ docs/                       PRD, ARCHITECTURE, TASKS, UI_UX_SPEC, v1/ (archived)
└─ src/
   ├─ main.tsx, App.tsx
   ├─ domain/                  types.ts, calc.ts, migrate.ts, dates.ts, calendar.ts (+ *.test.ts)
   ├─ storage/                 storage.ts, backup.ts
   ├─ state/                   AppStateProvider.tsx, reducer.ts, selectors.ts
   ├─ features/                home/, spend/, calendar/, plan/
   ├─ components/              ui/ (shadcn), TabBar.tsx, MiniPlayer.tsx, GroupedList.tsx ...
   ├─ pwa/                     register.ts, UpdatePrompt.tsx, legacyCache.ts
   └─ styles/                  index.css (tokens, light and dark)
```

Rule: `src/domain` and `src/storage` never import React or touch the DOM (storage may use `localStorage`).

## 4. Data model (schema v3)

```ts
type Id = string;                       // crypto.randomUUID(), with a fallback
type DayOfMonth = number | 'last';      // 1..31 or 'last'

interface RecurringExpense { id: Id; name: string; amount: number; dayOfMonth: DayOfMonth | null; note: string }
interface OneOffCost       { id: Id; name: string; amount: number; date: string | null; note: string }   // YYYY-MM-DD
interface Debt             { id: Id; name: string; amount: number; dayOfMonth: DayOfMonth | null; endDate: string | null; note: string }
interface Category         { id: Id; name: string }
interface DailySpend       { id: Id; amount: number; category: Id; date: string; note: string }          // YYYY-MM-DD

interface AppState {
  schemaVersion: 3;
  income: number;
  recurring: RecurringExpense[];
  oneOffs: OneOffCost[];
  debts: Debt[];
  dailySpend: DailySpend[];
  categories: Category[];
}
```

Rules:
- Amounts are numbers in KES. Display with the same `fmt()` behaviour as v1 (`KSh` prefix, up to 2 decimals, thousands separators).
- Dates are strict `YYYY-MM-DD` strings in local time. Never use `toISOString()` for "today" (it shifts the day near midnight in UTC). Use a local-date helper in `dates.ts`.
- The default category `cat-other` always exists. Entries pointing at a missing category are shown under "Other".

## 5. Calculations (`domain/calc.ts`)

Must produce the same numbers as v1.

- `recurringTotal`, `oneOffTotal`, `debtTotal` = sum of `amount`, ignoring non-finite values
- `outflow = recurringTotal + oneOffTotal + debtTotal`
- `remaining = income - outflow`
- `spentThisMonth` = sum of `dailySpend.amount` where `date` starts with the current `YYYY-MM`
- `remainingToSpend = remaining - spentThisMonth`
- Round results to 2 decimals after summing to avoid floating-point noise.

All functions take the state and a "today" string as arguments, so tests do not depend on the clock.

## 6. Calendar logic (`domain/calendar.ts`)

`dueItemsForDate(state, date)` returns recurring items, debts, and one-offs due that day. `dueItemsForRange(state, from, to)` is used by Home "Coming up".

- `dayOfMonth: 'last'` means the last day of that month.
- A number larger than the month length clamps to the last day.
- Debts with `endDate` stop after that date. Items with `null` date or day never appear.

## 7. Persistence and migration (`domain/migrate.ts`, `storage/`)

- Load: read `salary-planner-v1`, parse, run `migrateState(raw)`, validate, then use. Save on every state change.
- Before the first migration, copy the raw stored string to `salary-planner-v1-pre-v3-backup` if that key does not exist yet. Never overwrite it.
- If parsing or migration throws, do not overwrite stored data. Show an error screen with a "Download raw data" button.
- Import accepts v1, v2, and v3 files. A file with `schemaVersion` above 3 is rejected with a clear message.

### Migration rules

| From | To |
|---|---|
| v1/v2 `exp[]` | `recurring[]` with new `id`; `due` text becomes `dayOfMonth` if it is a plain number 1 to 31 (optionally with st/nd/rd/th) or says "last day"/"end of month", otherwise `dayOfMonth: null` and `note = due` |
| v1/v2 `oneoff[]` | `oneOffs[]` with new `id`; `due` becomes `date` if it is already `YYYY-MM-DD`, otherwise `date: null` and `note = due` |
| v1/v2 `debt[]` | `debts[]` with new `id`; same `due` rule as recurring; `endDate: null` |
| `income`, `dailySpend`, `categories` | carried over; missing or invalid pieces get safe defaults (same normalization as v1 `migrateState`) |
| Missing `categories` | default list from v1 (`cat-food`, `cat-transport`, `cat-bills`, `cat-shopping`, `cat-entertainment`, `cat-other`) |

Migration must be idempotent: running it on v3 data returns the same data.

## 8. PWA

- `vite-plugin-pwa` with `registerType: 'prompt'`. When a new version is ready, show an "Update available" toast with an **Update** action instead of waiting for a second launch.
- Keep these identical to v1 so the installed phone app updates in place: service worker filename `sw.js`, manifest filename `manifest.json`, `scope: './'`, `start_url: './index.html'`.
- Update `name`, `short_name`, `theme_color`, `background_color`, and icons to the new design. Provide separate `any` and `maskable` icon entries.
- On startup, delete legacy caches whose names start with `salary-planner-v` (the v1 service worker cache, e.g. `salary-planner-v17`).
- Offline: the app shell and assets are precached. There are no runtime network calls.

## 9. Deployment

- `.github/workflows/deploy.yml` builds with `npm ci && npm run build` and publishes `dist/` with the official Pages actions.
- The repo's Pages source must be switched from "Deploy from a branch" to "GitHub Actions". Do this only at release (task T7.3), because it takes effect immediately.
- Until release, `main` still serves v1 unchanged.
- Rollback: revert the merge on `main` and set the Pages source back to "Deploy from a branch" (`main`, root). v1 is also at tag `v1.0`.

## 10. Testing

- `npm test` runs Vitest. Domain logic must have tests before UI is built on it.
- Fixtures live in `src/domain/__fixtures__/` and use dummy data only.
- Manual checks (offline, install, update on phone) are listed in `TASKS.md` Phase 7.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Data loss during migration | Pre-migration raw backup, idempotent migration, fixture tests, error screen instead of overwrite |
| Installed app does not update | Keep `sw.js`, manifest name, `scope`, `start_url`; update prompt; test on the phone before and after release |
| Pages path mismatch breaks assets | `base` in `vite.config.ts` matches the live URL path; verify in T0.3 |
| Calculation drift from v1 | Fixture tests that assert v1 results |
| Date bugs near midnight or month ends | Local-date helper, clamping rules, tests for 29/30/31 and leap years |
