/**
 * @name dx.bi
 * @description The dx.bi experience: cinematic billboard, Netflix-style carousels, hover previews, IMDb ratings on posters, wide Continue Watching, a Netflix-style player and an animated intro. Use with the dx.bi theme.
 * @version 2.1.0
 * @author dx.bi
 * @updateUrl https://raw.githubusercontent.com/notdxbi/dxbi-stremio/main/dxbi.plugin.js
 */

(function () {
  "use strict";

  if (window.__dxbi && typeof window.__dxbi.destroy === "function") {
    try { window.__dxbi.destroy(); } catch (_) { /* previous instance already gone */ }
  }

  const API = typeof StremioEnhancedAPI !== "undefined" ? StremioEnhancedAPI : null;
  // Stremio Enhanced loads each plugin as <script id="<file name>">, which tells us our settings key
  const SCRIPT_ID = (document.currentScript && document.currentScript.id) || "dxbi.plugin.js";
  const PLUGIN_KEY = SCRIPT_ID.replace(/\.plugin\.js$/, "");
  const log = (...args) => console.log("[dx.bi]", ...args);

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  const ACCENTS = {
    red: "#e50914",
    crimson: "#d81f3c",
    blue: "#2f80ff",
    purple: "#8b5cf6",
    green: "#1db954",
    amber: "#f5a524",
    pink: "#ec4899",
    white: "#f4f4f5",
  };

  const DEFAULTS = {
    accent: "red",
    billboard: true,
    billboardSource: "mixed",
    billboardInterval: "9",
    previews: true,
    ratings: true,
    wideContinue: true,
    playerExtras: true,
    splash: true,
    introSound: false,
  };

  const SCHEMA = [
    {
      key: "accent",
      type: "select",
      label: "Accent colour",
      description: "Colour used for the logo, progress bars, seek bar and highlights.",
      defaultValue: DEFAULTS.accent,
      options: [
        { label: "Cinema Red", value: "red" },
        { label: "Crimson", value: "crimson" },
        { label: "Electric Blue", value: "blue" },
        { label: "Violet", value: "purple" },
        { label: "Emerald", value: "green" },
        { label: "Amber", value: "amber" },
        { label: "Pink", value: "pink" },
        { label: "Mono", value: "white" },
      ],
    },
    { key: "billboard", type: "toggle", label: "Billboard on Home", description: "Large rotating feature banner at the top of Home.", defaultValue: DEFAULTS.billboard },
    {
      key: "billboardSource",
      type: "select",
      label: "Billboard content",
      defaultValue: DEFAULTS.billboardSource,
      options: [
        { label: "Popular movies & series", value: "mixed" },
        { label: "Popular movies", value: "movie" },
        { label: "Popular series", value: "series" },
        { label: "Top rated (IMDb)", value: "rated" },
      ],
    },
    {
      key: "billboardInterval",
      type: "select",
      label: "Billboard rotation",
      defaultValue: DEFAULTS.billboardInterval,
      options: [
        { label: "Every 6 seconds", value: "6" },
        { label: "Every 9 seconds", value: "9" },
        { label: "Every 14 seconds", value: "14" },
        { label: "Don't rotate", value: "0" },
      ],
    },
    { key: "previews", type: "toggle", label: "Hover previews", description: "Show a details card when you rest the mouse on a title.", defaultValue: DEFAULTS.previews },
    { key: "ratings", type: "toggle", label: "IMDb ratings on posters", description: "Small IMDb badge on every poster (fetched from Cinemeta and cached).", defaultValue: DEFAULTS.ratings },
    { key: "wideContinue", type: "toggle", label: "Wide Continue Watching", description: "Show Continue Watching as landscape cards with title art.", defaultValue: DEFAULTS.wideContinue },
    { key: "playerExtras", type: "toggle", label: "Netflix-style player extras", description: "Back/forward 10 seconds buttons, title in the control bar and play/pause feedback.", defaultValue: DEFAULTS.playerExtras },
    { key: "splash", type: "toggle", label: "Intro animation", description: "Plays once each time the app starts.", defaultValue: DEFAULTS.splash },
    { key: "introSound", type: "toggle", label: "Intro sound", description: "A short low 'thud' with the intro animation.", defaultValue: DEFAULTS.introSound },
  ];

  const settings = { ...DEFAULTS };

  function normalise(raw) {
    const out = { ...DEFAULTS };
    if (!raw || typeof raw !== "object") return out;
    for (const key of Object.keys(DEFAULTS)) {
      if (raw[key] === undefined || raw[key] === null || raw[key] === "") continue;
      if (typeof DEFAULTS[key] === "boolean") out[key] = raw[key] === true || raw[key] === "true";
      else out[key] = String(raw[key]);
    }
    return out;
  }

  async function loadSettings() {
    // Cached copy first so the UI is right on the very first frame
    try { Object.assign(settings, normalise(JSON.parse(localStorage.getItem("dxbi.settings") || "null"))); } catch (_) { /* ignore */ }
    applyAccent();
    if (!API) return;

    // Drop a schema left over from an older version (kept in memory until the app restarts)
    try {
      await window.StremioEnhancedAPI?.clearRegisteredSettings?.(PLUGIN_KEY);
    } catch (_) { /* nothing registered yet */ }
    API.registerSettings(SCHEMA).catch(() => { /* already registered */ });
    const values = await Promise.all(
      Object.keys(DEFAULTS).map((key) => API.getSetting(key).then((v) => [key, v]).catch(() => [key, null]))
    );
    Object.assign(settings, normalise(Object.fromEntries(values)));
    persistSettings();
    API.onSettingsSaved((all) => {
      Object.assign(settings, normalise(all));
      persistSettings();
      applyAccent();
      hero.reset();
      scheduleSync();
    });
  }

  function persistSettings() {
    try { localStorage.setItem("dxbi.settings", JSON.stringify(settings)); } catch (_) { /* ignore */ }
  }

  function applyAccent() {
    const colour = ACCENTS[settings.accent] || ACCENTS.red;
    document.documentElement.style.setProperty("--dx-accent", colour);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.25"/><path d="M12 11v6M12 7.5v.01"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="5.5" y="4" width="4.5" height="16" rx="1"/><rect x="14" y="4" width="4.5" height="16" rx="1"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    rewind10: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M6.7 2.8v3.9h3.9"/><text x="12" y="14.7" text-anchor="middle" fill="currentColor" stroke="none" style="font: 800 6.4px Inter, sans-serif; letter-spacing: -0.3px">10</text></svg>',
    forward10: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M17.3 2.8v3.9h-3.9"/><text x="12" y="14.7" text-anchor="middle" fill="currentColor" stroke="none" style="font: 800 6.4px Inter, sans-serif; letter-spacing: -0.3px">10</text></svg>',
    playSmall: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l10.8-6.8a.8.8 0 0 0 0-1.36L9.22 4.52A.8.8 0 0 0 8 5.2z"/></svg>',
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const art = {
    background: (id) => `https://images.metahub.space/background/large/${id}/img`,
    backgroundMedium: (id) => `https://images.metahub.space/background/medium/${id}/img`,
    logo: (id) => `https://images.metahub.space/logo/medium/${id}/img`,
  };

  function parseDetailHref(href) {
    const m = /#\/detail\/([^/]+)\/([^/?]+)/.exec(href || "");
    if (!m) return null;
    return { type: decodeURIComponent(m[1]), id: decodeURIComponent(m[2]) };
  }

  function cardInfo(card) {
    const link = card.querySelector('a[class*="meta-item-link"]') || card.querySelector("a[href]");
    if (!link) return null;
    const href = link.getAttribute("href") || "";
    const parsed = parseDetailHref(href);
    if (!parsed) return null;
    const title = card.querySelector('[class*="title-label"]')?.textContent?.trim() || link.getAttribute("title") || "";
    const poster = card.querySelector('img[class*="poster-image"]')?.getAttribute("src") || "";
    return { ...parsed, href, title, poster, link };
  }

  function isImdb(id) {
    return /^tt\d+$/.test(id || "");
  }

  function preload(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  function formatRuntime(runtime) {
    if (!runtime) return "";
    const mins = parseInt(String(runtime).replace(/[^\d]/g, ""), 10);
    if (!mins) return String(runtime);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60 ? (mins % 60) + "m" : ""}`.trim();
  }

  function imdbHtml(rating) {
    const r = parseFloat(rating);
    if (!r) return "";
    return `<span class="dx-imdb"><i>IMDb</i>${r.toFixed(1)}</span>`;
  }

  // ---------------------------------------------------------------------------
  // Metadata (Cinemeta) with memory + localStorage cache and a small fetch queue
  // ---------------------------------------------------------------------------

  const META_TTL = 3 * 24 * 60 * 60 * 1000;
  const META_PREFIX = "dxbi.meta.";
  const memory = new Map();
  const inflight = new Map();
  const queue = [];
  let active = 0;

  function readCached(key) {
    if (memory.has(key)) return memory.get(key);
    try {
      const raw = localStorage.getItem(META_PREFIX + key);
      if (!raw) return undefined;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.t > META_TTL) return undefined;
      memory.set(key, entry.m);
      return entry.m;
    } catch (_) {
      return undefined;
    }
  }

  let writes = 0;
  function writeCached(key, meta) {
    memory.set(key, meta);
    if (memory.size > 1500) memory.delete(memory.keys().next().value);
    try {
      localStorage.setItem(META_PREFIX + key, JSON.stringify({ t: Date.now(), m: meta }));
      if (++writes % 50 === 0) pruneCache(900);
    } catch (_) {
      pruneCache(0);
    }
  }

  // Keep the cache bounded: drop expired entries, then the oldest beyond `limit`
  function pruneCache(limit) {
    try {
      const entries = [];
      for (const k of Object.keys(localStorage)) {
        if (!k.startsWith(META_PREFIX)) continue;
        let t = 0;
        try { t = JSON.parse(localStorage.getItem(k)).t || 0; } catch (_) { /* corrupt entry */ }
        if (Date.now() - t > META_TTL) localStorage.removeItem(k);
        else entries.push([k, t]);
      }
      const keep = limit || Math.floor(entries.length / 2);
      entries.sort((a, b) => a[1] - b[1]);
      entries.slice(0, Math.max(0, entries.length - keep)).forEach(([k]) => localStorage.removeItem(k));
    } catch (_) { /* ignore */ }
  }

  function slimMeta(meta) {
    if (!meta) return null;
    return {
      name: meta.name,
      type: meta.type,
      imdbRating: meta.imdbRating,
      releaseInfo: meta.releaseInfo || meta.year,
      runtime: meta.runtime,
      genres: (meta.genres || meta.genre || []).slice(0, 4),
      seasons: Array.isArray(meta.videos) ? new Set(meta.videos.map((v) => v.season).filter((n) => n > 0)).size : 0,
      description: meta.description ? String(meta.description).slice(0, 420) : "",
      logo: meta.logo,
      background: meta.background,
    };
  }

  function getMeta(type, id) {
    if (!isImdb(id) || (type !== "movie" && type !== "series")) return Promise.resolve(null);
    const key = `${type}:${id}`;
    const cached = readCached(key);
    if (cached !== undefined) return Promise.resolve(cached);
    if (inflight.has(key)) return inflight.get(key);
    const p = new Promise((resolve) => {
      queue.push({ type, id, key, resolve });
      pump();
    });
    inflight.set(key, p);
    return p;
  }

  function pump() {
    while (active < 4 && queue.length) {
      const job = queue.shift();
      active++;
      fetch(`https://v3-cinemeta.strem.io/meta/${job.type}/${job.id}.json`, { signal: AbortSignal.timeout(10000) })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const meta = slimMeta(j && j.meta);
          if (meta) writeCached(job.key, meta);
          job.resolve(meta);
        })
        .catch(() => job.resolve(null))
        .finally(() => {
          active--;
          inflight.delete(job.key);
          pump();
        });
    }
  }

  // ---------------------------------------------------------------------------
  // Route + header state
  // ---------------------------------------------------------------------------

  function currentRoute() {
    const hash = (location.hash || "#/").replace(/^#/, "");
    const first = hash.split(/[/?]/).filter(Boolean)[0] || "board";
    return first;
  }

  function updateRoute() {
    const route = currentRoute();
    if (document.body.dataset.dxRoute !== route) {
      document.body.dataset.dxRoute = route;
      document.body.classList.remove("dx-scrolled");
      preview.close(true);
    }
  }

  function onScroll(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    preview.close(true);
    if (target.matches('[class*="board-content-"]:not([class*="board-content-container"]), [class*="discover-content"] [class*="meta-items-container"], [class*="library-content"] [class*="meta-items-container"], [class*="search-content"], [class*="settings-content"] [class*="sections-container"], [class*="addons-list-container"], [class*="calendar"] [class*="content"]')) {
      document.body.classList.toggle("dx-scrolled", target.scrollTop > 8);
    }
    if (target.matches('[class*="meta-row"] > [class*="meta-items-container"]')) {
      updateArrows(target.parentElement);
    }
  }

  // ---------------------------------------------------------------------------
  // Billboard
  // ---------------------------------------------------------------------------

  const hero = {
    el: null,
    items: [],
    index: 0,
    timer: null,
    loading: null,
    paused: false,

    sourceUrls() {
      const base = "https://v3-cinemeta.strem.io/catalog";
      switch (settings.billboardSource) {
        case "movie": return [`${base}/movie/top.json`];
        case "series": return [`${base}/series/top.json`];
        case "rated": return [`${base}/movie/imdbRating.json`, `${base}/series/imdbRating.json`];
        default: return [`${base}/movie/top.json`, `${base}/series/top.json`];
      }
    },

    async load() {
      if (this.loading) return this.loading;
      this.loading = (async () => {
        const lists = await Promise.all(
          this.sourceUrls().map((u) =>
            fetch(u, { signal: AbortSignal.timeout(10000) })
              .then((r) => (r.ok ? r.json() : { metas: [] }))
              .then((j) => j.metas || [])
              .catch(() => [])
          )
        );
        // Interleave movies and series, keep ones with real artwork and a description
        const merged = [];
        const max = Math.max(...lists.map((l) => l.length), 0);
        for (let i = 0; i < max && merged.length < 24; i++) {
          for (const list of lists) if (list[i]) merged.push(list[i]);
        }
        const usable = merged.filter((m) => isImdb(m.id) && m.description && (m.background || m.poster)).slice(0, 8);
        // Only keep slides whose backdrop actually loads
        const checked = await Promise.all(usable.map(async (m) => ((await preload(art.background(m.id))) ? m : null)));
        this.items = checked.filter(Boolean).slice(0, 6);
        return this.items;
      })();
      return this.loading;
    },

    host() {
      return document.querySelector('[class*="board-container"] [class*="board-content-"]:not([class*="board-content-container"])');
    },

    async ensure() {
      const host = this.host();
      if (!settings.billboard || !host) {
        if (!settings.billboard) this.remove();
        return;
      }
      if (this.el && this.el.isConnected && host.firstElementChild === this.el) return;
      if (this.el && this.el.isConnected && host.contains(this.el)) {
        host.insertBefore(this.el, host.firstElementChild);
        return;
      }
      if (!this.items.length) {
        await this.load();
        if (!this.items.length) return;
      }
      const freshHost = this.host();
      if (!freshHost || (this.el && this.el.isConnected)) return;
      this.build();
      freshHost.insertBefore(this.el, freshHost.firstElementChild);
      this.show(this.index % this.items.length, true);
    },

    build() {
      const el = document.createElement("section");
      el.className = "dx-hero";
      el.setAttribute("aria-label", "Featured");
      el.innerHTML =
        this.items.map((m, i) => this.slideHtml(m, i)).join("") +
        `<div class="dx-hero-shade"></div>` +
        `<div class="dx-hero-dots">${this.items.map((m, i) => `<button class="dx-hero-dot" data-i="${i}" aria-label="${esc(m.name)}"></button>`).join("")}</div>`;
      const interval = parseInt(settings.billboardInterval, 10);
      el.style.setProperty("--dx-hero-interval", (interval || 9) + "s");
      if (!interval) el.classList.add("is-static");

      el.addEventListener("click", (e) => {
        const dot = e.target.closest(".dx-hero-dot");
        if (dot) { this.show(parseInt(dot.dataset.i, 10)); return; }
        const go = e.target.closest("[data-href]");
        if (go) location.hash = go.dataset.href;
      });
      el.addEventListener("mouseenter", () => this.pause(true));
      el.addEventListener("mouseleave", () => this.pause(false));

      el.querySelectorAll(".dx-hero-logo").forEach((img) => {
        img.addEventListener("error", () => {
          const title = document.createElement("h1");
          title.className = "dx-hero-title";
          title.textContent = img.alt;
          img.replaceWith(title);
        }, { once: true });
      });
      this.el = el;
    },

    slideHtml(m, i) {
      const type = m.type === "series" ? "series" : "movie";
      const year = m.releaseInfo ? String(m.releaseInfo).replace(/–$/, "–") : "";
      const genres = (m.genres || m.genre || []).slice(0, 3);
      const metaBits = [
        imdbHtml(m.imdbRating),
        year && `<span>${esc(year)}</span>`,
        m.runtime && `<span>${esc(formatRuntime(m.runtime))}</span>`,
        `<span class="dx-pill">${type === "series" ? "Series" : "Film"}</span>`,
        genres.length && `<span>${genres.map(esc).join(" · ")}</span>`,
      ].filter(Boolean);
      const playHref = type === "movie" ? `/detail/movie/${m.id}/${m.id}` : `/detail/series/${m.id}`;
      return `
        <div class="dx-hero-slide" data-i="${i}">
          <div class="dx-hero-backdrop" style="background-image:url('${art.background(m.id)}')"></div>
          <div class="dx-hero-content">
            <div class="dx-hero-kicker"><b>DX.BI</b>${type === "series" ? "Series" : "Film"}</div>
            <img class="dx-hero-logo" src="${art.logo(m.id)}" alt="${esc(m.name)}" draggable="false">
            <div class="dx-hero-meta">${metaBits.join("")}</div>
            <p class="dx-hero-desc">${esc(m.description)}</p>
            <div class="dx-hero-actions">
              <button class="dx-btn dx-btn-primary" data-href="${playHref}">${ICONS.play}<span>Play</span></button>
              <button class="dx-btn dx-btn-secondary" data-href="/detail/${type}/${m.id}">${ICONS.info}<span>More Info</span></button>
            </div>
          </div>
        </div>`;
    },

    show(i, instant) {
      if (!this.el || !this.items.length) return;
      this.index = (i + this.items.length) % this.items.length;
      this.el.querySelectorAll(".dx-hero-slide").forEach((s, n) => s.classList.toggle("is-active", n === this.index));
      this.el.querySelectorAll(".dx-hero-dot").forEach((d, n) => {
        d.classList.remove("is-active");
        if (n === this.index) {
          void d.offsetWidth; // restart the progress animation
          d.classList.add("is-active");
        }
      });
      if (!instant) preload(art.background(this.items[(this.index + 1) % this.items.length].id));
      this.schedule();
    },

    schedule() {
      clearTimeout(this.timer);
      const seconds = parseInt(settings.billboardInterval, 10);
      if (!seconds || this.items.length < 2) return;
      this.timer = setTimeout(() => this.tick(), seconds * 1000);
    },

    tick() {
      const visible = this.el && this.el.isConnected && currentRoute() === "board" && !document.hidden;
      if (this.paused || !visible) { this.schedule(); return; }
      this.show(this.index + 1);
    },

    pause(state) {
      this.paused = state;
      if (this.el) this.el.classList.toggle("is-paused", state);
      if (!state) this.schedule();
    },

    remove() {
      clearTimeout(this.timer);
      if (this.el) this.el.remove();
      this.el = null;
    },

    reset() {
      this.remove();
      this.items = [];
      this.loading = null;
      this.index = 0;
      scheduleSync();
    },
  };

  // ---------------------------------------------------------------------------
  // Carousels (arrows + page dots)
  // ---------------------------------------------------------------------------

  function carouselRows() {
    return document.querySelectorAll('[class*="board-content-"]:not([class*="board-content-container"]) [class*="meta-row-container"], [class*="search-content"] [class*="meta-row-container"]');
  }

  function enhanceRow(row) {
    const track = row.querySelector(':scope > [class*="meta-items-container"]');
    if (!track) return;
    if (!row.querySelector(":scope > .dx-arrow")) {
      const prev = document.createElement("button");
      prev.className = "dx-arrow dx-arrow-prev is-hidden";
      prev.setAttribute("aria-label", "Previous");
      prev.innerHTML = ICONS.chevronLeft;
      const next = document.createElement("button");
      next.className = "dx-arrow dx-arrow-next";
      next.setAttribute("aria-label", "Next");
      next.innerHTML = ICONS.chevronRight;
      const pages = document.createElement("div");
      pages.className = "dx-row-pages";
      prev.addEventListener("click", () => page(row, -1));
      next.addEventListener("click", () => page(row, 1));
      row.append(prev, next, pages);
    }
    updateArrows(row);
  }

  function page(row, dir) {
    const track = row.querySelector(':scope > [class*="meta-items-container"]');
    if (!track) return;
    const first = track.querySelector(':scope > [class*="meta-item"]');
    const step = first ? first.getBoundingClientRect().width : 200;
    const perPage = Math.max(1, Math.floor((track.clientWidth - 40) / step));
    track.scrollBy({ left: dir * perPage * step, behavior: "smooth" });
  }

  function updateArrows(row) {
    const track = row && row.querySelector(':scope > [class*="meta-items-container"]');
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const prev = row.querySelector(":scope > .dx-arrow-prev");
    const next = row.querySelector(":scope > .dx-arrow-next");
    const pages = row.querySelector(":scope > .dx-row-pages");
    if (!prev || !next || !pages) return;
    prev.classList.toggle("is-hidden", track.scrollLeft <= 4);
    next.classList.toggle("is-hidden", track.scrollLeft >= max - 4);
    // Arrows cover the cards exactly, whatever the row height
    const top = track.offsetTop;
    const height = track.offsetHeight;
    for (const a of [prev, next]) {
      a.style.top = top + "px";
      a.style.height = height + "px";
      a.style.bottom = "auto";
    }
    const count = max > 4 ? Math.ceil(track.scrollWidth / track.clientWidth) : 0;
    if (pages.childElementCount !== count) pages.innerHTML = "<span></span>".repeat(count);
    if (count) {
      const activePage = Math.round((track.scrollLeft / max) * (count - 1));
      [...pages.children].forEach((s, i) => s.classList.toggle("is-active", i === activePage));
    }
  }

  // ---------------------------------------------------------------------------
  // Poster decorations: IMDb badge + wide Continue Watching art
  // ---------------------------------------------------------------------------

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        decorate(entry.target);
      }
    },
    { rootMargin: "300px 600px" }
  );

  function allCards() {
    return document.querySelectorAll('#app [class*="meta-item-container"]');
  }

  function isWideRow(card) {
    return settings.wideContinue && !!card.closest('[class*="continue-watching-row"]');
  }

  function decorate(card) {
    const info = cardInfo(card);
    const poster = card.querySelector('[class*="poster-container"]');
    if (!info || !poster) return;
    const key = `${info.type}:${info.id}`;

    // Wide art for Continue Watching
    const wantWide = isWideRow(card);
    let wide = poster.querySelector(":scope > .dx-wide-art");
    if (wantWide) {
      if (!wide || wide.dataset.key !== key) {
        if (wide) wide.remove();
        wide = document.createElement("div");
        wide.className = "dx-wide-art";
        wide.dataset.key = key;
        const fallback = info.poster ? `url('${info.poster}')` : "none";
        const useFallback = () => {
          wide.classList.add("is-fallback");
          wide.innerHTML =
            (info.poster ? `<div class="dx-wide-blur" style="background-image:${fallback}"></div><img class="dx-wide-thumb" alt="" src="${esc(info.poster)}">` : "") +
            `<div class="dx-wide-name">${esc(info.title)}</div>`;
        };
        if (isImdb(info.id)) {
          const target = wide;
          preload(art.backgroundMedium(info.id)).then((ok) => {
            if (target !== wide || !target.isConnected) return;
            if (!ok) { useFallback(); return; }
            target.style.backgroundImage = `url('${art.backgroundMedium(info.id)}')`;
            target.innerHTML = `<img class="dx-wide-logo" alt="" src="${art.logo(info.id)}">`;
            const logo = target.firstElementChild;
            logo.addEventListener("error", () => {
              logo.replaceWith(Object.assign(document.createElement("div"), { className: "dx-wide-name", textContent: info.title }));
            }, { once: true });
          });
        } else {
          useFallback();
        }
        poster.prepend(wide);
      }
    } else if (wide) {
      wide.remove();
    }

    // IMDb rating badge (posters only)
    let badge = poster.querySelector(":scope > .dx-badge");
    if (!settings.ratings || wantWide || !isImdb(info.id)) {
      if (badge) badge.remove();
      return;
    }
    if (badge && badge.dataset.key === key) return;
    if (badge) badge.remove();
    getMeta(info.type, info.id).then((meta) => {
      const rating = meta && parseFloat(meta.imdbRating);
      const current = cardInfo(card);
      if (!rating || !current || `${current.type}:${current.id}` !== key) return;
      if (poster.querySelector(":scope > .dx-badge")) return;
      const b = document.createElement("div");
      b.className = "dx-badge";
      b.dataset.key = key;
      b.innerHTML = `<i>IMDb</i>${rating.toFixed(1)}`;
      poster.append(b);
    });
  }

  function syncCards() {
    for (const card of allCards()) {
      const info = cardInfo(card);
      const key = info ? `${info.type}:${info.id}` : "";
      if (card.dataset.dxKey === key && card.dataset.dxWide === String(isWideRow(card)) && card.dataset.dxRatings === String(settings.ratings)) continue;
      card.dataset.dxKey = key;
      card.dataset.dxWide = String(isWideRow(card));
      card.dataset.dxRatings = String(settings.ratings);
      io.unobserve(card);
      io.observe(card);
    }
  }

  // ---------------------------------------------------------------------------
  // Hover preview card
  // ---------------------------------------------------------------------------

  const preview = {
    el: null,
    card: null,
    openTimer: null,
    closeTimer: null,
    token: 0,
    library: { ids: new Set(), at: 0 },

    eligible(card) {
      if (!settings.previews) return false;
      if (!card.closest('[class*="board-content-"]:not([class*="board-content-container"]), [class*="search-content"], [class*="library-content"]')) return false;
      return !!cardInfo(card);
    },

    onOver(e) {
      const card = e.target.closest && e.target.closest('[class*="meta-item-container"]');
      if (!card) return;
      if (card === this.card) {
        clearTimeout(this.closeTimer);
        return;
      }
      if (!this.eligible(card)) return;
      clearTimeout(this.openTimer);
      const warm = this.el && this.el.classList.contains("is-open");
      this.openTimer = setTimeout(() => {
        if (card.isConnected && card.matches(":hover")) this.open(card);
      }, warm ? 160 : 600);
    },

    onOut(e) {
      const card = e.target.closest && e.target.closest('[class*="meta-item-container"]');
      if (card && !card.contains(e.relatedTarget)) clearTimeout(this.openTimer);
    },

    ensureEl() {
      if (this.el && this.el.isConnected) return this.el;
      const el = document.createElement("div");
      el.className = "dx-preview";
      el.addEventListener("mouseleave", () => this.scheduleClose());
      el.addEventListener("mouseenter", () => clearTimeout(this.closeTimer));
      el.addEventListener("click", (e) => {
        const list = e.target.closest("[data-list]");
        if (list) {
          this.toggleList(list);
          return;
        }
        const go = e.target.closest("[data-href]");
        if (go) {
          this.close(true);
          location.hash = go.dataset.href;
        }
      });
      document.body.append(el);
      this.el = el;
      return el;
    },

    async refreshLibrary() {
      if (Date.now() - this.library.at < 15000 || !window.core || !window.core.getState) return;
      this.library.at = Date.now();
      try {
        const state = await window.core.getState("library");
        this.library.ids = new Set((state.catalog || []).map((i) => i._id || i.id));
      } catch (_) { /* library not available — the button still works */ }
    },

    toggleList(button) {
      if (!window.core || !window.core.dispatch) return;
      const { id, type, name, poster } = button.dataset;
      const inList = this.library.ids.has(id);
      try {
        window.core.dispatch({
          action: "Ctx",
          args: inList
            ? { action: "RemoveFromLibrary", args: id }
            : { action: "AddToLibrary", args: { id, type, name, poster: poster || null, posterShape: "poster" } },
        });
      } catch (err) {
        log("library update failed", err);
        return;
      }
      if (inList) this.library.ids.delete(id);
      else this.library.ids.add(id);
      this.paintList(button);
      button.classList.remove("is-pop");
      void button.offsetWidth;
      button.classList.add("is-pop");
    },

    paintList(button) {
      const on = this.library.ids.has(button.dataset.id);
      button.innerHTML = on ? ICONS.check : ICONS.plus;
      button.setAttribute("aria-label", on ? "Remove from My List" : "Add to My List");
      button.dataset.tip = on ? "Remove from My List" : "Add to My List";
    },

    render(info, meta) {
      const name = meta.name || info.title;
      const href = info.href.replace(/^#/, "");
      const playHref = info.type === "movie" ? `/detail/movie/${info.id}/${info.id}` : href;
      const media = isImdb(info.id)
        ? `url('${art.backgroundMedium(info.id)}'), url('${info.poster}')`
        : `url('${info.poster}')`;
      const rating = parseFloat(meta.imdbRating);
      const length = info.type === "series"
        ? (meta.seasons ? `${meta.seasons} Season${meta.seasons > 1 ? "s" : ""}` : "")
        : formatRuntime(meta.runtime);
      const facts = [
        rating ? `<span class="dx-match">${rating.toFixed(1)} IMDb</span>` : "",
        meta.releaseInfo ? `<span>${esc(String(meta.releaseInfo).replace(/–$/, "–now"))}</span>` : "",
        length ? `<span>${esc(length)}</span>` : "",
        `<span class="dx-hd">HD</span>`,
      ].join("");
      const genres = (meta.genres || []).slice(0, 3);
      return `
        <div class="dx-preview-media" data-href="${esc(href)}" style="background-image:${media}">
          ${isImdb(info.id) ? `<img alt="" src="${art.logo(info.id)}">` : ""}
          <div class="dx-preview-name">${esc(name)}</div>
        </div>
        <div class="dx-preview-body">
          <div class="dx-preview-actions">
            <button class="dx-round is-primary" data-href="${esc(playHref)}" aria-label="Play" data-tip="Play">${ICONS.playSmall}</button>
            ${isImdb(info.id) ? `<button class="dx-round" data-list data-id="${esc(info.id)}" data-type="${esc(info.type)}" data-name="${esc(name)}" data-poster="${esc(info.poster)}"></button>` : ""}
            <button class="dx-round is-end" data-href="${esc(href)}" aria-label="More info" data-tip="Episodes &amp; info">${ICONS.chevronDown}</button>
          </div>
          <div class="dx-preview-facts">${facts}</div>
          ${genres.length ? `<div class="dx-preview-genres">${genres.map((g) => `<span>${esc(g)}</span>`).join("")}</div>` : ""}
        </div>`;
    },

    async open(card) {
      const info = cardInfo(card);
      if (!info) return;
      const token = ++this.token;
      this.card = card;
      const el = this.ensureEl();
      this.refreshLibrary();

      // Don't keep the user waiting on a slow network: show what we have after 900ms
      const metaPromise = getMeta(info.type, info.id);
      const meta = (await Promise.race([metaPromise, new Promise((r) => setTimeout(() => r(undefined), 900))])) || {};
      if (token !== this.token || !card.isConnected || !card.matches(":hover")) return;

      el.innerHTML = this.render(info, meta);
      this.wire(el);
      if (!meta.name) {
        metaPromise.then((late) => {
          if (late && token === this.token && this.el.classList.contains("is-open")) {
            el.innerHTML = this.render(info, late);
            this.wire(el);
          }
        });
      }

      // Final geometry: wider than the card, centred on it, always fully on screen
      const rect = (card.querySelector('[class*="poster-container"]') || card).getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // Wide enough that its height covers a tall poster (Netflix tiles are landscape, ours are 2:3)
      const width = Math.round(Math.min(Math.max(rect.width * 1.72, 19 * rem), 30 * rem));
      el.classList.remove("is-open", "is-closing");
      el.style.transition = "none";
      el.style.width = width + "px";
      el.style.minHeight = Math.min(Math.ceil(rect.height), window.innerHeight - 24) + "px";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.transform = "none";
      el.style.visibility = "hidden";
      const height = el.offsetHeight;
      const margin = 12;
      const navBottom = 4.25 * rem + 8;
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
      let top = rect.top + rect.height / 2 - height / 2;
      top = Math.max(navBottom, Math.min(top, window.innerHeight - height - margin));
      el.style.left = Math.round(left) + "px";
      el.style.top = Math.round(top) + "px";

      // Start exactly over the card, then grow into place
      const scale = rect.width / width;
      const startX = rect.left - left;
      const startY = rect.top + rect.height / 2 - (height * scale) / 2 - top;
      el.style.transformOrigin = "0 0";
      el.style.transform = `translate(${startX}px, ${startY}px) scale(${scale})`;
      el.style.visibility = "";
      void el.offsetWidth;
      el.style.transition = "";
      requestAnimationFrame(() => {
        if (token !== this.token) return;
        el.classList.add("is-open");
        el.style.transform = "none";
      });

      clearTimeout(this.closeTimer);
      if (!this._leave) {
        this._leave = (ev) => {
          if (this.el && this.el.contains(ev.relatedTarget)) return;
          this.scheduleClose();
        };
      }
      card.addEventListener("mouseleave", this._leave);
    },

    wire(el) {
      el.querySelector(".dx-preview-media img")?.addEventListener("load", (ev) => {
        ev.target.closest(".dx-preview-media")?.classList.add("has-logo");
      }, { once: true });
      el.querySelector(".dx-preview-media img")?.addEventListener("error", (ev) => ev.target.remove(), { once: true });
      const list = el.querySelector("[data-list]");
      if (list) this.paintList(list);
    },

    scheduleClose() {
      clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => {
        if (this.el && this.el.matches(":hover")) return;
        this.close();
      }, 120);
    },

    close(immediate) {
      clearTimeout(this.openTimer);
      clearTimeout(this.closeTimer);
      this.token++;
      if (this.card && this._leave) this.card.removeEventListener("mouseleave", this._leave);
      this.card = null;
      if (!this.el || !this.el.classList.contains("is-open")) return;
      const el = this.el;
      el.classList.remove("is-open");
      if (immediate) {
        el.style.transition = "none";
        el.style.visibility = "hidden";
        el.classList.remove("is-closing");
        return;
      }
      el.classList.add("is-closing");
      setTimeout(() => el.classList.remove("is-closing"), 200);
    },
  };

  // ---------------------------------------------------------------------------
  // Player: ±10s, centred title, play/pause feedback
  // ---------------------------------------------------------------------------

  const player = {
    video: null,
    flashTimer: null,

    root() {
      return document.querySelector('[class*="player-container"]');
    },

    ensure() {
      if (!settings.playerExtras || currentRoute() !== "player") {
        this.detach();
        return;
      }
      const root = this.root();
      if (!root) return;
      const row = root.querySelector('[class*="control-bar-buttons-container"]');
      if (row && !row.querySelector(":scope > .dx-seek-back")) {
        row.append(this.seekButton(-1), this.seekButton(1));
      }

      const source = root.querySelector('[class*="player-title"]:not([class*="container"])');
      const text = (source && source.textContent.trim()) || "";
      if (row && text) {
        let title = row.querySelector(":scope > .dx-player-title");
        if (!title) {
          title = document.createElement("div");
          title.className = "dx-player-title";
          row.append(title);
        }
        if (title.dataset.text !== text) {
          title.dataset.text = text;
          const cut = text.indexOf(" - ");
          const main = cut > 0 ? text.slice(0, cut) : text;
          const rest = cut > 0 ? text.slice(cut + 3) : "";
          title.innerHTML = `<b>${esc(main)}</b>${rest ? `<span>${esc(rest)}</span>` : ""}`;
        }
      }

      if (!root.querySelector(":scope > .dx-player-flash")) {
        const flash = document.createElement("div");
        flash.className = "dx-player-flash";
        root.append(flash);
      }

      const video = root.querySelector("video");
      if (video !== this.video) {
        this.detach();
        if (video) {
          this.video = video;
          video.addEventListener("play", this.onPlay);
          video.addEventListener("pause", this.onPause);
        }
      }
    },

    seekButton(dir) {
      const b = document.createElement("div");
      b.className = `dx-seek ${dir < 0 ? "dx-seek-back" : "dx-seek-fwd"}`;
      b.title = dir < 0 ? "Back 10 seconds" : "Forward 10 seconds";
      b.setAttribute("role", "button");
      b.innerHTML = dir < 0 ? ICONS.rewind10 : ICONS.forward10;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const code = dir < 0 ? "ArrowLeft" : "ArrowRight";
        document.dispatchEvent(new KeyboardEvent("keydown", { key: code, code, bubbles: true }));
        document.dispatchEvent(new KeyboardEvent("keyup", { key: code, code, bubbles: true }));
        this.flash(dir < 0 ? ICONS.rewind10 : ICONS.forward10);
      });
      return b;
    },

    flash(icon) {
      const el = this.root()?.querySelector(":scope > .dx-player-flash");
      if (!el) return;
      el.innerHTML = icon;
      el.classList.remove("is-on");
      void el.offsetWidth;
      el.classList.add("is-on");
    },

    onPlay: () => {
      if (player.video && player.video.currentTime > 0.5) player.flash(ICONS.play);
    },

    onPause: () => {
      if (player.video && !player.video.ended && !player.video.seeking) player.flash(ICONS.pause);
    },

    detach() {
      if (this.video) {
        this.video.removeEventListener("play", this.onPlay);
        this.video.removeEventListener("pause", this.onPause);
      }
      this.video = null;
    },
  };

  // ---------------------------------------------------------------------------
  // Splash + window title
  // ---------------------------------------------------------------------------

  // Intro: the wordmark lands, then the camera dives into it and it bursts into ribbons of light
  function splash() {
    let shown = false;
    try { shown = sessionStorage.getItem("dxbi.splash") === "1"; sessionStorage.setItem("dxbi.splash", "1"); } catch (_) { /* ignore */ }
    if (shown || !settings.splash) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const accent = ACCENTS[settings.accent] || ACCENTS.red;
    const palette = [accent, accent, accent, "#ff1f3d", "#9d0012", "#c4001d", "#ff4d6d", "#e0218a", "#7a0a3d", accent, "#ffd166", "#ffffff"];
    // Deterministic hash so every launch looks the same
    const rnd = (n) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const rays = [];
    const count = 52;
    for (let i = 0; i < count; i++) {
      const base = (i / (count - 1)) * 2 - 1;
      const spread = Math.max(-1, Math.min(1, base + (rnd(i + 1) - 0.5) * 0.08));
      const pick = rnd(i + 101);
      const colour = palette[Math.floor(pick * palette.length)];
      const thin = colour === "#ffffff" || colour === "#ffd166";
      const width = thin ? (0.08 + rnd(i + 7) * 0.12).toFixed(2) : (0.18 + rnd(i + 7) * 1.1).toFixed(2);
      const delay = (1.28 + (1 - Math.abs(spread)) * 0.12 + rnd(i + 31) * 0.14).toFixed(3);
      const to = (spread * (60 + rnd(i + 53) * 70)).toFixed(1);
      const from = (spread * 2.2).toFixed(2);
      const alpha = (0.5 + rnd(i + 77) * 0.5).toFixed(2);
      rays.push(`<i class="dx-ray" style="--w:${width}vw;--c:${colour};--d:${delay}s;--to:${to}vw;--from:${from}vw;--a:${alpha}"></i>`);
    }

    const el = document.createElement("div");
    el.className = "dx-splash";
    el.innerHTML = `
      <div class="dx-splash-rays">${rays.join("")}</div>
      <div class="dx-splash-mark" aria-label="dx.bi"><span>D</span><span>X</span><span>.</span><span>B</span><span>I</span></div>
      <div class="dx-splash-flash"></div>`;
    document.body.append(el);
    if (settings.introSound) playIntroSound();

    const started = Date.now();
    const MIN = 3300;
    const MAX = 7000;
    const finish = () => {
      clearInterval(check);
      el.classList.add("is-done");
      setTimeout(() => el.remove(), 800);
    };
    const check = setInterval(() => {
      const elapsed = Date.now() - started;
      const ready = document.querySelector('[class*="meta-item-container"], [class*="metadetails-container"], [class*="player-container"], [class*="settings-content"]');
      if ((ready && elapsed >= MIN) || elapsed >= MAX) finish();
    }, 100);
  }

  // A soft two-hit "thud" made on the fly — no audio files involved
  function playIntroSound() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.55;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      master.connect(filter).connect(ctx.destination);
      const hit = (at, freq, length, level) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * 1.6, ctx.currentTime + at);
        osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + at + 0.08);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        gain.gain.exponentialRampToValueAtTime(level, ctx.currentTime + at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + length);
        osc.connect(gain).connect(master);
        osc.start(ctx.currentTime + at);
        osc.stop(ctx.currentTime + at + length + 0.05);
      };
      hit(0.25, 82, 0.5, 0.9);
      hit(0.62, 110, 1.6, 1);
      hit(0.62, 165, 1.2, 0.35);
      setTimeout(() => ctx.close(), 3000);
    } catch (_) { /* sound is optional */ }
  }

  function brandTitle() {
    // The player keeps Stremio's own title: other plugins read it to label the stream
    if (currentRoute() === "player") return;
    const current = document.title || "";
    if (current === "dx.bi" || current.endsWith(" · dx.bi")) return;
    const page = current.replace(/\s*[-–|]?\s*Stremio.*$/i, "").replace(/^web\.stremio\.com$/i, "").trim();
    document.title = page ? `${page} · dx.bi` : "dx.bi";
  }

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------

  let syncQueued = false;
  function scheduleSync() {
    if (syncQueued) return;
    syncQueued = true;
    setTimeout(() => {
      syncQueued = false;
      sync();
    }, 90);
  }

  function sync() {
    const steps = [updateRoute, brandTitle, () => player.ensure()];
    if (currentRoute() !== "player") {
      steps.push(() => hero.ensure(), () => carouselRows().forEach(enhanceRow), syncCards);
    }
    // One failing step must never stop the others
    for (const step of steps) {
      try { step(); } catch (err) { log("sync step failed", err); }
    }
  }

  const mo = new MutationObserver((records) => {
    for (const r of records) {
      // Ignore changes we made ourselves
      if (r.target.closest && r.target.closest(".dx-hero, .dx-preview, .dx-row-pages, .dx-wide-art, .dx-player-title, .dx-player-flash")) continue;
      scheduleSync();
      return;
    }
  });

  const onResize = () => {
    preview.close(true);
    carouselRows().forEach(updateArrows);
  };
  const onOver = (e) => preview.onOver(e);
  const onOut = (e) => preview.onOut(e);
  const onHash = () => { updateRoute(); scheduleSync(); };
  const onTitle = new MutationObserver(brandTitle);

  function start() {
    splash();
    loadSettings().finally(scheduleSync);
    mo.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
    const titleEl = document.querySelector("title");
    if (titleEl) onTitle.observe(titleEl, { childList: true, characterData: true, subtree: true });
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onResize);
    sync();
    log("ready");
  }

  window.__dxbi = {
    settings,
    sync,
    destroy() {
      mo.disconnect();
      io.disconnect();
      onTitle.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("resize", onResize);
      hero.remove();
      preview.close(true);
      preview.el?.remove();
      player.detach();
      document.querySelectorAll(".dx-arrow, .dx-row-pages, .dx-badge, .dx-wide-art, .dx-splash, .dx-seek, .dx-player-title, .dx-player-flash").forEach((n) => n.remove());
      document.querySelectorAll("[data-dx-key]").forEach((n) => { delete n.dataset.dxKey; });
    },
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
