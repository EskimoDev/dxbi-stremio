<p align="center">
  <img src="screenshots/banner.jpg" alt="DX.BI" width="100%">
</p>

<p align="center">
  <b>A Netflix-style look for <a href="https://github.com/REVENGE977/stremio-enhanced">Stremio Enhanced</a>.</b><br>
  One plugin, theme included. Works with your existing addons. Nothing to configure.
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
> DX.BI is a personal fan project I made for my own use and decided to share. It was built with the help of [Claude Code](https://www.anthropic.com/claude-code), Anthropic's AI coding assistant. It isn't affiliated with Netflix, Stremio or Stremio Enhanced.

<br>

## Read this first

> [!IMPORTANT]
> DX.BI only changes how Stremio looks and feels. It doesn't add any movies, shows or streams, and it doesn't make anything play on its own.
>
> Titles play exactly the way they already do in your Stremio. If nothing plays in your Stremio today, nothing will play with DX.BI either.

To actually watch things you need a working Stremio setup first:

1. [Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced/releases), installed and signed in to a Stremio account. DX.BI is made and tested on the latest full release, currently 1.2.0. Preview and test builds (such as 1.3.0-preview) aren't supported and can break the player.

2. Catalog addons, for what shows up on Home and Discover. Cinemeta is built in; others (TMDB, anime catalogs, streaming-service catalogs) are optional. On a fresh account DX.BI offers to add the free ones its own Home uses.

3. Stream addons, which provide the actual video. Many people link a debrid service such as [Real-Debrid](https://real-debrid.com/) to a stream addon; free and official sources exist too.

Setting those up is outside this project, and Stremio's community has plenty of guides. What you watch and where it comes from is your responsibility, so please follow the laws where you live.

<br>

## Install

### 1. Run one command

On Windows, open PowerShell and paste:

```powershell
irm https://github.com/notdxbi/dxbi-stremio/releases/latest/download/install.ps1 | iex
```

On macOS or Linux, open Terminal and paste:

```bash
curl -fsSL https://github.com/notdxbi/dxbi-stremio/releases/latest/download/install.sh | bash
```

### 2. Restart Stremio Enhanced

### 3. Turn it on

Go to *Settings → Enhanced* and switch the dx.bi plugin on. The theme is built into the plugin, so that's all you need.

Updates are offered automatically inside the app.

<details>
<summary>Prefer to install by hand?</summary>
<br>

1. Download [`dxbi.plugin.js`](https://github.com/notdxbi/dxbi-stremio/releases/latest/download/dxbi.plugin.js) (and, if you like, [`dxbi.theme.css`](https://github.com/notdxbi/dxbi-stremio/releases/latest/download/dxbi.theme.css)).
2. In Stremio Enhanced, go to *Settings → Enhanced*. Put the `.js` file in the folder opened by *Open Plugins Folder*, and the `.css` file in *Open Themes Folder*.
3. Restart and switch the plugin on.

The theme file is optional, because the plugin carries the same look. Applying any other theme switches the built-in one off.
</details>

<br>

## What you get

<p align="center">
  <img src="screenshots/intro.webp" alt="DX.BI intro" width="70%">
</p>

### Browsing

<p align="center">
  <img src="screenshots/hover.webp" alt="Hover preview with trailer" width="100%">
</p>

- **Cinematic intro** — plays once at startup with its own sound. Press <kbd>Esc</kbd> to skip.

- **Rotating billboard** — a big banner on Home with title art, rating, synopsis, Play and More Info.

- **Netflix-style rows** — scroll sideways with arrows.

- **Hover previews** — rest on a title and its card unfolds with a soft glow while the row makes room, showing its rating, genres and trailer. One click takes the trailer full screen.

- **Ratings on posters** — IMDb scores from your own addons. Anime gets its Kitsu or AniList score.

- **Wide Continue Watching** — landscape cards with title art and progress.

- **Watched titles** — optionally dim or hide what you've already seen in Discover, Search and Home.

### The player

- **Redesigned controls** — seek-bar thumbnails, time remaining, ±10 seconds, Next Episode, and clean subtitle and speed menus.

- **Picture & sound panel** — the sliders button in the player:
  - remove black bars that are part of the video (great on ultrawide screens), or zoom in
  - Dialogue boost and Night mode, for quiet speech and loud explosions
  - sync subtitles by clicking the line you just heard
  - a second subtitle language on top, handy for learning a language

- **Picture enhancement** — real-time upscaling on your graphics card. [Anime4K](https://github.com/bloc97/Anime4K) for anime, sharpening for movies.

- **Skip Intro and Next Episode** — buttons from community skip databases, for movies, series and anime.

- **Up next** — a countdown to the next episode when the credits roll. The next episode is loaded in advance so it starts sooner.

- **Open in mpv or VLC** — for files that won't play or stutter here.

- **Picture-in-picture** — keep watching in a small window.

- **Remembers volume and speed** — and keys <kbd>0</kbd>–<kbd>9</kbd> jump through a video. Press <kbd>?</kbd> for every shortcut.

### Series and anime

- **Anime filler guide** — filler episodes marked in long anime, with an option to skip them.

- **New episode badges** — on shows in your library.

- **Airing this week** — a Home row with countdowns to upcoming episodes.

### Your library and addons

- **Library sorting** — newest, oldest or top rated, plus a genre filter.

- **Stream sorting and filters** — by quality, seeds, size, language, source, provider, instant (cached) and HDR.

- **Addon order and backup** — reorder, back up and restore your addons.

### Together and personal

- **Watch party** — watch in sync with friends, with chat and reactions. End-to-end encrypted.

- **Who's watching?** — separate viewers, each with their own stats and volume.

- **Your stats** — hours watched, streaks, top titles and genres, in your profile menu.

- **Look and feel** — every page restyled, 8 accent colours, soft interface sounds, and an on/off switch for every feature.

<br>

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
    <td><img src="screenshots/dual-subs.jpg" alt="Two subtitle languages"></td>
  </tr>
  <tr>
    <td align="center"><sub>Player with seek-bar preview</sub></td>
    <td align="center"><sub>Two subtitle languages at once</sub></td>
  </tr>
</table>

<p align="center"><sub>Player shots use <a href="https://durian.blender.org/">Sintel</a> (© Blender Foundation, CC BY 3.0).</sub></p>

<br>

## A closer look

### Watch party

<img src="screenshots/party.jpg" alt="Watch party" width="300" align="right">

1. Click the people button (top right, or in the player), enter your name and choose *Start a party*.

2. Copy the code and send it to your friends. They paste it under *Join*.

3. Play anything. Each friend's Stremio opens the same title, picks the same release from their own addons, and jumps to your spot.

Once you're watching:

- anyone can pause, play or skip, and it happens for everyone
- if someone is buffering, everyone waits for them
- the party follows the host to the next episode
- chat and reactions appear in the player

Stream links are never shared, because debrid links contain your API key. Friends only receive the title, the release's torrent hash and the playback position. Everything is end-to-end encrypted with the party code and passed through public relays that only see scrambled data. No account and no server to run.

Each friend needs Stremio Enhanced on a computer with the dx.bi plugin, plus their own stream addon. If they don't have the exact release, the closest match is used.

<br clear="right">

### Picture & sound panel

Click the sliders button in the player.

<p align="center">
  <img src="screenshots/panel.jpg" alt="Picture & sound panel" width="100%">
</p>

- **Picture** — *Remove black bars* measures the picture and crops off bars that are part of the video file, such as a widescreen film inside a 16:9 file. You can also zoom to 110%, 125% or 133%. Stremio's own Fit / Crop / Stretch button still works on top.

- **Sound** — *Dialogue boost* lifts voices and the centre speaker. *Night mode* also evens out loud and quiet scenes, so you can keep the volume down. Both work with 5.1 and stereo.

- **Subtitle sync** — shows the lines around the current moment. Click the line you just heard and the subtitles move to match. Fine-tune with ±0.25 s.

- **Second subtitles** — choose another language to show at the top of the picture.

<p align="center">
  <img src="screenshots/black-bars.webp" alt="Removing black bars on an ultrawide screen" width="100%"><br>
  <sub>Remove black bars, on a 21:9 ultrawide screen</sub>
</p>

<p align="center">
  <img src="screenshots/subtitle-sync.webp" alt="Syncing subtitles with one click" width="100%"><br>
  <sub>Subtitles 4 seconds late, fixed with one click</sub>
</p>

### Picture enhancement

Makes anime, especially older or lower-resolution episodes, look cleaner and sharper.

- *Anime4K* runs the real [Anime4K](https://github.com/bloc97/Anime4K) v4 restore and upscale shaders by bloc97.
- *Sharpen* gives live action a crisp upscale.
- *Auto* uses Anime4K for anime and Sharpen for everything else.

HDR keeps its correct colours, subtitles stay on top, and it steps down by itself if your graphics card can't keep up. Switch it in the settings or with the ✨ button in the player.

### Stream sorting and filters

<img src="screenshots/streams.jpg" alt="Stream sorting and filters" width="380" align="right">

A bar above every list of streams:

- sort by addon order, quality, seeds or size
- filter by quality (4K, 1080p, 720p, SD)
- by language, read from flags and release names
- by source (Remux, BluRay, WEB, HDTV)
- by provider, when you have more than one stream addon
- instant only (cached debrid links), and HDR / Dolby Vision

It reads what your addons already show, so it works with any stream addon. Your choices are remembered.

<br clear="right">

<br>

## Settings

Find them in *Settings → Enhanced → dx.bi → ⚙*. Changes apply instantly.

<img src="screenshots/settings.jpg" alt="DX.BI settings" width="380" align="right">

Look
- accent colour, built-in theme
- billboard: on/off, content and speed
- hover previews, trailers, ratings, wide Continue Watching
- only movie, series and anime rows on Home
- watched titles: show, dim or hide

Player
- player extras, seek-bar previews, time remaining
- picture enhancement and the Picture & sound panel
- skip buttons and auto-skip, up next countdown
- subtitle style and font, subtitles on HDR, whether subtitles start on
- convert videos this PC can't play
- picture-in-picture, Open in mpv / VLC
- get the next episode ready

Everything else
- library sorting, stream sorting, addon order and backup
- anime filler guide, new episode badges, airing row
- remember volume and speed, keyboard shortcuts
- watch stats, Who's watching?, watch party options
- intro animation and sound, interface sounds

<br clear="right">

<br>

## One plugin, nothing else needed

Everything is in the dx.bi plugin, theme included, written from scratch so nothing clashes.

These plugins do the same jobs, so turn them off or things will show twice:

> TheIntroDB, IntroDB, Stremio Intro Skip, AniSkip, Stremio Addon Manager, Addon Organizer, Enhanced Video Player, Picture in Picture, Context Menu Fix, Dynamic Hero, Horizontal Navigation, EnhancedCovers, Enhanced Title Bar, and [Lumen](https://github.com/echodzns04/echo-stremio-plugins).

Plugins that do something DX.BI doesn't (for example library folders or random pick) work alongside it. Any addons work: DX.BI uses whatever yours provide.

<br>

## FAQ

### I installed it but nothing plays

DX.BI is only a reskin (see [Read this first](#read-this-first)). Playback comes from your stream addons.

### It looks half-styled

Check that the plugin is on, that *dx.bi look built in* is on in its settings (or the dx.bi theme is applied), and that the plugins listed above are off.

### My Home has different rows from the screenshots

Home's rows come from the catalog addons on your account, not from DX.BI. On a fresh account DX.BI offers once to add the free catalogs its own Home uses: The Movie Database, Streaming Catalogs, Anime Catalogs and TMDB Collections. No accounts or keys needed. You can add or undo them any time from *Addons → Order & backup*. Stream addons are your own choice and are never added.

### "Video is not supported"

Stremio couldn't play that file, and DX.BI shows why underneath. Usually it's one of two things:

- Stremio's streaming server isn't running. Torrents and formats like MKV, HEVC and Dolby Vision need it. Restart Stremio Enhanced and accept its streaming-server setup; on Windows, *Stremio Service* is easiest. *Settings → Streaming* shows whether it's online.
- The format doesn't play on that computer (common on Windows 10). DX.BI has the streaming server convert these automatically. If it still fails, pick an x264 or WEB-DL release, or use *Open in mpv / VLC*.

### Windows: "Probe process exited with code: 3221225781"

Windows couldn't start the streaming server's video tool (ffprobe) because a file it needs is missing. To fix it, try these in order:

- Switch to *Stremio Service*, which brings its own working copy. Install it and choose it when Stremio Enhanced starts.
- Or close Stremio Enhanced and delete `ffmpeg.exe` and `ffprobe.exe` in `%APPDATA%\stremio-enhanced\streamingserver`. Fresh copies are downloaded on the next start.
- If you've installed ffmpeg yourself, Stremio Enhanced uses that copy first when it's on your PATH. Update it or remove it from the PATH.

### A green screen says "Torrent is being downloaded to debrid…"

That release isn't cached on your debrid service yet. It's a short clip from your stream addon, not a DX.BI error. Pick a release marked RD+ or ⚡ to watch straight away.

### Subtitles turn on by themselves

Not any more. *Subtitles when a video starts* is Off by default, like Netflix. Turn them on from the player's subtitles menu, or choose *On, in my Stremio subtitle language* in the settings.

### How do I remove it?

Switch the plugin off and apply the *Default* theme. Nothing else is changed.

### Does it collect anything?

No tracking and no accounts. It only asks public services about the titles you're looking at, never about you:

- ratings and artwork: Cinemeta, MetaHub, Kitsu, AniList
- skip times: TheIntroDB, AniSkip
- filler lists: animefillerlist.com
- trailers: YouTube (privacy-enhanced mode, only while a trailer plays)
- fonts: Google Fonts and jsDelivr

Watch stats and viewers stay on your computer. *Order & backup* talks to Stremio's own servers only when you press Save or Restore. Watch parties only connect while you're in one, and are end-to-end encrypted.

### A giant black arrow covers the video and every click goes back

That comes from a preview build of Stremio Enhanced. Install the latest full release (currently 1.2.0) from its [releases page](https://github.com/REVENGE977/stremio-enhanced/releases), skipping anything marked Pre-release. Since 2.10.6 DX.BI also keeps that arrow small on its own.

### Does it work on my phone or TV?

No. DX.BI runs inside Stremio Enhanced, which is a desktop app for Windows, macOS and Linux. The official Stremio apps for phones and TVs can't load plugins.

### A friend can't connect to a party

Check that you both typed the same code and are on dx.bi 2.6.0 or newer. Parties use several relays, including one on the normal web port, so they work on most networks.

### Something overlaps after a Stremio update

Stremio changes its interface now and then. [Open an issue](https://github.com/notdxbi/dxbi-stremio/issues) with a screenshot.

<br>

## Credits

- [Stremio](https://www.stremio.com/) ([stremio-web](https://github.com/Stremio/stremio-web)) — the app underneath everything.
- [Stremio Enhanced](https://github.com/REVENGE977/stremio-enhanced) by REVENGE977 — makes themes and plugins possible.
- The plugin authors whose work showed what Stremio users want — TheIntroDB, Sul-404 (Addon Manager), Fxy and MrBlu03.
- [Anime4K](https://github.com/bloc97/Anime4K) by bloc97 — the shaders behind Picture enhancement, included unmodified under the MIT licence ([LICENSE-ANIME4K](LICENSE-ANIME4K)).
- Cinemeta and MetaHub for metadata and artwork; [Kitsu](https://kitsu.app) and [AniList](https://anilist.co) for anime scores; [TheIntroDB](https://theintrodb.org) and [AniSkip](https://aniskip.com) for skip times; [animefillerlist.com](https://www.animefillerlist.com) for the filler guide.
- Fonts: [Bebas Neue](https://github.com/dharmatype/Bebas-Neue) and [Inter](https://rsms.me/inter/) (SIL Open Font License).
- Country flags: [Twemoji](https://github.com/jdecked/twemoji) graphics (CC-BY 4.0) via the [Twemoji Country Flags](https://github.com/talkjs/country-flag-emoji-polyfill) font by TalkJS (MIT).
- Built with the help of [Claude Code](https://www.anthropic.com/claude-code).

<sub>Inspired by the Netflix interface; no Netflix logos, fonts, images or sounds are used. The intro and all sounds are original (see <a href="tools">tools</a>). Not affiliated with Netflix, Inc., Stremio, Stremio Enhanced or any plugin author. <a href="CHANGELOG.md">Changelog</a> · <a href="LICENSE">MIT License</a>.</sub>
