# Salary Planner v2.1: UI/UX Spec

Direction: Apple design language, calm and minimal, with a Kenyan-green identity. Two themes: **Savanna** (light) and **Midnight** (dark). One accent colour. Follows the device setting now; a settings button (top right) lets the user choose later. Findings this spec answers are in `DESIGN_AUDIT.md` (IDs in brackets).

## 1. Principles

1. The "left to spend" number is the hero on Home and always visible elsewhere (mini player).
2. One hero and one primary action per screen. Everything else is quieter.
3. One accent colour plus neutrals. Colour carries meaning only. Danger red is for overdue, over budget and destructive actions (G-01).
4. Thumb-first: key actions sit in the lower half. The primary action is never hidden below the fold (S-01).
5. Every tap target is at least 44px.
6. Motion confirms, never decorates. One motion per action.

## 2. Design tokens

Defined as CSS variables in `src/theme/theme.css` and registered in Tailwind `@theme`, so components use names like `bg-surface`, `text-muted`, `text-title`, never arbitrary values (A2). Theme is applied with `data-theme` on `<html>`; "system" follows `prefers-color-scheme`.

### Colour

| Token | Savanna (light) | Midnight (dark) |
|---|---|---|
| `bg` | `#E9F0EA` | `#0B0D12` |
| `surface` | `#FFFFFF` | `#161A22` |
| `surface-2` | `#F3F7F4` | `#1E232D` |
| `text` | `#14281D` | `#F2F4F8` |
| `muted` | `#526659` | `#8B93A3` |
| `separator` | `rgba(20,40,29,0.14)` | `rgba(255,255,255,0.10)` |
| `accent` | `#1F6B4A` | `#4FBF8B` (tune against Midnight surfaces) |
| `accent-foreground` | `#FFFFFF` | `#06140D` |
| `accent-soft` | `rgba(31,107,74,0.12)` | `rgba(79,191,139,0.16)` |
| `danger` | `#B42318` | `#FF6B61` |
| `bar` (tab bar, mini player) | `rgba(255,255,255,0.88)` | `rgba(22,26,34,0.88)` |

- The old `good` and blue `accent` are removed. Money in the healthy state uses `accent`.
- Verify contrast (WCAG AA) for every text and background pair in both themes, including `muted` on `bg`.
- Status bar and browser UI colour: `theme-color` meta tags set per scheme (`#E9F0EA` light, `#0B0D12` dark), and manifest `theme_color` and `background_color` set to `#E9F0EA`. Keep `scope` and `start_url` unchanged (G-06).

### Type

Inter variable, self-hosted (`@fontsource-variable/inter`), system stack as fallback (G-08).

| Token | Size / line height | Weight |
|---|---|---|
| `hero` | 52 / 56 | 600, tabular numbers |
| `large-title` | 34 / 41 | 700 |
| `title` | 28 / 34 | 600 |
| `headline` | 17 / 22 | 600 |
| `body` | 17 / 22 | 400 |
| `subhead` | 15 / 20 | 400 |
| `footnote` | 13 / 18 | 400 |
| `caption` | 12 / 16 | 400 |

All money uses tabular numbers. Section labels are sentence case at `footnote`, weight 600, `muted` (G-03).

### Space, radius, motion

- 4px grid: 4, 8, 12, 16, 20, 24, 32.
- Radius: 16 cards and grouped lists, 20 sheets (top corners), 999 pills.
- Motion tokens: `fast` 150 ms, `base` 250 ms, `launch` 800 ms. Easing `cubic-bezier(0.2, 0.7, 0.2, 1)`. Nothing over 900 ms, nothing blocks a tap. Under `prefers-reduced-motion` everything is instant.
- Layout: max content width 480px, centred. The tab bar and mini player match the content width on wide screens (G-04). Respect `env(safe-area-inset-*)`. Add bottom padding to scroll areas equal to the bars' height (G-09).

### Dates and money format

- One format everywhere: short weekday and day, for example "Tue 20 Oct" in lists, "Tuesday 20 October" in headings. Never `2026-10-20` in the UI and never `dd/mm/yyyy` text in the date field label (G-07).
- Money: `KSh` prefix, thousands separators, up to 2 decimals, from `lib/format.ts`. Negative amounts show a minus sign.

## 3. Components

