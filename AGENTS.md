# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the entry point and loads the app shell plus scripts in dependency order. Core styling lives in `css/style.css`. Feature logic is split across `js/` modules such as `timer.js`, `ui.js`, `weather.js`, `auth.js`, and `init.js`; these share the global browser scope, so load order in `index.html` matters. PWA assets live in `manifest.json`, `sw.js`, and `icons/`. Deployment automation is in `.github/workflows/deploy.yml`, and Firestore access rules are defined in `firestore.rules`.

## Build, Test, and Development Commands
There is no build step or package manager in this repository.

```bash
python3 -m http.server 5500
```

Serve the site locally, then open `http://localhost:5500`.

```bash
git push origin main
```

Pushes to `main` trigger the GitHub Actions deploy workflow, which updates `sitemap.xml` and runs `git pull` on the server.

## Coding Style & Naming Conventions
Follow the existing plain HTML/CSS/JavaScript style: 2-space indentation, semicolon-terminated statements, and single quotes in local scripts. Keep filenames lowercase and feature-based (`js/timer.js`, `js/sync.js`). Use `camelCase` for functions and state fields, and keep CSS custom properties in `:root`. Prefer small, focused modules and preserve the current script order when adding dependencies.

## Testing Guidelines
There is no automated test suite yet, so contributors should do browser-based regression checks before opening a PR. At minimum, verify timer start/pause/reset, mode switching, language toggle, responsive layout, and service worker registration. When touching Firebase code, test signed-in and guest flows separately. Document any untested paths in the PR.

## Commit & Pull Request Guidelines
Recent history mostly uses short Conventional Commit-style subjects such as `feat:` and `refactor:`. Continue that pattern and use imperative summaries, for example: `fix: correct long-break reset logic`. PRs should include a clear description, note user-visible changes, link any related issue, and attach screenshots or short recordings for UI changes. Call out changes to deploy, PWA, or Firebase behavior explicitly.

## Security & Configuration Tips
Do not commit new secrets. Production deploy credentials and Telegram notification tokens belong in GitHub repository secrets, not in source files. Treat edits to `js/firebase.js`, `firestore.rules`, and `sw.js` as high-impact changes and verify them carefully in a local browser before merging.
