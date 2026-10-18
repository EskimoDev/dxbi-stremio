<p align="center">
  <img src="screenshots/banner.jpg" alt="DX.BI" width="100%">
</p>

<p align="center">
  <b>A Netflix-style look for <a href="https://github.com/REVENGE977/stremio-enhanced">Stremio Enhanced</a>.</b><br>
  One theme + one plugin. Works with your existing addons. Nothing to configure.
</p>

<p align="center">
  <a href="https://github.com/notdxbi/dxbi-stremio/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/notdxbi/dxbi-stremio?label=release&color=e50914&style=flat-square"></a>
  <img alt="Windows · macOS · Linux" src="https://img.shields.io/badge/Windows%20·%20macOS%20·%20Linux-222?style=flat-square">
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-222?style=flat-square"></a>
</p>

<p align="center">
  <img src="screenshots/home.jpg" alt="DX.BI home screen" width="100%">
</p>

> [!NOTE]
> **About this project** — DX.BI is a personal fan project I made for my own use and decided to share. It was built with the help of [Claude Code](https://www.anthropic.com/claude-code), Anthropic's AI coding assistant. It isn't affiliated with Netflix, Stremio or Stremio Enhanced.

---

## Install

You need **[Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced/releases)** (v1.2 or newer).

**1. Run one command**

Windows — open **PowerShell** and paste:
```powershell
irm https://github.com/notdxbi/dxbi-stremio/releases/latest/download/install.ps1 | iex
```

macOS / Linux — open **Terminal** and paste:
```bash
curl -fsSL https://github.com/notdxbi/dxbi-stremio/releases/latest/download/install.sh | bash
```

**2. Restart Stremio Enhanced**

**3. Turn it on** — *Settings → Enhanced*: click **Apply** on the **dx.bi** theme, and switch the **dx.bi** plugin **on**.

That's it. Updates are offered automatically inside the app.

<details>
<summary><b>Prefer to install by hand?</b></summary>
<br>

1. Download [`dxbi.theme.css`](https://github.com/notdxbi/dxbi-stremio/releases/latest/download/dxbi.theme.css) and [`dxbi.plugin.js`](https://github.com/notdxbi/dxbi-stremio/releases/latest/download/dxbi.plugin.js).
2. In Stremio Enhanced: *Settings → Enhanced* → **Open Themes Folder** (put the `.css` there) and **Open Plugins Folder** (put the `.js` there).
3. Restart, apply the theme, enable the plugin.
</details>

---

## What you get

<p align="center">
  <img src="screenshots/intro.webp" alt="DX.BI intro" width="70%">
</p>

- **Cinematic intro** with its own sound — plays once at startup, skip with <kbd>Esc</kbd>
- **Rotating billboard** on Home with title art, rating, synopsis, **Play** and **More Info**
- **Netflix-style rows** — scroll sideways with arrows
- **Hover previews** — rest on a title for a card with **Play**, **My List**, rating and genres
- **IMDb ratings** on posters, using data from your own addons
- **Wide Continue Watching** cards with title art and progress
- **Redesigned player** — ±10 seconds, clean subtitle and speed menus
- **Subtle interface sounds** (adjustable or off)
- **Everything restyled** — Discover, Library, Search, Calendar, Addons, Settings
- **8 accent colours** and an on/off switch for every feature

<table>
  <tr>
    <td><img src="screenshots/preview.jpg" alt="Hover preview"></td>
    <td><img src="screenshots/detail.jpg" alt="Movie page"></td>
  </tr>
  <tr>
    <td align="center"><sub>Hover preview</sub></td>
    <td align="center"><sub>Movie page</sub></td>
  </tr>
  <tr>
    <td><img src="screenshots/series.jpg" alt="Series page"></td>
    <td><img src="screenshots/discover.jpg" alt="Discover"></td>
  </tr>
  <tr>
    <td align="center"><sub>Series page</sub></td>
    <td align="center"><sub>Discover</sub></td>
  </tr>
  <tr>
    <td><img src="screenshots/player.jpg" alt="Player"></td>
    <td><img src="screenshots/player-subs.jpg" alt="Subtitles menu"></td>
  </tr>
  <tr>
    <td align="center"><sub>Player</sub></td>
    <td align="center"><sub>Subtitles menu</sub></td>
  </tr>
</table>

---

## Settings

*Settings → Enhanced → dx.bi → ⚙*

<img src="screenshots/settings.jpg" alt="DX.BI settings" width="420" align="right">

- Accent colour
- Billboard on/off, content and speed
- Hover previews
- IMDb ratings on posters
- Wide Continue Watching
- Player extras
- Intro animation and intro sound
- Interface sounds and volume

Changes apply instantly.

<br clear="right">

---

## Works with

**Addons:** any — DX.BI uses whatever your addons provide (Cinemeta, TMDB, anime catalogs, streaming catalogs…).

**Plugins:** tested with TheIntroDB, IntroDB, Stremio Intro Skip, AniSkip, Stream Quality Picker, Stream Keyword Filter, Stream Finder, FilterStreams, ExpandStreamTitles, Enhanced Video Player, Context Menu Fix, Addon Manager, Picture in Picture, Collapsible Filters, Poster Size, Close Preview Panel, Discover Watched Filter, Random Pick, Library Stats, Library Folders and Slash to Search.

**Turn these off** (they do the same job and clash): Dynamic Hero, Horizontal Navigation, EnhancedCovers, Enhanced Title Bar, Lumen.

---

## FAQ

**It looks half-styled.** Make sure the theme is applied *and* the plugin is on, and that the plugins listed under *Turn these off* are disabled.

**How do I remove it?** Switch the plugin off and apply the *Default* theme. Nothing else is changed.

**Does it collect anything?** No. No tracking, accounts or keys. It only loads ratings/artwork from Cinemeta and MetaHub (which Stremio already uses) and fonts from Google Fonts.

**Something overlaps after a Stremio update?** Stremio changes its web UI now and then — [open an issue](https://github.com/notdxbi/dxbi-stremio/issues) with a screenshot.

---

<sub>Built on <a href="https://www.stremio.com/">Stremio</a> and <a href="https://github.com/REVENGE977/stremio-enhanced">Stremio Enhanced</a>. Fonts: <a href="https://github.com/dharmatype/Bebas-Neue">Bebas Neue</a> and <a href="https://rsms.me/inter/">Inter</a> (SIL OFL). Inspired by the Netflix interface; no Netflix logos, fonts, images or sounds are used — the intro and all sounds are original (see <a href="tools">tools</a>). Not affiliated with Netflix, Inc. or Stremio. <a href="CHANGELOG.md">Changelog</a> · <a href="LICENSE">MIT License</a>.</sub>
