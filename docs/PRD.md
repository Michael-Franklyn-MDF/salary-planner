# Salary Planner v2: Product Requirements

Status: living document. v1 is shipped and frozen at tag `v1.0`.

## 1. Overview

v2 rebuilds the Salary Planner PWA in React + TypeScript with four tabs (Home, Spend, Calendar, Plan), an always-visible "left to spend" mini-player, and an Apple-style design.

- Owner and only user: Franklyn (Nairobi, Kenya)
- Currency: KES, displayed as `KSh`
- Platform: mobile-first PWA on GitHub Pages, also usable in a desktop browser
- Lives in the same repo on branch `v2`, served from the same URL, so the installed phone app and its saved data carry over

## 2. Goals

1. "How much can I still spend?" is answered at a glance on every tab.
2. Logging a purchase takes under 10 seconds, using a keypad.
3. Bills, debts, and one-off costs are visible on a calendar.
4. Existing v1 data survives migration untouched.
5. Installable, works offline, feels native.

## 3. Non-goals

- No backend, accounts, sharing, or analytics.
- No bank or M-PESA integration.
- No financial advice or investment features.
- No network calls except loading the app's own files.

## 4. Behaviour to preserve from v1

Do not change these results. They are covered by tests (see `TASKS.md`).

- `remaining = income - (recurring + one-offs + debts)`
- `remainingToSpend = remaining - this month's daily spend`
- Daily spend entries: amount, category, date, optional note. Add, edit, delete.
- Categories: add, rename, delete. Deleting moves its entries to "Other".
- JSON export and import as a backup.
- Data stays in `localStorage` under the key `salary-planner-v1`.

## 5. Navigation

Bottom tab bar with four tabs: **Home, Spend, Calendar, Plan**.

### Mini-player

A slim bar docked above the tab bar showing **Left to spend** and the amount (green when 0 or more, red when negative).

- Visible on Spend, Calendar, and Plan.
- Hidden on Home, where the same number is the hero.
- Tapping it opens Home.

## 6. Home

- Hero: **Left to spend** (`remainingToSpend`), large, with a caption "after commitments and this month's spending".
- Secondary line: **After commitments** (`remaining`).
- Summary cards: Income, Recurring, Upcoming, Debts, Spent this month.
- **Coming up**: the next three due items in the next 14 days (from the calendar logic), each with date and amount. Tapping one opens that day in Calendar.

## 7. Spend

- Today total and month total at the top.
- Entry area: large amount display, keypad (1-9, `.`, 0, backspace), category chips, date (defaults to today, tap to change), optional note, **Add** button.
- Entries listed below, grouped by day, newest first. Tap an entry to edit or delete in a bottom sheet.
- Manage categories from a "Categories" row (add, rename, delete with entries moved to "Other").
- Amount must be greater than 0. The keypad blocks more than 2 decimal places.

## 8. Calendar

- Week strip at the top (week starts Monday). Swipe or use arrows to change week. A toggle expands it to a full month grid.
- Selecting a day shows two groups: **Due** (recurring expenses, debts, one-offs on that day) and **Spent** (that day's entries and total).
- Day markers: accent dot = something is due, grey dot = spending logged.
- Due-date rules:
  - Recurring expenses and debts repeat monthly on `dayOfMonth` (1 to 31, or `last`).
  - If the month is shorter than `dayOfMonth`, the item falls on the month's last day (31 in February becomes 28 or 29).
  - One-off costs appear only on their `date`.
  - Debts stop appearing after their optional `endDate`.
  - Items with no date do not appear on the calendar. Plan shows a "No date" tag on them.

## 9. Plan

Grouped lists, iOS inset style:

- **Income** (monthly take-home)
- **Recurring expenses**
- **Upcoming one-off costs**
- **Debts**
- **Data**: export backup, import backup, clear all data

Tap a row to edit in a bottom sheet (name, amount, day or date, note). Each group has an add row. Deleting asks for confirmation using an in-app dialog, not the browser `confirm()`.

## 10. Data migration

- v1 and v2 data are migrated to schema v3 on first load. Nothing is dropped.
- A raw copy of the old data is saved before the first migration (see `ARCHITECTURE.md`).
- The free-text `due` field is converted where obvious (see `ARCHITECTURE.md`), otherwise kept as a note. The owner can then assign real dates in Plan.

## 11. Design

Apple design language: see `UI_UX_SPEC.md`. Light and dark themes follow the system setting.

## 12. Open questions (defaults apply until answered)

1. Should a one-off cost dated in a future month count against this month? **Default: yes, same as v1.** Revisit after Calendar ships.
2. Logo: keep the wallet/ledger shape, recolored for the new palette? **Default: yes.**
3. Should unspent daily budget roll over? **Default: no, not tracked.**

## 13. Success criteria

- Logging a purchase takes under 10 seconds.
- Left to spend is visible on all four tabs.
- v1 backup file imports into v2 with every item present.
- App installs, loads offline, and passes Lighthouse PWA checks.
- The installed phone app updates to v2 with data intact.

## 14. Constraints

- Static hosting only (GitHub Pages).
- Keep dependencies small. Ask before adding any beyond those in `ARCHITECTURE.md`.
- The installed PWA must keep working through the update, so `start_url`, `scope`, and the service worker filename do not change.
