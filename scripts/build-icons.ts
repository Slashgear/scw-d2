#!/usr/bin/env bun
/**
 * Generates public/icons/scw/*.svg and src/assets/scw-icons-manifest.json, a
 * curated subset of @ultraviolet/icons (Scaleway's design system), for use as
 * D2 `icon:` references in architecture diagrams.
 *
 * Unlike mermaid (which has an iconify pack registry), D2's `icon:` field is
 * just a URL to an SVG/PNG. So instead of one repackaged iconify JSON, this
 * renders each curated @ultraviolet/icons component to a standalone static
 * SVG file under public/ (served as-is, referenced by path at runtime), and
 * writes a small manifest of the available names.
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

// Curated subset of Scaleway ProductIcon components (64x64 viewBox) relevant
// to cloud architecture diagrams. Key = D2 icon name (scw:<key>), value = the
// component export name under @ultraviolet/icons/product/<name>.
const PRODUCT_ICONS: Record<string, string> = {
  instance: "InstanceProductIcon",
  "instance-gpu": "InstanceGpuProductIcon",
  "elastic-metal": "ElasticMetalProductIcon",
  containers: "ContainersProductIcon",
  functions: "FunctionsProductIcon",
  "serverless-jobs": "ServerlessJobsProductIcon",
  kubernetes: "KubernetesProductIcon",
  registry: "RegistryProductIcon",
  "artifact-registry": "ArtifactRegistryProductIcon",
  rdb: "RdbProductIcon",
  redis: "RedisProductIcon",
  "serverless-db": "ServerlessDbProductIcon",
  "managed-search-database": "ManagedSearchDatabaseProductIcon",
  "managed-kafka": "ManagedKafkaProductIcon",
  queueing: "QueueingProductIcon",
  nats: "NatsProductIcon",
  "object-storage": "ObjectStorageProductIcon",
  "block-storage": "BlockStorageProductIcon",
  "file-storage": "FileStorageProductIcon",
  "cold-storage": "ColdStorageProductIcon",
  snapshots: "SnapshotsProductIcon",
  vpc: "VpcProductIcon",
  "vpc-peering": "VpcPeeringProductIcon",
  "private-network": "PrivateNetworkProductIcon",
  "hub-networks": "HubNetworksProductIcon",
  "public-gateway": "PublicGatewayProductIcon",
  "vpn-customer-gateway": "VpnCustomerGatewayProductIcon",
  "network-acls": "NetworkAclsProductIcon",
  lb: "LbProductIcon",
  "api-gateway": "ApiGatewayProductIcon",
  "edge-services": "EdgeServicesProductIcon",
  cdn: "CdnProductIcon",
  domains: "DomainsProductIcon",
  dns: "DnsProductIcon",
  "ssl-certificates": "SslCertificatesProductIcon",
  "secret-manager": "SecretManagerProductIcon",
  iam: "IamProductIcon",
  vpn: "VpnProductIcon",
  "transactional-email": "TransactionalEmailProductIcon",
  mailbox: "MailboxProductIcon",
  cockpit: "CockpitProductIcon",
  iot: "IotProductIcon",
  "iot-edge": "IotEdgeProductIcon",
  webhosting: "WebhostingProductIcon",
  dedibox: "DedibackupProductIcon",
};

// Curated CategoryIcon components (20x20 viewBox) — useful for container/group icons.
const CATEGORY_ICONS: Record<string, string> = {
  "cat-compute": "ComputeCategoryIcon",
  "cat-containers": "ContainersCategoryIcon",
  "cat-serverless-compute": "ServerlessComputeCategoryIcon",
  "cat-database": "DatabaseCategoryIcon",
  "cat-storage": "StorageCategoryIcon",
  "cat-network": "NetworkCategoryIcon",
  "cat-vpc": "VpcCategoryIcon",
  "cat-security": "SecurityCategoryIcon",
  "cat-key-manager": "KeyManagerCategoryIcon",
  "cat-monitoring": "MonitoringCategoryIcon",
  "cat-data-and-analytics": "DataAndAnalyticsCategoryIcon",
  "cat-ai": "AiCategoryIcon",
  "cat-baremetal": "BaremetalCategoryIcon",
  "cat-domains-and-web-hosting": "DomainsAndWebHostingCategoryIcon",
  "cat-integration-services": "IntegrationServicesCategoryIcon",
};

function extractSvg(svgMarkup: string): string {
  // Strip the <title> element mermaid/D2 don't need in the icon body, keep
  // everything else (including the outer <svg> tag) since D2 loads these as
  // standalone image files, not a repackaged sprite. renderToStaticMarkup
  // omits the xmlns attribute (it's implicit when inlined in an HTML
  // document), but a standalone .svg file loaded via D2's `icon:` needs it
  // declared or browsers refuse to render it as an image at all.
  return svgMarkup
    .replace(/<title>.*?<\/title>/s, "")
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
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

  const names: string[] = [];
  const errors: string[] = [];

  for (const [iconName, exportName] of Object.entries(PRODUCT_ICONS)) {
    try {
      const svg = await renderIcon("product", exportName);
      await writeFile(resolve(outDir, `${iconName}.svg`), svg);
      names.push(iconName);
    } catch (err) {
      errors.push(`product/${exportName}: ${(err as Error).message}`);
    }
  }

  for (const [iconName, exportName] of Object.entries(CATEGORY_ICONS)) {
    try {
      const svg = await renderIcon("category", exportName);
      await writeFile(resolve(outDir, `${iconName}.svg`), svg);
      names.push(iconName);
    } catch (err) {
      errors.push(`category/${exportName}: ${(err as Error).message}`);
    }
  }

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
