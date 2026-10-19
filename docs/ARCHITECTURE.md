# Salary Planner: Architecture (v2.1)

Status: v2 is released. Sections 1 to 11 describe the v2 design and still apply unless section 12 says otherwise. Section 12 is the v2.1 plan and is based on a read of the code. Update this file whenever the structure changes.

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

- Load: read `salary-planner-v1`, parse, run `migrateState(raw)`, validate, then use. Save on every state change. **Note:** as of v2 these calls are built and tested but not yet wired into the app. See 12.3.
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
- Releases deploy from `main`; before the v2 release, `main` served v1 unchanged.
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


## 12. v2.1 plan

### 12.1 Where the code stands

| Item | Planned in v2 | Actual |
|---|---|---|
| Storage load and save | Load on start, save on every change | `loadState` and `saveState` exist and are tested, but nothing calls them. The provider starts empty. **Release blocker.** |
| Selectors | `state/selectors.ts` | Missing. `calculateSummary` is called separately in `App` and `HomeTab`. |
| Shared UI | shadcn `Drawer`, `AlertDialog`, `GroupedList` | Hand-built `fixed inset-0` sheets and dialogs repeated in `SpendTab` and `PlanTab`. shadcn setup left a stray `@/` folder at the repo root. |
| Money and date formatting | One `fmt()` | `formatAmount` copied into five files. No shared date formatter. |
| Tokens | CSS variables, "tokens only" | Variables exist, but components use arbitrary values (`text-[color:var(--muted)]`, `text-[34px]`), so re-theming touches every file. |
| Font | Not specified | System stack. `@fontsource-variable/geist` installed, unused. |
| Dark mode | Light and dark | Works through `prefers-color-scheme` and a `.dark` class. No way to choose. |

### 12.2 Target structure

```
src/
├─ main.tsx, App.tsx
├─ lib/                  format.ts (money, dates), cn.ts, greetings.ts
├─ domain/               unchanged (pure, tested)
├─ storage/              storage.ts, backup.ts, prefs.ts (theme choice, separate key)
├─ state/                AppStateProvider.tsx (loads and saves), reducer.ts, selectors.ts
├─ theme/                useTheme.ts, theme.css (Savanna and Midnight tokens)
├─ components/           Sheet.tsx, ConfirmDialog.tsx, ListGroup.tsx, Ring.tsx, TabBar.tsx, MiniPlayer.tsx
├─ features/             home/, spend/, calendar/, plan/, settings/ (later)
├─ pwa/                  register.ts, UpdatePrompt.tsx
└─ styles/               index.css (imports, @theme)
```

Rules that stay: `src/domain` is pure, no router, no state library, no new dependencies without asking. Allowed additions for v2.1: `@fontsource-variable/inter`. Removals: `@fontsource-variable/geist`, the unrelated `cn` package (use `clsx` plus `tailwind-merge`), and `shadcn` as a runtime dependency (move to dev if still needed).

### 12.3 Persistence wiring (task A0, first)

1. `AppStateProvider` takes its initial state from `loadState()` through a lazy initializer.
2. If `loadState` returns `ok: false`, render a `StorageErrorScreen` with a "Download raw data" button. Do not render the app and do not save anything.
3. A `useEffect` saves on every state change through `saveState`, skipping the very first run and skipping entirely when loading failed.
4. If `saveState` fails (for example storage is full), show a visible message. Never fail silently.
5. Keep the key `salary-planner-v1` and the pre-migration backup key. Load must run before any save, so v1 data on the phone is backed up and migrated, not overwritten.
6. Tests (write first): empty storage gives empty state; stored v3 data loads; stored v1 data migrates and the raw backup key is written; a corrupt value shows the error screen and leaves storage untouched; adding an item, unmounting and remounting shows the item; a failed save shows the message.
7. Manual check on the phone before anything else ships: add data, fully close the app, reopen, data is there.

### 12.4 Theming

- Move colours and type sizes into Tailwind's `@theme`, so components use names like `bg-surface`, `text-muted`, `text-title`, `text-hero`.
- Savanna is the light set and Midnight the dark set. Switch with a `data-theme` attribute on `<html>` (`light`, `dark`) and fall back to `prefers-color-scheme` when the choice is "system".
- The choice is stored under a separate key `salary-planner-prefs`, never inside the app data.
- A tiny inline script in `index.html` sets `data-theme` and the `theme-color` meta tag before React loads, to avoid a flash.
- Until the settings button exists (Phase D), the choice is always "system".
- Status colours: one accent, `danger` for overdue, over budget and destructive actions. `good` is replaced by the accent.

### 12.5 Typeface

Import `@fontsource-variable/inter` once in `main.tsx`, set `--font-sans` to Inter with the system stack as fallback, and check the woff2 file is in the service worker precache so it works offline.

### 12.6 Motion and greeting

- `useColdLaunch()` returns true once per fully closed and reopened app, using a `sessionStorage` flag.
- Launch sequence on Home: ring draws (under 900 ms) while the number counts up, then the docked bar and tab bar slide in.
- Greeting: list in `lib/greetings.ts` (English, Spanish). Shows the first, swaps once, stays. Never replays on tab switches.
- Everything is instant under `prefers-reduced-motion`, and no animation blocks a tap.

### 12.7 Order of work and checks

1. A0 persistence (12.3). Check on the phone.
2. A1 `format.ts`. Behavior unchanged.
3. A2 tokens in `@theme`. Screens look the same as before.
4. A3 shared `Sheet`, `ConfirmDialog`, `ListGroup`. Split `SpendTab` and `PlanTab`.
5. A4 keep unsaved Spend input across tab switches.
6. A5 cleanup (stray `@/` folder, template files, `.DS_Store`, dependency changes). First confirm nothing imports them.
7. Then Phases B and C from `V2.1_PRD.md`.

Each step is its own commit and must pass `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`. Steps 2 to 6 must not change what the app does.

### 12.8 Efficiency notes

- Compute the summary once in a selector with `useMemo` instead of in several components.
- Keep icon imports by name from `lucide-react` (already tree-shaken).
- Removing unused packages and template assets shrinks installs and the build.

### 12.9 Added risks

| Risk | Mitigation |
|---|---|
| Wiring save before load overwrites the v1 data still on the phone | Load first, raw backup key written before parsing, test for it |
| Saving on every change fails silently when storage is full | Visible error message, test for it |
| Theme flash on launch | Inline script sets the theme before React renders |
| Refactor changes behavior | One commit per step, existing tests must pass, manual phone check after A0 |
