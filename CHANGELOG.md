# Changelog

## 2.8.0
- **Everything in one plugin.** Features that used to need separate plugins are now built into dx.bi, written from scratch so nothing clashes:
  - **Skip Intro, Skip Recap, Skip Credits and Next Episode** buttons (Netflix-style, bottom right), with optional auto-skip for intros and recaps, or credits too. Times come from TheIntroDB for movies and series and AniSkip for anime (Kitsu titles are matched to MyAnimeList automatically). No API key and no analytics.
  - **Addon order & backup** on the Addons page: drag (or use the arrows) to reorder your addons, back them up to a file, restore from a backup, and undo the last change. Saved to your Stremio account; dx.bi keeps the previous list so a change can always be undone.
  - **Subtitle styles**: Netflix, bold outline, boxed, classic yellow or soft, plus five fonts. Stremio's own size and position settings still apply, and the styles carry over to the picture-enhancement subtitle layer.
  - **Picture-in-picture** button in the player.
- dx.bi's menus and dropdowns sit above everything on their own, so **Context Menu Fix is no longer needed**.
- If you use TheIntroDB, IntroDB, AniSkip, Stremio Addon Manager, Addon Organizer, Enhanced Video Player, Picture in Picture or Context Menu Fix, turn them off: dx.bi now does the same and you'd get duplicate buttons.

## 2.7.0
- **One-click setup**: on first start with the default look, dx.bi offers to switch on the dx.bi theme (once; it never replaces a theme you picked). The theme now declares the plugin as a requirement, so Stremio Enhanced won't apply it on its own and leave you with half a redesign.
- **Fixed themes only appearing after a restart on Linux and macOS.** Stremio Enhanced's Apply button points the stylesheet at a bare file path, which the app resolves as a web address. dx.bi now corrects the link, so any theme applies instantly.
- **Anime scores on posters and previews.** The Kitsu anime addon passes its own score in the IMDb field, so those badges used to say "IMDb" with a Kitsu number. They're now labelled **Kitsu** (in blue), and anime without any score gets one from Kitsu (kitsu: ids) or AniList (mal: ids), fetched in batches and cached for 3 days.
- **Open in mpv / VLC** button in the player (shown only when one is installed). It pauses Stremio, so your place is kept, and hands the stream to the external player. Handy for files that stutter or won't play in the app. New setting to hide it.
- Steadier access to Stremio's internal state: dx.bi keeps a working handle even on screens where Stremio Web drops `window.core`, so My List, watch party and previews don't silently stop.

## 2.6.0
- **Watch party**: watch in sync with friends. Start a party from the people button, send the code, and everyone's Stremio opens the same title, picking the same release from their own addons and debrid account (matched by torrent hash, then filename, then quality). Shared play, pause and seeking; everyone waits while someone buffers; follows the host to the next episode; chat and reactions. Stream links and API keys are never shared, and everything is end-to-end encrypted with the party code (AES-256-GCM) over public relays, including one on port 443 for strict networks. New settings: watch party on/off, follow the host, chat & activity in the player, sounds.
- **Fixed Anime4K and Sharpen turning the picture upside down** after the first frame. Shader settings carried over from the last step of one frame into the first step of the next, which flipped the picture and also weakened the Sharpen filter after Anime4K had run. Every step now starts from clean settings.

## 2.5.2
- Fixed dropdowns not changing anything when the **Context Menu Fix** plugin is installed: Discover type, catalog and genre, Library type, and the season picker. That plugin shows a copy of each open dropdown. Pressing on the copy made Stremio close the real one before your choice reached it. dx.bi now passes the choice straight to the real option.
- Those dropdown copies now match the width of their button instead of being capped at 125px.

## 2.5.1
- Fixed hover previews not opening when you moved quickly from one open preview to another title. The old card's close was cancelling the new card's open. The current preview now stays up until the next one replaces it, and still closes as soon as you leave the row.

