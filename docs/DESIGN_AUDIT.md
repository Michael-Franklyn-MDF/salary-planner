# DESIGN_AUDIT.md: Salary Planner v2.1

Sources: laptop screenshots (dark mode, empty), phone screenshots (light mode, empty and populated) of Home, Spend, Calendar and Plan, and a read of the repository code (`main`, the same commit as `v2.1`).
Not yet reviewed: Calendar month view, dark mode on phone, the add and edit forms, Manage categories, first launch.

## Direction decision

- **Savanna** is the light theme and **Midnight** is the dark theme. Style: Apple design language, clean and minimal, one accent colour plus neutrals.
- Theme switching: a settings button at the top right (later phase) offers Light, Dark or Follow device. Until then the app follows the device setting.
- Tokens (confirm in UI_UX_SPEC.md):

| Token | Savanna (light) | Midnight (dark) |
|---|---|---|
| Background | #e9f0ea | #0b0d12 |
| Surface | #ffffff | #161a22 |
| Text | #14281d | #f2f4f8 |
| Muted text | #5d7266 | #8b93a3 |
| Accent | #1f6b4a | a lighter tint of the Savanna green (about #4fbf8b, to be tuned for contrast) |
| Danger | one red, only for overdue, over budget and destructive actions | same |

## Severity key

- **High**: blocks a core task or misleads the user.
- **Medium**: hurts clarity or feel, but the task still works.
- **Low**: polish.

## What already works (keep)

- Four-tab structure and the docked "Left to spend" bar on Spend, Calendar and Plan.
- The keypad-first Spend flow and the week strip in Calendar.
- Home reads as a waterfall: income minus recurring, upcoming and debts gives "after commitments", and minus spending gives "left to spend".
- Calendar's empty state ("No dated items yet", an explanation, then "Open Plan") is the best empty state in the app. Use it as the pattern for the others.

## Findings

### Global

| ID | Issue | Severity | Direction |
|---|---|---|---|
| G-01 | Blue is the accent for tabs, chips, links and buttons, while money figures are green and danger is red. Three colours, no identity. | High | One accent from the chosen palette replaces the blue everywhere. |
| G-02 | Every screen is a stack of identical rounded white cards. Nothing is bigger or closer than anything else, so the app feels flat. | High | One hero per screen, quieter secondary content, spacing doing the grouping. |
| G-03 | Section labels (SUMMARY, COMING UP, INCOME and others) are small, all caps and low contrast. | Low | Sentence case, slightly larger, with passing contrast in both themes. |
| G-04 | On a laptop the content column is narrow and centred and the tab bar spans the full window. Phone is the main use, so this is secondary. | Low | Constrain the tab bar to the content width on wide screens. |
| G-05 | No personality or time context. Screens just say "Home", "Spend" and so on. | Medium | Bilingual greeting on Home. Show the month as context on Home and Spend. |
| G-06 | On Android the status bar is bright blue. Cause: `theme_color: '#0071E3'` in `vite.config.ts` and `<meta name="theme-color">` in `index.html`. It clashes with Savanna and with dark mode. | Medium | Set both to the Savanna background, and switch the meta tag with the theme. Keep `scope` and `start_url` unchanged. |
| G-07 | Dates appear three ways: 2026-10-20 in lists, 18/10/2026 in the date field, and "Tuesday, 20 October" elsewhere. | Medium | One consistent human format everywhere (for example "Tue 20 Oct"). |
| G-08 | The font is a system stack (`--font-system`), so the phone renders Roboto and an iPhone renders San Francisco. `@fontsource-variable/geist` is installed but never used. | Medium | Decided: Inter, self-hosted through `@fontsource-variable/inter` so it works offline. Remove the Geist package. |
| G-09 | The last items on long screens sit under the docked bar and tab bar until you scroll. | Low | Add bottom padding equal to the bars' height. |

### Home