| Component | Notes |
|---|---|
| **TabBar** | 4 tabs, icon above label. Active tab uses `accent` with `accent-soft` behind the icon. Within content width on wide screens. |
| **MiniPlayer** | 52px bar above the tab bar. "Left to spend" left, amount right in `headline`, coloured by state. Hidden on Home. Tap opens Home. |
| **Greeting** | One line above the hero on Home. Reads its languages from `lib/greetings.ts` (English, Spanish). Shows the first, swaps once with a 250 ms cross-fade, then stays. Cold launch only. |
| **Ring** | 112px progress ring beside the hero amount. Track `separator`, fill `accent`, round caps, stroke 12. Fill = share of "after commitments" still unspent, clamped 0 to 1. Draws on cold launch. Empty and neutral when nothing is set up or when over. |
| **HeroAmount** | `hero` size, tabular. Colour by state: neutral `text` when empty, `accent` when positive, `danger` when negative. |
| **PrimaryButton** | Full width, `accent` fill, `accent-foreground` text, 52px tall, radius 16. Disabled state keeps text readable. |
| **ListGroup / Row** | Surface card, hairline `separator` between rows, min height 52px. Label left, value right, optional chevron to show a row can be opened (P-01). |
| **Sheet** | Bottom sheet with grab handle, title, Cancel left, Save right. Shared by all editors (A3). |
| **ConfirmDialog** | Shared. Destructive action in `danger`. |
| **Keypad** | 3 x 4 grid, key height 52px, subtle `surface` key shape, 150 ms pressed state (S-06). |
| **AmountDisplay** | `KSh` and the number on one baseline, centred, one unit (S-02). Shrinks to fit. |
| **CategoryChips** | Horizontal scroll, scrollbar hidden, edge fade, snap. Selected chip is `accent` fill (S-03). "Manage" is the last chip. |
| **WeekStrip / MonthGrid** | Controls at least 44px. Dot for every day with items (`accent` due, `muted` spend). Today ring, selected day `accent` fill (C-01, C-02). |
| **EmptyState** | Title, one line of help, one button. Model: Calendar's "No dated items yet". Used on Home, Spend, Plan (H-04). |
| **SettingsButton** | Top right, 44px, gear icon. Phase D. |

## 4. Screens

### Home
1. Greeting, then the month name.
2. Hero: label "Left to spend", HeroAmount, Ring, caption "after bills, debts and spending" (H-06).
3. PrimaryButton "Add spend" opens Spend (H-05).
4. Breakdown ListGroup titled "Where it goes" (H-02, H-03):
   - Income
   - Recurring (shown as a deduction)
   - Upcoming (deduction)
   - Debts (deduction)
   - **After commitments** (bold subtotal)
   - Spent this month (deduction)
   - **Left to spend** (bold result)
5. "Coming up": next three due items in 14 days with short dates. Tap opens that day in Calendar.
6. First-run state: neutral zero, EmptyState "Start with your income" with an Open Plan button, no breakdown (H-04).
7. Negative state: HeroAmount `danger`, label "Over by this month", Ring empty.

### Spend
1. Compact header: title and one summary line, "Today" and "This month" totals (S-05).
2. AmountDisplay, CategoryChips.
3. One compact row: date button and note field side by side.
4. Keypad (all 12 keys).
5. PrimaryButton "Add" pinned above the mini player, disabled at 0.
6. Acceptance: on a 360 x 640 viewport, amount, chips, keypad and Add are visible together with no scrolling, and the amount stays visible while typing (S-01).
7. "Recent" list below, scrolls: day header with the day total only when a day has more than one entry, otherwise a single row (S-08). Tap a row for the edit sheet.

### Calendar
1. Title with month and year, Month toggle and arrows, all at least 44px.
2. WeekStrip, expandable to MonthGrid, with markers and today ring.
3. Selected day heading, then **Due** and **Spent**.
4. Due rows have a "Mark paid" action (pending owner decision, `FLOW.md` section 7).
5. Empty states: "Nothing due", "No spending this day", and "No dated items yet" with Open Plan.

### Plan
1. Title.
2. Groups: Income, Recurring expenses, Upcoming costs, Debts. Each header shows count and total. Rows have chevrons. Rows without a day show an "Add day" prompt (P-02).
3. Edit sheet: name, amount, day of month (with "Last day") or date, optional end date for debts, note.
4. "Data" group: Export backup, Import backup, each with helper text. "Clear all data" is in its own separated group at the bottom and keeps its confirmation dialog (P-03, P-04).

### Settings (Phase D)
Sheet from the top-right button. Appearance: System, Light, Dark. Later: data tools and greeting languages.

## 5. Copy

Short, plain, sentence case, no exclamation marks. Examples: "Left to spend", "Where it goes", "Start with your income", "Add spend", "Nothing due".

## 6. Accessibility

- WCAG AA contrast in both themes.
- Visible focus ring in `accent`.
- Correct tab roles and arrow-key navigation on desktop.
- Every input has a label. Icon-only buttons have an accessible name.
- Amounts are announced with the currency.
- Colour is never the only signal: negative amounts show a minus sign, overdue shows text.
- The greeting is not announced repeatedly (announce once, in the current language).

## 7. Icons and logo

- UI icons: lucide-react.
- Recolour the logo and app icons (`any` and `maskable`, 192 and 512) to the Savanna palette.
- Add a `<link rel="icon">` to `index.html` pointing at `favicon.svg` to stop the `favicon.ico` 404.
