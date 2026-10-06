# GEMINI.md

Context and rules for Gemini CLI (and any AI coding agent) working on Salary Planner.

## What this project is

A personal budgeting PWA (income, recurring expenses, upcoming costs, debts, and soon daily spend). Hosted on GitHub Pages, installed on the owner's phone. Single user, no backend.

Read these before changing anything:
- `docs/PRD.md`: what to build and why
- `docs/ARCHITECTURE.md`: how it is built
- `docs/TASKS.md`: the backlog and current task

## First step in any new session

The docs were written without access to the code. Before your first change:
1. Inspect the repo (file tree, entry HTML, scripts, service worker, manifest).
2. Fix every **[CONFIRM]** item in `docs/PRD.md` and `docs/ARCHITECTURE.md` so they match reality.
3. Fill in the commands section below.
4. Tell the owner what you corrected.

## Commands

Fill in after inspecting the repo.

```
Install:  [CONFIRM]
Run dev:  [CONFIRM]   # or open index.html / any static server
Build:    [CONFIRM]   # if there is no build step, say so
Test:     [CONFIRM]
Deploy:   push to the main branch, served by GitHub Pages [CONFIRM branch]
```

## Rules

### Scope and safety
- Work on one task from `docs/TASKS.md` at a time. State the task before starting.
- Do not change calculation logic during the UI redesign. Visual changes only unless the task says otherwise.
- Never delete or reset user data. Any change to the stored data shape needs a migration that preserves existing data.
- Do not add a backend, accounts, analytics, or network calls.
- Do not add dependencies without asking. Prefer none.
- Never commit secrets or personal financial figures. Use dummy data in examples and tests.

### PWA rules
- Any change to cached files means bumping the service worker cache version.
- After changes, verify: installs, loads offline, and old data still shows.
- Keep `manifest` values (name, theme_color, icons) in sync with the design.

### Code style
- Match the existing style and structure. Do not reformat unrelated code.
- Small, focused commits with clear messages (`feat:`, `fix:`, `style:`, `docs:`).
- Mobile-first CSS. Use CSS variables for colors, spacing, and type (design tokens).
- Plain, readable code over clever code. Comment the why, not the what.

### Design principles (for redesign work)
- Clean and minimal. Generous whitespace. Few colors.
- The "what's left" number is the hero of the home screen.
- Tap targets of at least 44px. Contrast at WCAG AA or better.
- No decorative clutter. Every element earns its place.

## How to work with the owner

- Franklyn prefers step-by-step, hands-on guidance and decisions made before building. If a task has an open design choice (colors, logo, nav pattern), ask first and offer 2 to 3 concrete options.
- Keep explanations plain and concise.
- After each task, summarize: what changed, which files, how to test it, and what is next.

## Definition of done

- Works on a mobile viewport and in a desktop browser.
- Works offline.
- Existing data still loads.
- No console errors.
- `docs/TASKS.md` updated, and docs updated if behaviour changed.
