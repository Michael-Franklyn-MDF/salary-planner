# TESTING.md: Salary Planner v2.1

## Automated (run before every commit)

```
npm test
npm run lint
npm run typecheck
npm run build
```

New tests required in v2.1:
- Persistence: empty storage gives the empty state; stored v3 data loads; stored v1 data migrates and the raw backup key is written first; a corrupt value shows the error screen and leaves storage untouched; adding an item, unmounting and remounting shows the item; a failed save shows a message.
- `lib/format.ts`: money (`KSh 1,234.5`, negatives, zero) and dates (one human format, local dates, month ends).
- Theme: `data-theme` is applied; "system" follows `prefers-color-scheme`; the choice is stored under its own key and never inside the app data.
- Greeting: shows the first language, swaps once, never again in the same session; instant with reduced motion.
- Cold launch flag: plays once per fresh session only.
- Spend: draft amount survives a tab switch; Add is disabled at 0.
- Existing domain tests (`calc`, `calendar`, `dates`, `migrate`) must stay green and unchanged unless a data change is approved.

Use dummy data only. Never commit real figures or backups.

## Manual checks on the phone (installed app)

Do these after Phase A0, and again before release.

1. **Persistence:** add a spend, fully close the app (swipe it away), reopen. The spend is still there.
2. **Existing data:** after upgrading from v2, income, plan items and spending are all still there and totals match.
3. **Update path:** open the old installed version, accept "A new version is ready", and confirm it loads with no blank screen.
4. **Offline:** turn on airplane mode, close and reopen. App loads, data shows, Inter font still renders.
5. **Light and dark:** switch the phone theme. Both look right, the status bar colour matches, no white flash on launch.
6. **Cold launch:** closing and reopening plays the greeting and ring once. Switching tabs does not replay it.
7. **Reduced motion:** with the phone setting on, nothing animates.
8. **Spend at a small screen:** amount, category chips, all 12 keys and Add are visible without scrolling on a 360 x 640 viewport. Typing the amount keeps it in view.
9. **Backup round trip:** export, clear all data, import the file. Everything returns.
10. **Clear all data:** the confirmation appears, Cancel does nothing, confirm resets.
11. **Calendar:** dots on days with items, today ring, selected day, week and month views, tapping a Coming up item on Home opens that day.
12. **Touch targets:** every control is easy to hit with a thumb, including Calendar's Month and arrows.

## Manual checks on the laptop

- Chrome, Incognito, first load of the live URL: no console errors.
- Application tab: manifest has no errors; service worker registered.
- Resize to a narrow and a wide window: layout holds, tab bar stays within the content width.

## Release gate

Do not tag a release until: all automated checks pass, items 1 to 5 above pass on the phone, and `docs/TASKS.md` is updated.
