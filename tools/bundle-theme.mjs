// Copies dxbi.theme.css into dxbi.plugin.js (bundledThemeCss), so the plugin carries the whole look
// on its own. Run after every theme change: node tools/bundle-theme.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const css = readFileSync(root + "dxbi.theme.css", "utf8").replace(/^\/\*\*[\s\S]*?\*\/\s*/, "");
const file = root + "dxbi.plugin.js";
const js = readFileSync(file, "utf8");
const re = /\/\*@bundled-theme\*\/"(?:[^"\\]|\\.)*"/;
if (!re.test(js)) throw new Error("bundledThemeCss marker not found");
writeFileSync(file, js.replace(re, () => "/*@bundled-theme*/" + JSON.stringify(css)));
console.log(`bundled ${css.length} bytes of theme`);
