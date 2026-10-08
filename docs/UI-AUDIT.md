# Salary Planner UI audit

## Hierarchy

- The Overview page presents several equal-weight summary rows, while “Remaining” and “Remaining to spend” compete for the primary financial focus.
- The Daily Spend tab contains the main entry form, category management, totals, and the full entry history in one long flow; these areas need clearer grouping and prioritization.
- The top tab navigation is functional but does not yet provide a strong mobile app-style navigation pattern.

## Layout and spacing

- The Overview is a single vertical scroll with repeated bordered rows and sections, which makes the page feel dense as data grows.
- Legacy expense rows use fixed widths for amount and due fields (`110px` and `120px`); on narrow screens, long names and multiple fields can become cramped or overflow.
- Daily Spend fields use a more structured grid than the legacy lists, so the two parts of the app do not yet feel like one coherent interface.
- Spacing, radii, and typography are repeated as hardcoded values rather than shared design tokens.

## Contrast and visual system

- The dark theme has a restrained palette, but muted text and borders should be checked against WCAG AA contrast targets in both dark and light modes.
- The accent, positive, and negative colors are used for status but do not yet have a documented semantic color system.
- Manifest colors, document theme color, and the in-app palette are aligned today, but the visual identity is not yet expressed through a reusable component system.

## Interaction and accessibility

- Several controls are below the intended 44px mobile tap target, including remove/delete links and footer actions.
- The tab buttons expose basic tab roles and selection state, but keyboard focus styling and full tab-panel relationships need review.
- Inline inputs have labels in the Daily Spend list, while legacy expense inputs rely mainly on placeholders and should gain clearer accessible labels.
- Destructive actions use browser confirmation dialogs; the visual treatment and focus behavior should be made consistent during redesign.

## PWA and mobile experience

- The app is mobile-first in width and uses safe-area padding, but the current layout is still closer to a desktop form compressed onto mobile than a thumb-oriented app.
- The installed-app identity is minimal: the existing icons and manifest work, but the redesign has not yet established the logo, splash/background treatment, or final theme direction.

## Agreed redesign direction

- Palette: deep slate foundation with a muted-gold accent and explicit semantic positive/negative colors.
- Typography: modern sans-serif while remaining dependency-free.
- Logo: simple wallet/ledger symbol.
- Navigation: mobile-first bottom tab bar for Overview and Daily Spend.
