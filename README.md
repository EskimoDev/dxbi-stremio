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
  <a href="https://github.com/notdxbi/dxbi-stremio/releases/download/v2.5.1/dxbi-promo.mp4"><b>▶ Watch the 50-second preview</b></a>
</p>

<p align="center">
  <img src="screenshots/home.jpg" alt="DX.BI home screen" width="100%">
</p>

> [!NOTE]
> **About this project** — DX.BI is a personal fan project I made for my own use and decided to share. It was built with the help of [Claude Code](https://www.anthropic.com/claude-code), Anthropic's AI coding assistant. It isn't affiliated with Netflix, Stremio or Stremio Enhanced.

---

## Read this first: it's a reskin, not a streaming service

> [!IMPORTANT]
> **DX.BI only changes how Stremio looks and feels.** It doesn't add any movies, shows or streams, and it doesn't make anything play on its own.
> Titles play exactly the way they already do in your Stremio — **if nothing plays in your Stremio today, nothing will play with DX.BI either.**

To actually watch things you need a working Stremio setup first:

1. **[Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced/releases)** installed and signed in to a Stremio account.
2. **Catalog addons** for what shows up on Home and Discover — *Cinemeta* is built in; others (TMDB, anime catalogs, streaming-service catalogs…) are optional.
3. **Stream addons** that provide the actual video sources. Many people link a **debrid service such as [Real-Debrid](https://real-debrid.com/)** to a stream addon for fast, reliable playback; free and official sources exist too.

Setting those up is outside this project — Stremio's community has plenty of guides. What you watch and where it comes from is your responsibility; please follow the laws where you live.

---

## Install

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
- **Ratings on posters** — IMDb from your own addons; anime from Kitsu or MyAnimeList catalogs gets its Kitsu or AniList score
- **Stream sorting & filters** — sort by quality, seeds or size; filter by quality, language, source, provider, ⚡ instant and HDR
- **Wide Continue Watching** cards with title art and progress
- **Redesigned player** — seek-bar thumbnail previews, time remaining, ±10 seconds, Next Episode, **Open in mpv / VLC**, clean subtitle and speed menus
- **Skip Intro & Next Episode** — Netflix-style buttons from community skip databases (movies, series and anime)
- **Addon order & backup** — reorder, back up and restore your addons
- **Watch party** — watch in sync with friends: shared play, pause and seeking, chat and reactions, end-to-end encrypted
- **Picture enhancement (upscaler)** — real-time GPU upscaling: **[Anime4K](https://github.com/bloc97/Anime4K)** restore + upscale networks for anime, contrast-adaptive sharpening for movies, HDR handled correctly
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
    <td align="center"><sub>Player with seek preview <i>(Big Buck Bunny © Blender Foundation, CC BY 3.0)</i></sub></td>
    <td align="center"><sub>Subtitles menu</sub></td>
  </tr>
</table>

### Watch party

<img src="screenshots/party.jpg" alt="Watch party" width="300" align="right">

Watch together with friends, perfectly in sync:

1. Click the **people button** (top right, or in the player) → enter your name → **Start a party**.
2. **Copy** the code and send it to your friends. They paste it under **Join**.
3. Play anything. Everyone's Stremio opens the same title on its own, picking **the same release from their own addons and debrid account**, and jumps to your spot.

- **Anyone can pause, play or skip** and it happens for everyone.
- **Waits for buffering**: if someone's stream is loading, everyone pauses until they catch up.
- **Follows the host** to the next episode automatically.
- **Chat and reactions** (😂 😮 😱 ❤️ 🔥 👏) in the player.
- Small drift is smoothed out invisibly with tiny speed changes instead of jumps.

**Private by design:** stream links are never shared (debrid links contain your API key). Friends only receive the title, the release's torrent hash and the playback position, end-to-end encrypted with the party code (AES-256-GCM) and passed through public relays that only ever see scrambled bytes. No account and no server to run.

**What friends need:** [Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced) with the dx.bi plugin (desktop: Windows, macOS or Linux), plus their own stream addon (any debrid works, or plain torrents). If their addons don't have the exact release, the closest match (same quality, cached first) is used.

<br clear="right">

### Picture enhancement (upscaler)

Make anime — especially older or lower-resolution episodes — look cleaner and sharper, in real time on your GPU:

- **Anime4K** runs the actual [Anime4K](https://github.com/bloc97/Anime4K) v4 *Restore* and *Upscale* neural-network shaders by bloc97 (the same ones anime upscaler websites use), inside the player.
- **Sharpen** gives live action a crisp, high-quality upscale with AMD-style contrast-adaptive sharpening.
- **Auto** uses Anime4K for anime and Sharpen for everything else.
- HDR films keep their correct colours (tone-mapped like Stremio's own picture), subtitles stay on top, and if your GPU ever can't keep up it steps down automatically.

Switch it in the dx.bi settings or with the **✨** button in the player.

### Stream sorting & filters

<img src="screenshots/streams.jpg" alt="Stream sorting and filters" width="380" align="right">

Above every list of streams:

- **Sort** — addon order, best quality, most seeds, largest or smallest
- **Quality** — 4K, 1080p, 720p, SD
- **Language** — read from flags and release names
- **Source** — Remux, BluRay, WEB, HDTV
- **Provider** — when you have more than one stream addon
- **⚡ Instant** — cached debrid links only
- **HDR / DV**

It reads what your addons already show, so it works with any stream addon. Your choices are remembered.

<br clear="right">

---

## Settings

*Settings → Enhanced → dx.bi → ⚙*

<img src="screenshots/settings.jpg" alt="DX.BI settings" width="380" align="right">

- Accent colour
- Billboard on/off, content and speed
- Hover previews
- Ratings on posters (IMDb, Kitsu, AniList)
- Wide Continue Watching
- Player extras
- Picture enhancement — Off / Auto / Sharpen / Anime4K (quality or fast)
- Skip intro/recap/credits buttons and auto-skip
- Subtitle style and font
- Picture-in-picture button
- Addon order & backup
- Watch party — on/off, follow the host, chat & activity in the player, sounds
- Seek bar previews
- Time remaining
- Open in mpv / VLC button
- Stream sorting & filters
- Intro animation and intro sound
- Interface sounds and volume

Changes apply instantly.

<br clear="right">

---

## Built in — no extra plugins needed

DX.BI is one plugin. Everything below used to need a separate plugin and is now part of DX.BI, written from scratch so nothing clashes:

| Feature | Where |
|---|---|
| **Skip Intro / Recap / Credits** and **Next Episode** buttons, optional auto-skip | Player — times from [TheIntroDB](https://theintrodb.org) (movies & series) and [AniSkip](https://aniskip.com) (anime) |
| **Addon order & backup** — drag to reorder, back up, restore, undo | Addons page → *Order & backup* |
| **Subtitle styles** — Netflix, bold outline, boxed, classic yellow, soft; 5 fonts | Settings |
| **Picture-in-picture** | Player |
| **Open in mpv / VLC** | Player |
| **Stream sorting & filters** | Every streams list |

**Turn these off** — DX.BI does the same job and they'd show twice or clash: TheIntroDB, IntroDB, Stremio Intro Skip, AniSkip, Stremio Addon Manager, Addon Organizer, Enhanced Video Player, Picture in Picture, Context Menu Fix, Dynamic Hero, Horizontal Navigation, EnhancedCovers and Enhanced Title Bar, and [Lumen](https://github.com/echodzns04/echo-stremio-plugins).

Plugins that do something DX.BI doesn't (for example library folders or random pick) work alongside it.

**Addons:** any — DX.BI uses whatever your addons provide (Cinemeta, TMDB, anime catalogs, streaming catalogs…).

---

## FAQ

**I installed it but nothing plays.** DX.BI is only a reskin — see [Read this first](#read-this-first-its-a-reskin-not-a-streaming-service). Playback comes from your stream addons.

**It looks half-styled.** Make sure the theme is applied *and* the plugin is on, and that the plugins under *Turn these off* are disabled.

**How do I remove it?** Switch the plugin off and apply the *Default* theme. Nothing else is changed.

**Does it collect anything?** No. No tracking or accounts. It loads ratings and artwork from Cinemeta, MetaHub, Kitsu and AniList, skip times from TheIntroDB and AniSkip, and fonts from Google Fonts — it only asks *about the title you're looking at*, nothing about you. *Order & backup* talks to Stremio's own servers, only when you press Save or Restore. Watch parties only connect while you're in one, and everything they send is end-to-end encrypted.

**Does it work on my phone or TV?** dx.bi runs inside [Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced), which is a desktop app for Windows, macOS and Linux. The official Stremio apps for Android, iOS and TVs can't load plugins or themes, so dx.bi (and watch parties) are desktop-only.

**A friend can't connect to a party.** Parties use several public relays, including one on the normal web port 443, so they work on most networks. Check that both of you typed the same code and are on dx.bi 2.6.0 or newer.

**Something overlaps after a Stremio update?** Stremio changes its web UI now and then — [open an issue](https://github.com/notdxbi/dxbi-stremio/issues) with a screenshot.

---

## Credits

- **[Stremio](https://www.stremio.com/)** ([stremio-web](https://github.com/Stremio/stremio-web)) — the app underneath everything.
- **[Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced)** by REVENGE977 — makes themes and plugins possible.
- **[Modern Glass](https://github.com/Fxy6969/Stremio-Glass-Theme)** by Fxy (with MrBlu03) — the theme I started from before building DX.BI, and and the home of plugins whose ideas (subtitle presets, picture-in-picture, menu fixes) DX.BI now covers with its own code.
- The plugin authors whose work showed what Stremio users want — TheIntroDB, Sul-404 (Addon Manager), Fxy and MrBlu03.
- **[Anime4K](https://github.com/bloc97/Anime4K)** by bloc97 — the restore/upscale shaders used by Picture enhancement, included unmodified under the MIT licence ([LICENSE-ANIME4K](LICENSE-ANIME4K)).
- **Cinemeta** and **MetaHub** for metadata and artwork; **[Kitsu](https://kitsu.app)** and **[AniList](https://anilist.co)** for anime scores; **[TheIntroDB](https://theintrodb.org)** and **[AniSkip](https://aniskip.com)** for skip times.
- Fonts: [Bebas Neue](https://github.com/dharmatype/Bebas-Neue) and [Inter](https://rsms.me/inter/) (SIL Open Font License).
- Built with the help of [Claude Code](https://www.anthropic.com/claude-code).

<sub>Inspired by the Netflix interface; no Netflix logos, fonts, images or sounds are used — the intro and all sounds are original (see <a href="tools">tools</a>). Not affiliated with Netflix, Inc., Stremio, Stremio Enhanced or any plugin author. <a href="CHANGELOG.md">Changelog</a> · <a href="LICENSE">MIT License</a>.</sub>
