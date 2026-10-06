# Salary Planner: Product Requirements Document

Status: living document. Last checked against the repo on 2026-10-06.

## 1. Overview

Salary Planner is a personal budgeting web app, installed as a PWA on the owner's phone and hosted on GitHub Pages. It shows how a monthly salary is allocated across recurring expenses, upcoming one-off costs, and debt repayments, and (planned) tracks day-to-day spending.

- Owner and sole user: Franklyn (Nairobi, Kenya)
- Platform: mobile-first PWA, also usable in a desktop browser
- Currency: KES, displayed as `KSh`

## 2. Problem

Salary arrives once a month and gets spent in pieces. Franklyn wants one place to see what is committed, what is coming, what is owed, and what is actually left to spend, without a spreadsheet.

## 3. Goals

1. Show clearly how much salary is left after commitments.
2. Make debts and upcoming costs visible so nothing surprises him.
3. Log daily spending in a few taps (planned).
4. Work offline and feel like a native app on his phone.
5. Look clean and minimal (planned redesign).

## 4. Non-goals

- No bank or M-PESA integration.
- No multi-user, sharing, or accounts.
- No backend or server. Data stays on the device.
- No financial advice or investment features.

## 5. Current features (v1, considered complete)

| Area | Behaviour |
|---|---|
| Income | Enter monthly salary/income. |
| Recurring expenses | Add, edit, delete fixed monthly expenses. |
| Upcoming one-off costs | Add, edit, delete costs expected in the future. |
| Debts | Add, edit, delete debts to repay. Each debt has name, amount, and a free-text due/notes field. |
| Summary | Income vs. commitments, with what remains. |
| PWA | Installable, works offline (manifest + service worker + icons). |
| Hosting | GitHub Pages. |

Current calculations subtract all recurring expenses, all upcoming one-off costs, and all listed debts from monthly income. Due/notes text is informational only; it does not change calculations.

## 6. Planned feature A: Daily spend tab

### User stories
- As a user, I log a purchase (amount, category, optional note) in under 10 seconds.
- As a user, I see today's spending and this month's total.
- As a user, I see how daily spending compares to what remains after commitments.
- As a user, I edit or delete a mistaken entry.

### Requirements
- New tab in the main navigation.
- Entry fields: amount (required), category (required, from a short editable list), date (defaults to today), note (optional).
- List grouped by day, newest first.
- Month total and remaining-to-spend figure, tied to the existing summary calculation.
- Persists locally, same storage mechanism as the rest of the app.
- Works fully offline.

### Open questions
- Should unspent daily budget roll over? Default: show it, do not enforce it.
- Fixed category list, or user-defined? Default: small default list, user can add.

## 7. Planned feature B: UI/UX redesign

Scope: logo, color scheme, layout, and general UI/UX polish. **No change to calculations or data.**

### Direction
- Clean, minimal, lots of whitespace (matches the owner's long-standing taste).
- Mobile-first, thumb-reachable actions.
- Clear hierarchy: the "what's left" number is the hero of the home screen.
- Consistent spacing, type scale, and component styling via design tokens.
- Accessible contrast (WCAG AA) and tap targets of at least 44px.
- New logo and updated PWA icons, theme color, and splash/manifest values.

### Decisions still needed from the owner
- Color direction (neutral with one accent? dark mode?).
- Logo concept.
- Navigation pattern (bottom tab bar is the default assumption).

## 8. Success criteria

- Logging a daily purchase takes under 10 seconds.
- Home screen answers "how much can I still spend?" at a glance.
- App still installs, loads offline, and passes a Lighthouse PWA check after changes.
- Existing user data survives every update (no data loss on release).

## 9. Constraints

- Static hosting only (GitHub Pages). No server code.
- Existing installed PWA must keep working after updates, so service worker versioning matters.
- Keep dependencies minimal.
