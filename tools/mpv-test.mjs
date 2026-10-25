// Plays a video through the dx.bi app's mpv player on Windows and checks it end to end: Stremio uses
// its mpv player, the stand-in <video> mirrors mpv, and the picture really shows behind the page on
// the desktop (screenshots of the screen, not of the page). The clip is 10-bit HEVC with AC3 sound in
// MKV, which Chromium's own player can't play.
//
// node tools/mpv-test.mjs <path to dx.bi.exe> [screenshot folder]
import { spawn, execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import zlib from "node:zlib";

const exe = process.argv[2];
const outDir = process.argv[3] || "mpv-shots";
const PORT = 9333;
const CLIP_PORT = 18766;
mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`  ✗ ${msg}`); };
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function waitFor(what, fn, timeout = 60000, every = 500) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    try { last = await fn(); if (last) return last; } catch (e) { last = e.message; }
    await sleep(every);
  }
  throw new Error(`timed out waiting for ${what}${last ? ` (last: ${last})` : ""}`);
}

// No first-run questions: a fresh setup, and server.js for streaming
const userData = join(process.env.APPDATA, "dxbi");
mkdirSync(userData, { recursive: true });
writeFileSync(join(userData, "use_server_js_for_streaming"), "1");

console.log(`launching ${exe}`);
const app = spawn(exe, [`--remote-debugging-port=${PORT}`], { env: { ...process.env, DXBI_IMPORT: "fresh" }, stdio: ["ignore", "pipe", "pipe"] });
let appLog = "";
app.stdout.on("data", (d) => { appLog += d; });
app.stderr.on("data", (d) => { appLog += d; });

let ws;
const pending = new Map();
let nextId = 0;
const send = (method, params = {}) => new Promise((resolve) => { const id = ++nextId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "evaluation failed");
  return r.result?.result?.value;
}

