# Scaleway D2 Diagram Editor (beta)

> [!IMPORTANT]
> **Unofficial proof of concept.** This is an independent, community project — it is not built, maintained, or endorsed by Scaleway. It uses Scaleway's public `@ultraviolet/icons` package and brand icon for convenience.

A single-page React app for writing [D2](https://d2lang.com) diagrams with a curated set of Scaleway product icons, live preview, dark/light rendering, and shareable URLs. D2 compiles and renders entirely in the browser via [`@terrastruct/d2`](https://github.com/terrastruct/d2/tree/master/d2js/js)'s WebAssembly build (the same approach as the official [D2 Playground](https://play.d2lang.com)) — no backend, no server-side rendering. Built with Bun + Vite, deployed as a static site to GitHub Pages.

Sibling project: `scw-mermaid` does the same thing for Mermaid `architecture-beta` diagrams.

## Features

- D2 source editor (left, CodeMirror with syntax highlighting) with a live-rendered preview (right)
- Toolbar: copy source, copy a shareable link, export as SVG or PNG, and a diagram layout panel (layout engine, sketch mode)
- A diagram theme picker: Scaleway's own purple-branded theme (default, follows the app's light/dark toggle automatically) or any of D2's ~20 built-in numbered themes
- Diagram state (source, theme, layout, sketch mode) is encoded in the URL for sharing/reloading. Theme/layout settings are kept out of the editable source itself — they're prepended only at compile time — so the editor stays free of a multi-line color block and "Copy code" gives back a clean diagram (shapes/connections only, not the Scaleway color theme)
- ~60 Scaleway icons (compute, storage, network, database, security, ...) available as `icon: scw:icon-name` in diagrams

## Documentation

- [D2 language tour](https://d2lang.com/tour/intro) — full syntax reference (shapes, connections, containers, ...)
- [D2 icons & images](https://d2lang.com/tour/icons) — how the `icon:` field works
- [D2 themes](https://d2lang.com/tour/themes) — built-in themes and the `theme-overrides` mechanism this app uses for its Scaleway theme

The same D2 docs link is also available from the **D2 docs** link in the app's toolbar.

## Getting started

```sh
bun install
bun run dev
```

`bun run dev` and `bun run build` both regenerate the icon pack first (see below), so no manual step is needed.

## The Scaleway icon pack

Scaleway's icons aren't published anywhere D2 can reference by URL, so `scripts/build-icons.ts` renders a curated subset of [`@ultraviolet/icons`](https://www.npmjs.com/package/@ultraviolet/icons) (Scaleway's design system) React components to static standalone SVG files via `react-dom/server`, written to `public/icons/scw/`. Unlike Mermaid's iconify-pack registry, D2's `icon:` field is just a URL — so instead of a repackaged sprite, this app recognizes a `scw:icon-name` shorthand and rewrites it to the real asset path right before compiling (see `src/lib/scwIcons.ts`). Generated files aren't committed — run explicitly with:

```sh
bun run icons
```

To add more icons, add an entry to `PRODUCT_ICONS` or `CATEGORY_ICONS` in `scripts/build-icons.ts` (the key becomes the diagram-facing name, e.g. `scw:my-icon`; the value is the `@ultraviolet/icons` component export name) and re-run the script.

Reference an icon in a diagram as `scw:<name>`, e.g.:

```
db: Managed Database {
  icon: scw:rdb
}
```

Browse the full curated set live in the app via the **Icons** toolbar button — it lists every available `scw:<name>`, with a preview and click-to-copy. For reference without running the app, the current set (defined in `PRODUCT_ICONS`/`CATEGORY_ICONS` in `scripts/build-icons.ts`) is:

<details>
<summary>Available icon names</summary>

`api-gateway`, `artifact-registry`, `block-storage`, `cat-ai`, `cat-baremetal`, `cat-compute`, `cat-containers`, `cat-data-and-analytics`, `cat-database`, `cat-domains-and-web-hosting`, `cat-integration-services`, `cat-key-manager`, `cat-monitoring`, `cat-network`, `cat-security`, `cat-serverless-compute`, `cat-storage`, `cat-vpc`, `cdn`, `cockpit`, `cold-storage`, `containers`, `dedibox`, `dns`, `domains`, `edge-services`, `elastic-metal`, `file-storage`, `functions`, `hub-networks`, `iam`, `instance`, `instance-gpu`, `iot`, `iot-edge`, `kubernetes`, `lb`, `mailbox`, `managed-kafka`, `managed-search-database`, `nats`, `network-acls`, `object-storage`, `private-network`, `public-gateway`, `queueing`, `rdb`, `redis`, `registry`, `secret-manager`, `serverless-db`, `serverless-jobs`, `snapshots`, `ssl-certificates`, `transactional-email`, `vpc`, `vpc-peering`, `vpn`, `vpn-customer-gateway`, `webhosting`

</details>

## Deployment

Pushing to `main` builds the app and deploys `dist/` to GitHub Pages via `.github/workflows/deploy.yml`. On a fresh repo, enable it once under **Settings → Pages → Source: GitHub Actions**.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for how to get set up. Please also read the [Code of Conduct](CODE_OF_CONDUCT.md). For security issues, see [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

[MIT](LICENSE)
