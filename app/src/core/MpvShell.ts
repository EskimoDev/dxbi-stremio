import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, execSync, type ChildProcess } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { connect, type Socket } from "net";
import { join } from "path";
import { IPC_CHANNELS } from "../constants";
import { getLogger } from "../utils/logger";

// dx.bi plays video the way the official Stremio desktop app does: in mpv, behind the page.
//
// Stremio's web app has a player for its own desktop shell (ShellVideo). When it finds a WebView2-style
// `chrome.webview` transport it sends that shell mpv commands ("mpv-command", "mpv-set-prop",
// "mpv-observe-prop") and listens for "mpv-prop-change" / "mpv-event-ended", keeping its own player
// screen, menus and addon subtitles on top. The preload provides that transport (preload/mpvShell.ts);
// this side runs mpv and answers it.
//
// mpv draws into a borderless video window kept exactly behind the dx.bi window. The dx.bi window is
// transparent and owned by the video window (an owned window always stays above its owner), and
// while a video plays Stremio makes the page background transparent, so the picture shows through.

const logger = getLogger("MpvShell");
const DEBUG = process.env.DXBI_MPV_DEBUG === "1";

// Qt WebChannel message types that Stremio's shell transport speaks
const SIGNAL = 1;
const INIT = 3;
const INVOKE_METHOD = 6;

// Properties Stremio sets that dx.bi decides itself
const IGNORED_PROPS = new Set(["vo", "osc", "input-default-bindings", "input-vo-keyboard"]);

export default class MpvShell {
    private static mpv: ChildProcess | null = null;
    private static socket: Socket | null = null;
    private static videoWindow: BrowserWindow | null = null;
    private static mainWindow: BrowserWindow | null = null;
    private static requestId = 0;
    private static observed = new Map<string, number>(); // property name → observe id
    private static queue: string[] = [];
    private static playing = false;

    /** mpv to use, if dx.bi should play through mpv on this computer */
    public static mpvPath(): string | null {
        if (process.env.DXBI_MPV === "0") return null;
        const custom = process.env.DXBI_MPV_PATH;
        if (custom) return existsSync(custom) ? custom : null;
        if (process.platform === "win32") {
            const bundled = app.isPackaged
                ? join(process.resourcesPath, "mpv", "mpv.exe")
                : join(__dirname, "..", "..", "mpv", "mpv.exe");
            return existsSync(bundled) ? bundled : null;
        }
        // Elsewhere only when asked for (development): Linux and macOS keep the built-in player for now
        if (process.env.DXBI_MPV === "1") {
            try { return execSync("command -v mpv", { encoding: "utf8" }).trim() || null; } catch { return null; }
        }
        return null;
    }

    public static isEnabled(): boolean {
        return this.mpvPath() !== null;
    }

    /** Call once the main window exists */
    public static setup(mainWindow: BrowserWindow): void {
        this.mainWindow = mainWindow;

        ipcMain.on(IPC_CHANNELS.MPV_SHELL_SEND, (_, raw: string) => {
            try { this.onPageMessage(JSON.parse(raw)); } catch (err) { logger.error(`Bad shell message: ${err}`); }
        });

        this.videoWindow = new BrowserWindow({
            show: false,
            frame: false,
            skipTaskbar: true,
            focusable: false,
            resizable: false,
            hasShadow: false,
            backgroundColor: "#000000",
            webPreferences: { backgroundThrottling: false },
        });
        this.videoWindow.loadURL("about:blank");
        this.videoWindow.setIgnoreMouseEvents(true);

        // The dx.bi window always stays above the video window, and still gets its own taskbar button
        mainWindow.setParentWindow(this.videoWindow);
        mainWindow.setSkipTaskbar(false);

        const follow = () => this.followMainWindow();
        for (const event of ["move", "resize", "maximize", "unmaximize", "restore", "enter-full-screen", "leave-full-screen"] as const) {
            mainWindow.on(event as any, follow);
        }
        mainWindow.on("minimize", () => this.videoWindow?.hide());
        mainWindow.on("restore", () => { if (this.playing) this.videoWindow?.showInactive(); });
        mainWindow.on("enter-full-screen", () => this.sendVisibility());
        mainWindow.on("leave-full-screen", () => this.sendVisibility());
        mainWindow.on("closed", () => this.shutdown());
        app.on("before-quit", () => this.shutdown());

        this.followMainWindow();
        this.startMpv();
    }

    private static followMainWindow(): void {
        if (!this.mainWindow || !this.videoWindow || this.mainWindow.isDestroyed()) return;
        this.videoWindow.setBounds(this.mainWindow.getContentBounds());
    }