## 2.5.0
- **Seek bar previews now work with real streams.** Most streams play through Stremio's local converter (the player only sees a `blob:` URL), so previews now use the streaming server's own thumbnail endpoint. A coarse-to-fine thumbnail strip builds quietly in the background (pausing while the film buffers), so hovering shows a nearby frame instantly and the exact frame a moment later.
- The preview checks the pointer's real position on every move.
- **Picture enhancement (upscaler)**: real-time WebGL2 processing with a small mpv user-shader runtime running bloc97's **Anime4K** v4 Restore + Upscale CNN shaders (quality and fast), plus AMD-style contrast-adaptive sharpening for live action. Auto picks per title. HDR10 is tone-mapped to match Stremio's own picture, native subtitles are redrawn on top, and it steps down automatically if frames start dropping. ✨ button in the player.

## 2.4.0
- **Seek bar previews**: point at the progress bar to see a thumbnail of that moment and its time, Netflix-style; works while dragging too. Frames are cached and only fetched when the cursor rests, to keep bandwidth low.
- Fixed the seek-bar knob sitting half its width to the right of the true position.
- Lighter fill from the playhead to the cursor; Stremio's small time tooltip is replaced by the preview card.
- **Time remaining**: the player clock counts down by default (click it to switch).
- **Next Episode** button on series, next to the other controls.

## 2.3.0
- **Stream sorting & filters** above every streams list: sort by addon order, best quality, most seeds, largest or smallest; filter by quality, language (from flags and release names), source, provider, ⚡ instant (cached debrid) and HDR/DV. Works with any stream addon, remembers your choices, and never moves Stremio's own elements (uses CSS order), so streams that arrive late slot in correctly.
- README: clear note that DX.BI is a reskin, not a streaming service; linked list of compatible plugins with credits.

## 2.2.1
- Billboard transitions reworked: only the pictures cross-fade; the old title fades out completely before the new one fades in, with no movement — text stays crisp instead of looking washed out mid-change. The outgoing picture keeps its slow zoom until it has faded (no jump).
- Genre / cast / director pills (details page and Discover panel): text is now optically centred.

## 2.2.0
- **New intro**: a pre-rendered cinematic film (logo drop-in → push-in → dive through a 3D tunnel of light ribbons → red light wash) with an original stereo score. Plays on the video decoder, so it's smooth even while the app loads (0 dropped frames in testing). Follows your accent colour; skip with Esc/Enter/click.
- **Interface sounds**: designed, synthesised sounds for tabs, opening titles, previews, My List, player controls, toggles and keyboard navigation, with a volume setting.
- **Works with your addons**: previews, ratings and artwork now come from the metadata your addons already provide (TMDB, anime, streaming catalogs…), with Cinemeta only filling gaps. Rating badges are skipped on posters that already show one (RPDB etc.). My List reflects the real library state.
- **Plugin compatibility**: stream-list plugins (Stream Quality Picker, Stream Keyword Filter, Stream Finder, FilterStreams) stack neatly with the streams panel; Enhanced Video Player's subtitle styling becomes a matching panel; Context Menu Fix no longer inflates the account menu; all skip-intro plugins get matching buttons.
- Billboard keeps rotating while you hover, and resumes cleanly when you come back to Home.
- Performance: removed every endlessly-running animation (static loading placeholders, GPU-only preview zoom); idle CPU on Home ~2% while the billboard animates, zero elsewhere.
- One-line installers for Windows (PowerShell) and Linux/macOS.

## 2.1.0
- Netflix-style animated intro (logo drop-in, push-in, light ribbons), optional synthesized sound.
- Redesigned hover preview: grows out of the poster, Play / My List / More info, rating, length, HD, genres.
- New player: ±10s buttons, centred title, play/pause feedback, dot-style speed picker, three-column subtitles panel with ticks.
- Fixed player menus not closing and the control bar overflowing on wide button sets.
- Settings refresh immediately after an update (no restart needed).
- Bounded metadata cache with expiry; each update step is isolated so one failure can't stop the rest.

## 2.0.0
- First public version: billboard, carousels, IMDb badges, wide Continue Watching, full page restyle.
