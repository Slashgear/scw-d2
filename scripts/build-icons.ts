#!/usr/bin/env bun
/**
 * Generates public/icons/scw/*.svg and src/assets/scw-icons-manifest.json
 * from every @ultraviolet/icons ProductIcon/CategoryIcon (Scaleway's design
 * system), for use as D2 `icon:` references in architecture diagrams.
 *
 * Unlike mermaid (which has an iconify pack registry), D2's `icon:` field is
 * just a URL to an SVG/PNG. So instead of one repackaged iconify JSON, this
 * renders each component to a standalone static SVG file under public/
 * (served as-is, referenced by path at runtime), and writes a small manifest
 * of the available names.
 *
 * The icon set is discovered from the package's public barrel exports
 * (`@ultraviolet/icons/product` / `/category`) rather than a hand-typed map,
 * so newly added Scaleway product icons show up automatically instead of
 * silently being unavailable until someone remembers to add an entry.
 *
 * @ultraviolet/icons ships React components, not raw SVG files, so we render
 * each one to static markup with react-dom/server.
 *
 * Run with: bun run icons
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Not real infra/product icons — internal codenames, or icon-of-an-icon /
// programming-language logos that don't belong in an architecture diagram.
const PRODUCT_EXCLUDE = new Set([
  "JeroProductIcon",
  "NabuProductIcon",
  "CbProductIcon",
  "IconElasticMetalProductIcon",
  "IconSdkProductIcon",
  "IconSdkJsProductIcon",
  "SdkGoProductIcon",
  "SdkPythonProductIcon",
  "TrycatchProductIcon",
]);

// Scaleway Console navigation categories (billing, docs, profile, ...), not
// architecture-diagram concepts.
const CATEGORY_EXCLUDE = new Set([
  "BusinessDetailsCategoryIcon",
  "BillingCategoryIcon",
  "DevToolsCategoryIcon",
  "DocumentationCategoryIcon",
  "InteractiveDemosCategoryIcon",
  "LabsCategoryIcon",
  "OrganizationDashboardCategoryIcon",
  "OrganizationNotificationsCategoryIcon",
  "PartnersCategoryIcon",
  "PinCategoryIcon",
  "PrivacyCategoryIcon",
  "ProfileCategoryIcon",
  "ProfileNotificationsCategoryIcon",
  "UseCaseCategoryIcon",
  "UseCasesCategoryIcon",
]);

/** PascalCase export name -> kebab-case D2 icon name, e.g. "SslCertificates" -> "ssl-certificates". */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * @ultraviolet/icons' two-tone product icons hardcode their fill colors per
 * path, and — evidently from a couple of design-system revisions over time —
 * not all icons agree on the exact purple. Most use a light "fillWeak"
 * background with dark/mid-purple line art, but a handful (artifact-registry,
 * file-storage, vpn, vpn-customer-gateway, ...) instead use a *dark*
 * "fillWeak" background with a white glyph — a legitimately different
 * "inverted badge" style within Ultraviolet itself, not a bug in this script,
 * but jarring when it sits next to every other icon in the same diagram.
 *
 * Normalize every icon to one canonical light/mid/dark triad, keyed off the
 * `fillWeak` class Ultraviolet already annotates its background shape with
 * (rather than the specific hex, which varies) — this fixes both the
 * near-duplicate purple drift AND the inverted-badge icons in one pass, and
 * keeps working for icons added in the future. Any fill color outside the
 * known set (e.g. a third-party brand logo icon) is left untouched, so those
 * keep their authentic colors.
 */
const CANONICAL = { light: "#f1eefc", mid: "#a060f6", dark: "#521094" };
const DARK_HEXES = new Set(["#4f0599", "#521094"]);
const MID_HEXES = new Set(["#a365f6", "#a060f6", "#bf95f9"]);
const LIGHT_HEXES = new Set(["#eef", "#f1eefc"]);

