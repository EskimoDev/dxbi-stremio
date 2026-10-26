import { ipcRenderer } from "electron";
import { ICONS, IPC_CHANNELS, SELECTORS } from "../../constants";
import { getTitleBarTemplate } from "../../components/title-bar/titleBar";
import logger from "../../utils/logger";

let transparencyStatusCache: boolean | null = null;

export async function getTransparencyStatus(): Promise<boolean> {
    if (transparencyStatusCache === null) {
        transparencyStatusCache = await ipcRenderer.invoke(IPC_CHANNELS.GET_TRANSPARENCY_STATUS) as boolean;
    }
    return transparencyStatusCache ?? false;
}

export function addTitleBar(): void {
    // One bar on the page itself, above everything (inside a screen it sat under dx.bi's sheets
    // and panels, and every screen got its own copy)
    if (!document.body || document.querySelector(SELECTORS.ROUTE_CONTAINER) === null) return;
    if (document.body.querySelector(":scope > .title-bar")) return;
    
    logger.info("Adding title bar...");
    document.body.insertAdjacentHTML("afterbegin", getTitleBarTemplate());
    
    const titleBar = document.body.querySelector(":scope > .title-bar") as HTMLElement;
    if (!titleBar) return;
    
    let isWindowMaximized = false;
    let isWindowFullscreen = false;
    let isDragging = false;
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;

    const updateMaximizeIcon = (isMax: boolean) => {
        const pathElement = titleBar.querySelector("#maximizeApp-btn svg path");
        if (!pathElement) return;
        
        pathElement.setAttribute("d", isMax ? ICONS.RESTORE : ICONS.MAXIMIZE);
    };

    ipcRenderer.invoke(IPC_CHANNELS.IS_MAXIMIZED).then((isMax: boolean) => {
        isWindowMaximized = isMax;
        updateMaximizeIcon(isMax);
    });

    ipcRenderer.on(IPC_CHANNELS.WINDOW_MAXIMIZED, (_, isMax: boolean) => {
        isWindowMaximized = isMax;
        updateMaximizeIcon(isMax);
    });

    ipcRenderer.on(IPC_CHANNELS.FULLSCREEN_CHANGED, (_, isFullscreen: boolean) => {
        isWindowFullscreen = isFullscreen;
        document.body.classList.toggle('is-fullscreen', isFullscreen);
    });

    titleBar.querySelector("#minimizeApp-btn")?.addEventListener("click", () => {
        ipcRenderer.send(IPC_CHANNELS.MINIMIZE_WINDOW);
    });
    
    titleBar.querySelector("#maximizeApp-btn")?.addEventListener("click", () => {
        ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW);
    });

    titleBar.querySelector("#closeApp-btn")?.addEventListener("click", () => {
        ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW);
    });

    titleBar.addEventListener("mousedown", (e: MouseEvent) => {
        e.stopPropagation();

        if ((e.target as HTMLElement).closest('.title-bar-buttons') || isWindowMaximized || isWindowFullscreen) {
            return;
        }

        isDragging = true;
        mouseOffsetX = e.screenX - window.screenX;
        mouseOffsetY = e.screenY - window.screenY;
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
        if (!isDragging) return;
        
        const moveX = Math.round(e.screenX - mouseOffsetX);
        const moveY = Math.round(e.screenY - mouseOffsetY);
        
        ipcRenderer.send(IPC_CHANNELS.DRAG_WINDOW, moveX, moveY);
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    titleBar.addEventListener("dblclick", (e: MouseEvent) => {
        e.stopPropagation();
        
        if ((e.target as HTMLElement).closest('.title-bar-buttons')) return;
        ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW);
    });
}