// Screenshot of the whole screen, and how many different colours a grid inside `box` has
function screen(name, box) {
  const png = join(outDir, `${name}.png`);
  const ps = `
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
$bmp.Save('${png.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Png)
$seen = @{}
for ($i = 1; $i -le 12; $i++) { for ($j = 1; $j -le 8; $j++) {
  $x = [int](${box.x} + ${box.width} * $i / 13); $y = [int](${box.y} + ${box.height} * $j / 9)
  if ($x -lt $b.Width -and $y -lt $b.Height) { $c = $bmp.GetPixel($x, $y); $seen["$([int]($c.R/32))-$([int]($c.G/32))-$([int]($c.B/32))"] = 1 }
} }
$seen.Count`;
  const count = parseInt(execFileSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" }).trim(), 10);
  console.log(`  (${name}: ${count} colours in the sampled area)`);
  return count;
}

async function main() {
  const target = await waitFor("the window", async () => {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    return list.find((t) => t.type === "page" && /stremio\.com/.test(t.url));
  }, 90000);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  await send("Runtime.enable");
  await waitFor("Stremio", () => evaluate("document.readyState === 'complete' && !!document.querySelector('#app')"));
  await evaluate(`localStorage.setItem("dxbi.packOffered","1"); localStorage.setItem("checkForUpdatesOnStartup","false"); true`);

  if (await evaluate("window.__dxbiNativePlayer === 'mpv' && typeof window.chrome?.webview?.postMessage === 'function'")) pass("mpv player switched on (Stremio's desktop-shell transport is present)");
  else fail("mpv player not switched on");

  // The streaming server (server.js) and the ffmpeg it downloads
  await waitFor("the streaming server", () => fetch("http://127.0.0.1:11470/settings").then((r) => r.ok), 240000, 2000);
  pass("streaming server running");
  const ffmpeg = join(userData, "streamingserver", "ffmpeg.exe");
  await waitFor("ffmpeg", () => existsSync(ffmpeg), 240000, 2000);

  const clip = join(tmpdir(), "dxbi-hevc10.mkv");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=24", "-f", "lavfi", "-i", "sine=f=440:sample_rate=48000",
    "-t", "40", "-c:v", "libx265", "-preset", "ultrafast", "-pix_fmt", "yuv420p10le", "-x265-params", "log-level=error",
    "-c:a", "ac3", "-b:a", "192k", clip]);
  const size = statSync(clip).size;
  http.createServer((req, res) => {
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || "");
    const head = { "Content-Type": "video/x-matroska", "Accept-Ranges": "bytes", "Access-Control-Allow-Origin": "*" };
    if (m) {
      const s = +m[1], e = m[2] ? +m[2] : size - 1;
      res.writeHead(206, { ...head, "Content-Range": `bytes ${s}-${e}/${size}`, "Content-Length": e - s + 1 });
      createReadStream(clip, { start: s, end: e }).pipe(res);
    } else {
      res.writeHead(200, { ...head, "Content-Length": size });
      createReadStream(clip).pipe(res);
    }
  }).listen(CLIP_PORT, "127.0.0.1");
  pass(`test clip ready (10-bit HEVC + AC3 in MKV, ${(size / 1e6).toFixed(1)} MB)`);

  // Lay the window out on whatever screen the machine has; sample the middle of the video area
  const { width: sw, height: sh } = await evaluate("({ width: screen.width, height: screen.height })");
  const { windowId } = (await send("Browser.getWindowForTarget")).result;
  const place = async (left, top, width, height) => {
    await send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
    await send("Browser.setWindowBounds", { windowId, bounds: { left, top, width, height } });
    await sleep(2000);
    return { x: left + width * 0.3, y: top + height * 0.3, width: width * 0.4, height: height * 0.4 };
  };
  let area = await place(Math.round(sw * 0.05), Math.round(sh * 0.05), Math.round(sw * 0.8), Math.round(sh * 0.8));
  const home = screen("1-home", area);

  const stream = { url: `http://127.0.0.1:${CLIP_PORT}/clip.mkv`, name: "dx.bi test", title: "10-bit HEVC + AC3" };
  const encoded = encodeURIComponent(zlib.deflateSync(Buffer.from(JSON.stringify(stream))).toString("base64"));
  const hash = `#/player/${encoded}/${encodeURIComponent(`http://127.0.0.1:${CLIP_PORT}/manifest.json`)}/${encodeURIComponent("https://v3-cinemeta.strem.io/manifest.json")}/movie/tt1727587/tt1727587`;
  await evaluate(`location.hash = ${JSON.stringify(hash)}; true`);

  const V = `document.querySelector('[class*="player-container"] video')`;
  try {
    const state = await waitFor("mpv to play", () => evaluate(`(() => { const v = ${V}; return v && v.readyState === 4 && v.currentTime > 2 ? { t: v.currentTime, w: v.videoWidth, h: v.videoHeight, cls: v.className } : null })()`), 60000);
    pass(`playing in mpv: ${state.w}×${state.h}, ${state.t.toFixed(1)} s in (${state.cls})`);
  } catch (e) {
    fail(e.message);
  }
  const error = await evaluate(`document.querySelector('[class*="error-layer"]')?.textContent || ""`);
  if (error) fail(`player error: ${error.slice(0, 160)}`);
  if (await evaluate("document.documentElement.hasAttribute('data-dx-mpv-showing')")) pass("page is see-through over the video");
  else fail("page didn't turn see-through");

  // Hide Stremio's controls so the sample area is only video
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5 });
  await sleep(4000);
  const playing = screen("2-playing", area);
  if (playing >= 8 && playing > home + 3) pass("the video shows on screen behind the page");
  else fail(`the video doesn't show on screen (${playing} colours vs ${home} on Home)`);

  // Moving and resizing the window: the video window follows
  area = await place(Math.round(sw * 0.25), Math.round(sh * 0.2), Math.round(sw * 0.7), Math.round(sh * 0.75));
  const moved = screen("3-moved", area);
  if (moved >= 8) pass("the video follows the window when it moves");
  else fail(`the video didn't follow the window (${moved} colours)`);

  // Fullscreen through Stremio's own button path
  await evaluate(`window.chrome.webview.postMessage(JSON.stringify({ id: 0, type: 6, args: ["win-set-visibility", { fullscreen: true }] })); true`);
  await sleep(2500);
  const full = screen("4-fullscreen", { x: sw * 0.2, y: sh * 0.2, width: sw * 0.6, height: sh * 0.6 });
  if (full >= 8) pass("fullscreen shows the video");
  else fail(`fullscreen doesn't show the video (${full} colours)`);
  await evaluate(`window.chrome.webview.postMessage(JSON.stringify({ id: 0, type: 6, args: ["win-set-visibility", { fullscreen: false }] })); true`);
  await sleep(1500);

  // Leaving the player puts the page back
  await evaluate("history.back(); true");
  await sleep(2500);
  if (!(await evaluate("document.documentElement.hasAttribute('data-dx-mpv-showing')"))) pass("the page is solid again after leaving the player");
  else fail("the page stayed see-through after leaving the player");
  screen("5-back", area);
}

let exitCode = 0;
try {
  await main();
} catch (e) {
  fail(e.message);
}
if (failures.length) {
  exitCode = 1;
  console.log(`\n${failures.length} check(s) failed.`);
  console.log("--- app output (last 5000 chars) ---\n" + appLog.slice(-5000));
} else {
  console.log("\nAll mpv checks passed.");
}
try { ws?.close(); } catch (_) { /* closed */ }
app.kill();
await sleep(1000);
process.exit(exitCode);
