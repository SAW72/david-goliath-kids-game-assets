# David & Goliath – Toddler Web Game

Gentle story game for a young child on **iPad Safari**. Phase 1 is web only — no native iOS app.

## Status (2026-09-19)

The first `index.html` build was unfinished. This revision is a **local playable web build**.

**Was missing or broken**
- Shepherd-boy video not wired into the story
- No Pause or Home / Exit
- Backgrounding the tab left video and audio running
- Safari audio unlock was unreliable
- Next + mini-games could skip a scene
- No offline cache / Home Screen manifest
- Landscape, safe-area, and tap-target sizing were weak
- Hard mode and confetti were busier than needed for about age 3

**Now**
- 7 story scenes, plus a **David’s hills** bonus interlude using `videos/01-david-shepherd-boy.mp4`
- Pause + Home, visibility pause, Safari unlock, guarded Next/mini flow
- Classic HTML / CSS / JS (no build step). Game data and flow are in `js/`, separate from the web shell
- Optional service worker on http(s) only — does not run on `file://`

See [CHANGELOG.md](CHANGELOG.md). This has **not** been kid-tested.

## Play on an iPad

iPad Safari generally cannot load a folder of local files the way desktop Safari can. Use a tiny static server on the same Wi‑Fi, then Add to Home Screen.

**On a computer in this folder**

```bash
python3 -m http.server 8080
```

On the iPad, open `http://<computer-lan-ip>:8080` in Safari.

**Add to Home Screen**
1. Safari Share → **Add to Home Screen**
2. Open the icon for a full-screen play

**Desktop smoke test**
- Open `index.html` as a file, or use the same local server
- `file://` works for relative assets; the service worker does **not** register there (by design)

Do not collect accounts, analytics, or personal data. This build does not.

## Controls

| Control | What it does |
| --- | --- |
| **Play Story** | Unlocks sound, then level pick |
| **Easy / Medium / Hard** | Fewer or a few more taps. All stay gentle |
| **Next** | Next scene. If a tap mini belongs to this scene, it opens first and cannot be skipped |
| **Again** | Replay this scene’s video and voices |
| **⏸ Pause** | Stops video and voices. Large Resume + Home |
| **⌂ Home** | Back to the title. Stops media |
| **💛 Hills** | Optional encore of David on the hills (same spare clip). Does not skip the story |
| Volume / mute | Always available. No tracking |

Home and Pause stay on screen during the story. Switching away from Safari pauses media; coming back resumes unless you had paused.

## Story order

Toddler-friendly telling of Hebrew 1 Samuel 17 (soft lion / bear / Goliath art, not scary):

1. Jesse sends David
2. David & the sheep — tap sheep
3. **David’s hills interlude** (`videos/01-david-shepherd-boy.mp4`) — after the sheep mini
4. David & the lion
5. David & the bear
6. David tells Saul — tap David
7. Goliath challenges — tap stones
8. Victory

The same spare clip also plays as a **welcome** after Easy / Medium / Hard (before Jesse), and anytime from **💛 Hills** during a scene. It loops gently until **Keep going**. No extra shepherd narration file is in the repo.

## Project layout

```
index.html          web shell (screens + buttons)
css/app.css         layout, safe-area, landscape
js/story.js         scenes + levels (no DOM)
js/flow.js          Next / mini / pause / home rules
js/media.js         volume, unlock, visibility
js/minis.js         tap minis
js/game.js          wires the web UI
js/boot.js          start + service worker register
sw.js               http(s) cache only
manifest.webmanifest
tests/flow.test.mjs
```

A future platform shell should keep `js/story.js` and `js/flow.js` and replace only the UI layer. Do not build an iOS app in this repo.

```bash
node --test tests/flow.test.mjs
```

## Hosting later (not enabled)

This repo is not deployed from here. A parent can later put the static folder on:

- **Cloudflare Pages** (private / access-restricted project)
- **GitHub Pages**
- Any static host

No Pages project, Worker, or DNS is configured. Do not publish unless you mean to.

## Kid-safe notes

- No accounts, ads, analytics, or tracking
- No violence, horror, gambling, or dark patterns
- Confetti is slow and limited; `prefers-reduced-motion` turns it off
- Video clips already in `videos/` are unchanged

## Known limits

- iPad needs http(s) (local network or a later private host), not a raw Files-app `file://` open
- First visit on a host should happen online so the service worker can cache audio / later videos
- Videos are short generated clips; shepherd scene has no extra narration file
- Autoplay still needs a first tap (Play Story) on Safari
- Chrome / Safari desktop and iPad Safari were the target; other browsers are untested
- Title art is the existing `assets/title.jpg` (including its lettering)

## Later polish ideas

- A short shepherd narration clip to match the other scenes
- Optional “watch to the end” hint so Next is less tempting mid-clip
- Smaller video files for older iPads
- Closed captions on the story videos
- A parent lock on Home if a toddler exits by accident
