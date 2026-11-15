// Builds src/lib/icon-bundle.json with only the Iconify icons used in the source code, so icons work
// fully offline (intranet / no access to api.iconify.design) and the CSP can stay connect-src 'self'.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getIcons } from "@iconify/utils";

const root = new URL("..", import.meta.url).pathname;
const prefixes = ["solar", "tabler"];
const re = new RegExp(`\\b(${prefixes.join("|")}):([a-z0-9-]+)`, "g");
const found = new Map(prefixes.map((p) => [p, new Set()]));

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|json)$/.test(name) && !name.includes("icon-bundle")) {
      for (const m of readFileSync(p, "utf8").matchAll(re)) found.get(m[1]).add(m[2]);
    }
  }
}
walk(join(root, "src"));

const bundle = [];
for (const prefix of prefixes) {
  const all = JSON.parse(readFileSync(join(root, "node_modules", "@iconify-json", prefix, "icons.json"), "utf8"));
  const names = [...found.get(prefix)].filter((n) => all.icons[n] || all.aliases?.[n]);
  const subset = getIcons(all, names);
  if (subset) bundle.push(subset);
}
writeFileSync(join(root, "src", "lib", "icon-bundle.json"), JSON.stringify(bundle));
console.log("icon bundle:", bundle.map((b) => `${b.prefix}=${Object.keys(b.icons).length}`).join(", "));
