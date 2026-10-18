# Changelog

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
