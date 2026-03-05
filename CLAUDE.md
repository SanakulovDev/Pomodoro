# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TIKITAK is a Pomodoro timer PWA deployed at tikitak.uz. No build system or bundler — plain HTML/CSS/JS served as static files.

## Development

```bash
# Run locally (any static server works)
python3 -m http.server 5500
# Then open http://localhost:8080
```

No build step, no tests, no linter. Deployment happens automatically via GitHub Actions on push to `main` — rsync over SSH to the production server, with Telegram notifications on success/failure.

## Architecture

**Static site with vanilla JS modules loaded via `<script>` tags in dependency order:**

`index.html` loads scripts in this order (each depends on prior ones):
1. `config.js` — defines `SITE_URL`, used for SEO meta injection
2. `js/firebase.js` — ES module (`type="module"`), initializes Firebase and exposes SDK via `window._fb`
3. `js/i18n.js` — translations (EN/RU/UZ), `t()` helper, `data-i18n` attribute binding
4. `js/state.js` — global `state` object, localStorage persistence (`zaman_state`, `zaman_analytics`), analytics
5. `js/audio.js` — Web Audio API sound synthesis
6. `js/weather.js` — Open-Meteo API weather data + animated backgrounds
7. `js/ramadan.js` — hardcoded 2026 Tashkent prayer timetable, countdown logic
8. `js/timer.js` — core timer: tick loop, mode switching, session management, SVG progress ring
9. `js/ui.js` — notifications, Wake Lock, fullscreen, theme toggle, keyboard shortcuts
10. `js/sync.js` — real-time Firestore timer sync across devices
11. `js/auth.js` — Firebase Google auth, auth wall (3 free pomodoros), cloud save/load
12. `js/init.js` — bootstraps everything, registers service worker

**Key patterns:**
- All JS files share a single global scope (except `firebase.js` which is an ES module that exports via `window._fb`)
- Timer accuracy uses `targetEndTime` (absolute timestamp) rather than decrementing, so it stays correct across tab switches
- State is auto-saved to localStorage every 5s during active timer, and synced to Firestore every 2min for logged-in users
- The auth wall appears after 3 guest pomodoros; `auth.js` monkey-patches `recordPomodoro` to add guest tracking
- Firestore real-time listener (`onSnapshot`) enables cross-device timer sync via `sync.js`

## Firebase

Config is hardcoded in `js/firebase.js`. Firestore security rules in `firestore.rules` restrict read/write to authenticated user's own document (`users/{uid}`).

## PWA

- `manifest.json` — app manifest
- `sw.js` — service worker with network-first strategy, caches index and fonts
- Icons in `icons/` (192px, 512px)