    private static startMpv(): void {
        const path = this.mpvPath();
        if (!path || !this.videoWindow) return;
        const handle = this.videoWindow.getNativeWindowHandle();
        const wid = process.platform === "win32" && handle.length >= 8 ? handle.readBigUInt64LE(0).toString() : handle.readUInt32LE(0).toString();
        const pipe = process.platform === "win32" ? `\\\\.\\pipe\\dxbi-mpv-${process.pid}` : join(app.getPath("temp"), `dxbi-mpv-${process.pid}.sock`);

        const args = [
            `--wid=${wid}`,
            `--input-ipc-server=${pipe}`,
            "--idle=yes",
            "--force-window=yes",
            "--no-terminal",
            "--osc=no",
            "--input-default-bindings=no",
            "--input-vo-keyboard=no",
            "--input-cursor=no",
            "--cursor-autohide=no",
            "--keep-open=no",
            "--background-color=#000000",
            "--hwdec=auto-safe",
            "--audio-fallback-to-null=yes", // no sound device (headset unplugged, broken driver): keep playing
            "--vo=gpu-next",
            "--sub-auto=no",
            "--audio-file-auto=no",
            "--ytdl=no",
            "--load-scripts=no",
            "--config=no",
            "--demuxer-max-bytes=300MiB",
            "--demuxer-readahead-secs=60",
            `--user-agent=dx.bi/${app.getVersion()}`,
            // Kept for problem reports (replaced on every start)
            `--log-file=${join(app.getPath("userData"), "mpv.log")}`,
        ];
        // Development: no window at all (tests on a machine without a display to embed in)
        if (process.env.DXBI_MPV_HEADLESS === "1") args.splice(0, args.length, ...args.filter((a) => !/^--(wid|force-window|vo)=/.test(a)), "--vo=null", "--force-window=no");
        logger.info(`Starting mpv: ${path}`);
        this.mpv = spawn(path, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
        this.mpv.stdout?.on("data", (d) => logger.info(`mpv: ${String(d).trim()}`));
        this.mpv.stderr?.on("data", (d) => logger.warn(`mpv: ${String(d).trim()}`));
        this.mpv.on("exit", (code) => {
            logger.warn(`mpv exited (${code})`);
            this.mpv = null;
            this.socket = null;
        });
        this.connect(pipe, 0);
    }

    private static connect(pipe: string, attempt: number): void {
        if (!this.mpv) return;
        const socket = connect(pipe);
        let buffer = ""; // per connection: a retry must never mix its bytes with another's
        socket.on("connect", () => {
            if (this.socket) { socket.destroy(); return; } // another attempt got there first
            logger.info("Connected to mpv");
            this.socket = socket;
            // Observations made before mpv was ready, then anything queued
            for (const [name, id] of this.observed) socket.write(JSON.stringify({ command: ["observe_property", id, name] }) + "\n");
            for (const line of this.queue.splice(0)) socket.write(line);
        });
        socket.on("data", (chunk) => {
            if (this.socket !== socket) return;
            buffer += String(chunk);
            let nl;
            while ((nl = buffer.indexOf("\n")) >= 0) {
                const line = buffer.slice(0, nl);
                buffer = buffer.slice(nl + 1);
                if (line.trim()) this.onMpvLine(line);
            }
        });
        socket.on("error", () => {
            socket.destroy();
            if (!this.socket && attempt < 50) setTimeout(() => this.connect(pipe, attempt + 1), 100);
        });
        socket.on("close", () => {
            if (this.socket !== socket) return;
            this.socket = null;
            if (this.mpv) setTimeout(() => this.connect(pipe, 0), 200);
        });
    }

    private static command(args: unknown[]): void {
        const line = JSON.stringify({ command: args, request_id: ++this.requestId }) + "\n";
        if (this.socket) this.socket.write(line);
        else this.queue.push(line);
    }

    private static onMpvLine(line: string): void {
        let msg: any;
        try { msg = JSON.parse(line); } catch { logger.warn(`mpv sent something unreadable: ${line.slice(0, 120)}`); return; }
        if (DEBUG && !(msg.event === "property-change" && msg.name === "time-pos")) logger.info(`mpv → ${line.slice(0, 200)}`);
        if (msg.event === "property-change") {
            this.signal("mpv-prop-change", { name: msg.name, data: this.propValue(msg.name, msg.data) });
        } else if (msg.event === "end-file") {
            const failed = msg.reason === "error";
            if (msg.reason !== "redirect") this.setPlaying(false);
            this.signal("mpv-event-ended", {
                reason: msg.reason,
                error: failed ? { code: 3, message: `Stream failed to load${msg.file_error ? ` (${msg.file_error})` : ""}`, critical: true } : undefined,
            });
        } else if (msg.event === "file-loaded") {
            this.setPlaying(true);
        } else if (msg.error && msg.error !== "success" && msg.error !== "property unavailable" && msg.request_id) {
            logger.warn(`mpv request ${msg.request_id}: ${msg.error}`);
        }
    }

    // Stremio reads the mpv version as "major.minor" to pick the loadfile argument order
    private static propValue(name: string, data: unknown): unknown {
        if (name === "mpv-version" && typeof data === "string") {
            const m = /(\d+\.\d+(?:\.\d+)?)/.exec(data);
            return m ? m[1] : data;
        }
        return data;
    }

    private static setPlaying(playing: boolean): void {
        this.playing = playing;
        if (!this.videoWindow || !this.mainWindow) return;
        if (playing && !this.mainWindow.isMinimized()) {
            this.followMainWindow();
            this.videoWindow.showInactive();
        } else if (!playing) {
            this.videoWindow.hide();
        }
    }

    // ---- The page's side of the transport ----

    private static onPageMessage(msg: { type: number; args?: unknown[] }): void {
        if (msg.type === INIT) {
            const properties = [
                [0, "shellVersion", 0, `dx.bi ${app.getVersion()}`],
                [0, "gpuVideoProcessing", 0, "false"],
                [0, "nativeAssSubtitles", 0, "false"],
                [0, "cacheDirectoryPicker", 0, "false"],
                [0, "nativeInterfaceScale", 0, "false"],
            ];
            this.toPage({ id: 0, type: INIT, data: { transport: { properties } } });
            this.sendVisibility();
            return;
        }
        if (msg.type !== INVOKE_METHOD || !Array.isArray(msg.args)) return;
        const [method, data] = msg.args as [string, any];
        switch (method) {
            case "mpv-command": {
                const args = Array.isArray(data) ? data : [data];
                if (args[0] === "loadfile") this.setPlaying(true);
                if (args[0] === "stop") this.setPlaying(false);
                this.command(args);
                break;
            }
            case "mpv-set-prop": {
                const [name, value] = data as [string, unknown];
                if (IGNORED_PROPS.has(name)) break;
                this.command(["set_property", name, value]);
                break;
            }
            case "mpv-observe-prop": {
                const name = String(data);
                if (this.observed.has(name)) {
                    // Already observed: Stremio expects the current value again (a new player screen)
                    this.refetch(name);
                    break;
                }
                const id = this.observed.size + 1;
                this.observed.set(name, id);
                if (this.socket) this.socket.write(JSON.stringify({ command: ["observe_property", id, name] }) + "\n");
                break;
            }
            case "dxbi-shaders": {
                // dx.bi's picture enhancement: mpv user shaders (GLSL hooks) sent as text, loaded from files
                const shaders = Array.isArray(data) ? data as { name: string; source: string }[] : [];
                const dir = join(app.getPath("userData"), "shaders");
                mkdirSync(dir, { recursive: true });
                const paths = shaders.map(({ name, source }) => {
                    const file = join(dir, `${String(name).replace(/[^\w.-]/g, "_")}.glsl`);
                    writeFileSync(file, String(source));
                    return file;
                });
                this.command(["set_property", "glsl-shaders", paths]);
                break;
            }
            case "win-set-visibility":
                if (data && typeof data.fullscreen === "boolean") this.mainWindow?.setFullScreen(data.fullscreen);
                break;
            case "quit":
                app.quit();
                break;
            default:
                // Discord, cache folder, interface scale and update notices are handled by dx.bi itself
                break;
        }
    }

    // Re-send a property's value as a change, for a player screen that observes it again
    private static refetch(name: string): void {
        const id = ++this.requestId;
        const listener = (chunk: Buffer) => {
            for (const line of String(chunk).split("\n")) {
                if (!line.includes(`"request_id":${id}`)) continue;
                try {
                    const msg = JSON.parse(line);
                    if (msg.error === "success") this.signal("mpv-prop-change", { name, data: this.propValue(name, msg.data) });
                } catch { /* partial line */ }
                this.socket?.off("data", listener);
            }
        };
        this.socket?.on("data", listener);
        this.socket?.write(JSON.stringify({ command: ["get_property", name], request_id: id }) + "\n");
    }

    private static sendVisibility(): void {
        const fullscreen = !!this.mainWindow?.isFullScreen();
        this.signal("win-visibility-changed", { visible: true, visibility: 1, isFullscreen: fullscreen });
    }

    private static signal(name: string, data: unknown): void {
        this.toPage({ id: 0, type: SIGNAL, args: [name, data] });
    }

    private static sent = 0;
    private static toPage(msg: unknown): void {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
        if (DEBUG && ++this.sent % 25 === 0) logger.info(`sent ${this.sent} messages to the page (crashed: ${this.mainWindow.webContents.isCrashed()}, url: ${this.mainWindow.webContents.getURL().slice(0, 60)})`);
        this.mainWindow.webContents.send(IPC_CHANNELS.MPV_SHELL_EVENT, JSON.stringify(msg));
    }

    private static shutdown(): void {
        try { this.socket?.write(JSON.stringify({ command: ["quit"] }) + "\n"); } catch { /* gone */ }
        const mpv = this.mpv;
        this.mpv = null;
        if (mpv) setTimeout(() => { try { mpv.kill(); } catch { /* gone */ } }, 500);
        if (this.videoWindow && !this.videoWindow.isDestroyed()) this.videoWindow.destroy();
        this.videoWindow = null;
    }
}