| ID | Issue | Severity | Direction |
|---|---|---|---|
| H-01 | "Left to spend" is green even at zero, which signals "healthy" when nothing is set up. | High | Colour follows state: neutral when empty, accent when positive, red only when negative. |
| H-02 | The hero and the "After commitments" row use near-identical wording for two different numbers (before and after this month's spending). The waterfall is correct but never shown. | High | Show the calculation as a simple breakdown, or give the two numbers clearly different names. |
| H-03 | Five summary tiles with equal weight. | Medium | A progress ring plus two or three supporting figures. Move the rest to Plan. |
| H-04 | When empty, Home shows five zeros and "Nothing due in the next 14 days" with no guidance. | High | First-run state in the style of Calendar's empty state, with a button to Plan to set take-home. |
| H-05 | No primary action on Home. | Medium | Add "Add spend" under the hero number. |
| H-06 | The hero caption ("after commitments and this month's spending") is long and small. | Low | Shorten, for example "left after bills and spending". |

### Spend

| ID | Issue | Severity | Direction |
|---|---|---|---|
| S-01 | On phone the keypad is split by the scroll: 1 to 9 show, while 0, the decimal point, backspace and Add are below. After scrolling, the amount you are typing is off screen. | High | Fit amount, keypad and Add in one view, or pin Add and the amount. Note: Add is correctly disabled until an amount is entered. |
| S-02 | "KSh" is smaller and sits lower than the zero, so the amount looks off-centre. | Medium | Align on the baseline and treat the amount as one unit. |
| S-03 | Category chips scroll sideways with the last one cut off, and a grey scrollbar shows under the chips. The selected chip is blue. | Medium | Hide the scrollbar, add an edge fade, accent colour for the selected chip. |
| S-04 | "Manage categories" floats alone with large gaps around it. | Low | Move it to the end of the chip row. |
| S-05 | Today and This month are two big plain tiles. | Low | One compact summary line. |
| S-06 | Keypad keys have no visible shape or pressed state. | Medium | Subtle key surfaces and a short pressed animation. |
| S-07 | Docked bar is green at zero and its chevron does not say where it goes. | Low | Colour by state. Tapping it goes Home. |
| S-08 | In Recent, a day with one entry shows the amount twice (day header and the row), and header totals are light grey. (Edit and delete already exist in a bottom sheet.) | Medium | Show the day total only when a day has several entries. |

### Calendar

| ID | Issue | Severity | Direction |
|---|---|---|---|
| C-01 | Month, previous and next are small blue text with small touch targets. | Medium | Larger targets, clearer control styling. |
| C-02 | Only the selected day shows a dot. Unclear whether other days with items show one. Today and selected day are not distinguished. | Medium | Dots on every day with items, a subtle mark for today, accent fill for selected. |
| C-03 | Due items (for example a debt payment) have no status and no way to mark them paid. | Medium | Add a mark-as-paid action with a short confirming motion. |
| C-04 | Large empty area below the lists. | Low | Fine for now. Consider a month total or a next-due line. |

### Plan

| ID | Issue | Severity | Direction |
|---|---|---|---|
| P-01 | Section rows give no total or count, and rows show no sign they can be tapped to edit. | Medium | Section totals, chevrons or edit affordances. |
| P-02 | A recurring expense shows "No date", but Calendar needs one. | Medium | Replace with an "Add day" prompt so it is clearly unfinished. |
| P-03 | "Clear all data" (red) sits directly under "Import backup" in the same list. A confirmation dialog already exists ("This cannot be undone. Export a backup first…"), so this is about placement only. | Medium | Move it into its own separated group at the bottom. Keep the existing confirmation. |
| P-04 | Export and Import backup are plain blue links. | Low | Add helper text such as the date of the last backup. |

## Behavior items

| ID | Item | Severity |
|---|---|---|
| B-01 | Cold-launch animation: ring draws in under a second, number counts up, docked total and tab bar slide up. Plays only after the app is fully closed and reopened, never on tab switches. Instant when reduced motion is on. | Medium |
| B-02 | Greeting on Home: "Hello, Michael" swaps once to "Hola, Michael" and stays. Languages live in one list so more can be added later. | Medium |
| B-03 | Logging a spend and marking something paid each get one short confirming motion. | Low |
| B-04 | Verify the update path from v2 to v2.1 on the phone. The update prompt already exists (`registerType: 'prompt'`). Test: installed app shows "A new version is ready", accepts it, and loads without a blank screen. | Medium |
| B-05 | Settings button at the top right with Light, Dark and Follow device (later phase). | Low |

## Code-level findings (from the repository)

| ID | Issue | Severity | Direction |
|---|---|---|---|
| X-01 | **Saved data is never loaded or saved.** `loadState` and `saveState` exist in `src/storage/storage.ts` and are tested, but nothing in the app calls them. `AppStateProvider` starts from an empty state (`migrateState(null)`) and the reducer never writes to storage. As the code stands, closing and reopening the app would reset it. Nothing in `docs/TASKS.md` covers wiring it up, and the phone check (T7.5) is still unticked. | **Critical** | First task of v2.1. Load on start (running the pre-migration raw backup and migration), save on every state change, show the error screen instead of overwriting if loading fails. Add a test that adds data, remounts the app, and finds the data. |
| X-02 | `formatAmount` is copied into five files (Home, Spend, Plan, Calendar, MiniPlayer). Dates have no shared formatter, which is why formats differ (G-07). | Medium | One `src/lib/format.ts` for money and dates. |
| X-03 | Components use arbitrary values everywhere (`text-[color:var(--text-muted)]`, `text-[34px]`, `bg-[color:var(--surface)]`) even though type tokens exist in `index.css`. Re-theming means touching every file. | High | Register colours and type sizes in Tailwind's `@theme` so classes read `bg-surface text-muted text-title`, then change themes in one file. |
| X-04 | Sheets and dialogs (editors, confirms, category manager) are hand-built `fixed inset-0` blocks repeated inside `SpendTab` (347 lines) and `PlanTab` (314 lines). | Medium | Shared `Sheet` and `ConfirmDialog` components, plus a shared grouped-list row. |
| X-05 | Tabs unmount when you switch, so a half-typed spend is lost. | Medium | Keep the Spend draft in state above the tab, or keep tabs mounted. |
| X-06 | Clutter: a stray `@/` folder at the repo root (shadcn init created `components/ui/button.tsx` and `lib/utils.ts` outside `src`), `cn` imported from the unrelated npm package `cn` instead of `clsx` plus `tailwind-merge`, unused Vite template files (`src/App.css`, `src/assets/*`), committed `.DS_Store` files, and the `shadcn` CLI listed as a runtime dependency. | Low | Clean up in one commit, after checking nothing imports them. |
| X-07 | Docs have drifted: `docs/TASKS.md` still shows the Pages release as in progress, and `copilot-instructions.md` says to work on the `v2` branch. | Low | Update both for v2.1. |

## Still needed

1. Calendar month view.
2. Dark mode on the phone.
3. The add and edit forms (expense, one-off cost, debt) and Manage categories.
4. A quick manual check of X-01 on the phone: add one spend, fully close the app, reopen it, and see whether it is still there.
