# Salary Planner v2: UI/UX Spec

Direction: Apple design language. Calm, spacious, large type, grouped lists, translucent bars, bottom sheets. Follows the system light/dark setting.

## 1. Principles

1. The "left to spend" number is the hero, and it is always visible (hero on Home, mini-player elsewhere).
2. One primary action per screen.
3. Large type and generous whitespace. Few colours. Colour only carries meaning (accent, good, bad).
4. Thumb-first: key actions sit in the lower half of the screen.
5. Every tap target is at least 44px.

## 2. Design tokens

Define as CSS variables in `src/styles/index.css`, map into Tailwind, and theme shadcn from them. Components use tokens only.

### Colour

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F2F2F7` | `#000000` |
| `--surface` | `#FFFFFF` | `#1C1C1E` |
| `--surface-2` | `#F2F2F7` | `#2C2C2E` |
| `--text` | `#000000` | `#FFFFFF` |
| `--text-muted` | `rgba(60,60,67,0.60)` | `rgba(235,235,245,0.60)` |
| `--separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.65)` |
| `--accent` | `#0071E3` | `#0A84FF` |
| `--good` | `#248A3D` | `#30D158` |
| `--bad` | `#D70015` | `#FF453A` |
| `--bar-bg` (tab bar, mini-player) | `rgba(249,249,249,0.94)` | `rgba(30,30,30,0.94)` |

Light-mode `good`, `bad`, and `accent` are darker than Apple's brightest system colours so text passes WCAG AA on white. Verify contrast in T6.4.

### Type

System font stack only, no web fonts:
`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, "Segoe UI", Roboto, sans-serif`

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

All money uses `font-variant-numeric: tabular-nums`.

### Space, radius, motion

- Spacing on a 4px grid: 4, 8, 12, 16, 20, 24, 32.
- Radius: 12 cards and grouped lists, 16 sheets (top corners), 999 pills and chips.
- Motion: 200 to 300ms ease-out. Sheets slide up. Remove all motion when `prefers-reduced-motion` is set.
- Layout: max content width 480px, centred on larger screens. Respect `env(safe-area-inset-*)`.

## 3. Components

| Component | Notes |
|---|---|
| **TabBar** | 4 tabs (Home, Spend, Calendar, Plan), icon above label, lucide icons. 49px high plus safe area. Translucent with backdrop blur. Active tab uses `--accent`. |
| **MiniPlayer** | 52px bar docked above the TabBar. Left: "Left to spend" in `footnote` muted. Right: amount in `headline`, `--good` or `--bad`. Chevron hint. Hidden on Home. Tap opens Home. |
| **LargeTitle** | Screen title at the top, `large-title`, left-aligned. |
| **GroupedList / Row** | Rounded surface card, rows separated by a hairline `--separator`. Row: label left, value right, optional chevron. Min height 44px. |
| **Sheet** | Bottom drawer (shadcn Drawer) with grab handle, title, Cancel (left) and Save (right). Used for add and edit. |
| **ConfirmDialog** | shadcn AlertDialog. Destructive action in `--bad`. Replaces browser `confirm()`. |
| **Keypad** | 3 x 4 grid: 1-9, `.`, 0, backspace. No key backgrounds. 32px numerals, 64px tall keys, light haptic-style press feedback (opacity). |
| **AmountDisplay** | Centred, `hero` size, shows `KSh` prefix muted. Shrinks to fit long numbers. |
| **CategoryChips** | Horizontal scroll of pills. Selected chip is filled `--accent` with white text. |
| **WeekStrip** | 7 day cells (Mon to Sun) with weekday letter and date. Selected day is a filled `--accent` circle. Today has an accent ring. Dots below for markers. |
| **MonthGrid** | 7-column grid, same markers, expands from the week strip. |
| **Toast** | Sonner, used for the "Update available" prompt and short confirmations. |
| **EmptyState** | Icon, one-line title, one-line help, one action. |

## 4. Screens

### Home

1. LargeTitle "Home".
2. Hero card: caption "Left to spend", `hero` amount (good or bad colour), footnote "after commitments and this month's spending".
3. Row: "After commitments" with amount.
4. Grouped list of summary rows: Income, Recurring, Upcoming, Debts, Spent this month.
5. "Coming up" grouped list: next three due items, each with date, name, amount. Chevron opens that day in Calendar.
6. Negative state: hero turns `--bad`; caption becomes "over by this month".

### Spend

1. Today and Month totals as two side-by-side cards.
2. AmountDisplay, CategoryChips, a row for Date (default "Today") and Note, then Keypad.
3. Primary button **Add** (full width, `--accent`), disabled at 0.
4. "Recent" grouped list by day: day header with day total, rows with category, note, amount. Tap row opens edit Sheet.
5. "Categories" row opens a Sheet to add, rename, delete.
6. Empty state: "No spending logged yet" with a hint to use the keypad.

### Calendar

1. LargeTitle with the month and year. Chevrons to change week. Toggle (week/month) at the right.
2. WeekStrip, expandable to MonthGrid.
3. Selected day heading, then two grouped lists: **Due** (name, amount) and **Spent** (day total plus entries).
4. Markers: accent dot = due, grey dot = spending.
5. Empty states: "Nothing due" and "No spending this day". If no item has a date, show a card linking to Plan.

### Plan

1. LargeTitle "Plan".
2. Grouped lists: Income, Recurring expenses, Upcoming costs, Debts. Each row shows name, amount, and day or date. Items with no date show a small "No date" tag. Each group ends with an "Add ..." row in `--accent`.
3. Edit Sheet fields: name, amount (numeric), day of month (recurring and debts, with a "Last day" option) or date (one-offs), end date (debts, optional), note.
4. "Data" group at the bottom: Export backup, Import backup, Clear all data (destructive, confirm).

## 5. Copy

Short and plain. Sentence case. No exclamation marks. Examples: "Left to spend", "After commitments", "Nothing due", "Add spending".

## 6. Accessibility

- WCAG AA contrast in both themes.
- Visible focus ring using `--accent`.
- Tabs use the correct roles and arrow-key navigation on desktop.
- Every input has a label. Icons-only buttons have an accessible name.
- Amounts are announced with the currency, for example "Left to spend, 35,000 shillings".
- Colour is never the only signal: negative amounts also show a minus sign.

## 7. Icons and logo

- UI icons: lucide-react.
- Keep the v1 wallet/ledger shape for the logo, recoloured with the new palette (open question in `PRD.md`). Provide `any` and `maskable` PNG icons at 192 and 512.
- `theme_color` and `background_color` in the manifest follow the tokens above.
