// Copies partials/header.html and partials/footer.html into every page
// between the <!-- HEADER:START --> / <!-- HEADER:END --> (and FOOTER) markers,
// and marks the current page's nav link with aria-current="page".
// Usage:  node tools/sync-partials.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = readFileSync(join(root, "partials/header.html"), "utf8").trim();
const footer = readFileSync(join(root, "partials/footer.html"), "utf8").trim();

for (const file of readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const path = join(root, file);
  let html = readFileSync(path, "utf8");
  const navHeader = header.replace(
    new RegExp(`(<li><a href="${file}")>`, "g"),
    '$1 aria-current="page">'
  );
  html = html
    .replace(/<!-- HEADER:START -->[\s\S]*?<!-- HEADER:END -->/, `<!-- HEADER:START -->\n${navHeader}\n<!-- HEADER:END -->`)
    .replace(/<!-- FOOTER:START -->[\s\S]*?<!-- FOOTER:END -->/, `<!-- FOOTER:START -->\n${footer}\n<!-- FOOTER:END -->`);
  writeFileSync(path, html);
  console.log("synced", file);
}
