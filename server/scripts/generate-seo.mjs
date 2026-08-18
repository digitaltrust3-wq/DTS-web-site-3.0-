import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dist = path.join(root, "dist");
const configuredUrl = process.env.VITE_SITE_URL || process.env.PUBLIC_SITE_URL || "https://digitaltrust3-wq.github.io/DTS-web-site-3.0-/";
const siteUrl = `${configuredUrl.replace(/\/+$/, "")}/`;

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${siteUrl}privacy.html</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
`;

await fs.writeFile(path.join(dist, "robots.txt"), robots, "utf8");
await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
