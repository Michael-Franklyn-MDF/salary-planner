# Salary Planner

Salary Planner is a private, single-user budgeting PWA. It runs entirely in the browser and stores data locally under `salary-planner-v1`.

The v2.1 refactor is developed on the `v2.1` branch. It keeps the existing v1 storage key and adds tested local persistence, shared UI primitives, semantic design tokens, and a preserved Spend draft when switching tabs.

## Development

```sh
npm install
npm run dev
```

Run the release checks with:

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

The repository currently has no application runtime dependencies on the shadcn CLI; it remains available as a development dependency for UI generation.

The production app is deployed to GitHub Pages from `main` by `.github/workflows/deploy.yml`. Set the repository Pages source to **GitHub Actions** before the first release deployment.

## Rollback

If a release must be reverted:

1. Revert the release merge commit on `main` and push the revert.
2. Wait for the GitHub Actions Pages deployment from `main` to complete.
3. If the Actions deployment cannot be used, change the repository Pages source back to **Deploy from a branch**, selecting `main` and the repository root.
4. The v1 implementation is preserved at the `v1.0` tag.