function recolor(svgMarkup: string): string {
  // fillWeak (and the fill color) is sometimes set on a wrapping <g> that
  // child <path>s inherit from, rather than on each path directly.
  return svgMarkup.replace(/<(?:path|rect|circle|polygon|g)\b[^>]*\/?>/g, (tag) => {
    const fillMatch = tag.match(/fill="([^"]*)"/);
    if (!fillMatch) return tag;
    const fill = fillMatch[1].toLowerCase();
    if (fill === "none" || fill === "currentcolor") return tag;

    const classMatch = tag.match(/class="([^"]*)"/);
    const isWeak = classMatch?.[1].includes("fillWeak") ?? false;

    let next: string;
    if (isWeak) next = CANONICAL.light;
    else if (fill === "#fff" || fill === "#ffffff") next = CANONICAL.dark;
    else if (DARK_HEXES.has(fill)) next = CANONICAL.dark;
    else if (MID_HEXES.has(fill)) next = CANONICAL.mid;
    else if (LIGHT_HEXES.has(fill)) next = CANONICAL.light;
    else return tag; // unrecognized color (e.g. a brand logo) — leave as-is

    return tag.replace(/fill="[^"]*"/, `fill="${next}"`);
  });
}

function extractSvg(svgMarkup: string): string {
  // Strip the <title> element mermaid/D2 don't need in the icon body, keep
  // everything else (including the outer <svg> tag) since D2 loads these as
  // standalone image files, not a repackaged sprite. renderToStaticMarkup
  // omits the xmlns attribute (it's implicit when inlined in an HTML
  // document), but a standalone .svg file loaded via D2's `icon:` needs it
  // declared or browsers refuse to render it as an image at all.
  return recolor(
    svgMarkup
      .replace(/<title>.*?<\/title>/s, "")
      .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '),
  );
}

async function discover(subpath: "product" | "category", exclude: Set<string>): Promise<string[]> {
  const mod: Record<string, unknown> = await import(`@ultraviolet/icons/${subpath}`);
  const suffix = subpath === "product" ? "ProductIcon" : "CategoryIcon";
  return Object.keys(mod)
    .filter((name) => name.endsWith(suffix) && !exclude.has(name))
    .sort();
}

async function renderIcon(subpath: string, exportName: string): Promise<string> {
  const mod = await import(`@ultraviolet/icons/${subpath}/${exportName}`);
  const Component = mod[exportName];
  if (!Component) {
    throw new Error(`Export "${exportName}" not found in @ultraviolet/icons/${subpath}/${exportName}`);
  }
  const markup = renderToStaticMarkup(createElement(Component, { title: exportName }));
  return extractSvg(markup);
}

async function main() {
  const outDir = resolve(import.meta.dirname, "../public/icons/scw");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const productNames = await discover("product", PRODUCT_EXCLUDE);
  const categoryNames = await discover("category", CATEGORY_EXCLUDE);

  const names: string[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();

  async function renderAll(exportNames: string[], subpath: "product" | "category", suffix: string, prefix: string) {
    for (const exportName of exportNames) {
      const iconName = `${prefix}${toKebabCase(exportName.slice(0, -suffix.length))}`;
      const existing = seen.get(iconName);
      if (existing) {
        errors.push(`${iconName}: collides with ${existing} (from ${exportName})`);
        continue;
      }
      try {
        const svg = await renderIcon(subpath, exportName);
        await writeFile(resolve(outDir, `${iconName}.svg`), svg);
        seen.set(iconName, exportName);
        names.push(iconName);
      } catch (err) {
        errors.push(`${subpath}/${exportName}: ${(err as Error).message}`);
      }
    }
  }

  await renderAll(productNames, "product", "ProductIcon", "");
  await renderAll(categoryNames, "category", "CategoryIcon", "cat-");

  if (errors.length > 0) {
    console.error(`\nFailed to render ${errors.length} icon(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    if (names.length === 0) process.exit(1);
  }

  const manifestPath = resolve(import.meta.dirname, "../src/assets/scw-icons-manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(names.sort(), null, 2));

  const written = (await readdir(outDir)).length;
  console.log(`Wrote ${written} icon(s) to ${outDir}`);
  console.log(`Wrote manifest of ${names.length} name(s) to ${manifestPath}`);
}

main();
