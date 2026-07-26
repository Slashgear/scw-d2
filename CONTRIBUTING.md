# Contributing

Thanks for considering a contribution! This is a small, independent proof-of-concept project (see the disclaimer in [README.md](README.md)), so the process is intentionally lightweight.

## Getting set up

```sh
bun install
bun run dev
```

`bun run dev` and `bun run build` regenerate the Scaleway icon pack automatically (see the "Scaleway icon pack" section in the README) — no separate setup step needed.

Before opening a PR, please make sure these pass:

```sh
bunx tsc -b
bun run lint
bun run build
```

## Making changes

- Keep PRs focused — one change per PR is easier to review than several bundled together.
- Match the existing code style (TypeScript, functional React components, Tailwind for styling). There's no separate formatter/linter config beyond `oxlint`; run `bun run lint` before submitting.
- If you add or rename a Scaleway icon, edit `PRODUCT_ICONS`/`CATEGORY_ICONS` in `scripts/build-icons.ts` and re-run `bun run icons` to confirm it generates cleanly.
- UI changes: please include a screenshot or short description of what changed visually.

## Reporting bugs / requesting features

Open a GitHub issue using the provided templates. For anything that could be a security issue, see [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Code of conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md) — please read it before participating.
