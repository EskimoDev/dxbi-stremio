// Copies dxbi.theme.css into dxbi.plugin.js (bundledThemeCss), so the plugin carries the whole look
// on its own, and syncs PLUGIN_VERSION with @version. Run before every release: node tools/bundle-theme.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(root + "dxbi.theme.css", "utf8").replace(/^\/\*\*[\s\S]*?\*\/\s*/, "");
const file = root + "dxbi.plugin.js";
const js = readFileSync(file, "utf8");
const re = /\/\*@bundled-theme\*\/"(?:[^"\\]|\\.)*"/;
if (!re.test(js)) throw new Error("bundledThemeCss marker not found");
const version = /@version\s+([\d.]+)/.exec(js)[1];
const out = js
  .replace(re, () => "/*@bundled-theme*/" + JSON.stringify(css))
  .replace(/const PLUGIN_VERSION = "[^"]*";/, `const PLUGIN_VERSION = "${version}";`);
writeFileSync(file, out);
console.log(`bundled ${css.length} bytes of theme`);
