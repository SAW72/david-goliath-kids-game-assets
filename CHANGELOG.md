# Changelog

## 2026-09-19 — Phase 1 playable web build

### What was incomplete or broken
- `videos/01-david-shepherd-boy.mp4` existed but was not in the story `scenes` list
- No Pause control and no Exit / Home (only Play Again / Change Level at the end)
- Tab / app backgrounding did not pause video or audio
- Safari first-tap audio unlock was only a best-effort `play().catch`
- No service worker / Add to Home Screen manifest
- Next + video-ended could start a mini and then skip it (double-advance)
- Scene voice timers were not cleared, so fast Next stacked narrations
- Hard used up to 7 taps and 120 spinning confetti pieces; end title bounced forever
- Layout ignored safe-area insets; mute hit target was 48px; landscape was a tall portrait stack
- Game logic lived entirely inside `index.html`

### Fixes
- Shepherd-boy clip is scene 1 (8 scenes, toddler 1 Samuel 17 order)
- Large Pause + Home on the play chrome, pause overlay, and end screen
- Page Visibility / pagehide pauses media; resume if the player did not pause
- First Play / level tap unlocks audio elements + AudioContext
- `sw.js` caches the shell, images, and audio on http(s) only (skipped on `file://`)
- Flow state machine ignores Next while a mini is open; 450ms lock on scene advances
- Voice timers cleared on Next, Replay, Pause, Home, and mini start
- Hard capped at 4–5 gentle taps; confetti is fewer, slower, round, one-shot
- Safe-area padding, 64px tap targets, landscape player row
- Logic split into `js/story.js`, `js/flow.js`, `js/media.js`, `js/minis.js`, `js/game.js` (classic scripts, no build step)
- Service worker skips HTTP Range / 206 video responses (Safari playback)
- First Play no longer waits on audio unlock, so a slow Safari gesture cannot freeze the title button
