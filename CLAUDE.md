# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page static portfolio site for "Nyte", a Roblox/Luau developer. No build system, no
dependencies, no package manager. Pure HTML/CSS/JS (ES modules) served as-is.

## Running

Serve the folder over HTTP (required — the JS uses ES modules, which browsers block on `file://`,
and the external APIs also need HTTP):

```powershell
python -m http.server 8000   # then visit http://localhost:8000
```

There is no build, lint, or test step. To sanity-check JS syntax:
`node --input-type=module --check < assets/js/modules/<file>.js`.

## Architecture

The page is **data-driven from a single config object**, rendered by small ES modules.

- `index.html` — static skeleton. Sections contain empty container `<div>`s with known IDs
  (e.g. `#skills-container`, `#code-showcase-container`, `#projects-container`). Loads one entry
  script: `<script type="module" src="assets/js/main.js">`.
- `assets/js/config.js` — `export const config`, the **single source of truth** for all page
  content. **Edit content here, not in the HTML or JS.**
- `assets/js/main.js` — entry point. On `DOMContentLoaded` it calls the render + init functions.
- `assets/js/modules/` — one concern per file:
  - `utils.js` — `el()` DOM builder, `escapeHtml`, toast, clipboard.
  - `highlight.js` — tiny dependency-free Luau syntax highlighter (`highlightLuau`).
  - `theme.js` — light/dark toggle (localStorage).
  - `lanyard.js` — Discord presence + Spotify (Lanyard WebSocket).
  - `render.js` — builds every section from config (personal, skills, code showcase, commissions,
    projects, about, feedback).
  - `modal.js` — project/commission detail modal (Esc/backdrop/X close, Streamable embeds).
  - `interactions.js` — reveal-on-scroll, button ripples, feedback carousel.
- `assets/css/style.css` — all styling. Palette + fonts are CSS custom properties in `:root`
  (`--bg`, `--text`, `--accent`, `--font-head`, …); light/dark via `.light-theme` on `<body>`.

### Cache busting

Asset URLs in `index.html` carry manual version query strings (`style.css?v=5`, `main.js?v=8`).
**Bump these when changing CSS/JS** or browsers will serve stale cached files. (Note: imported
modules are not query-versioned; a hard refresh clears them during development.)

### Conventions tying config to rendering

- **Projects/commissions** support `status: "wip"` or `"finished"` → renders a colored status tag.
  An entry showing a modal needs either `details` or a non-empty `links` array (the render gates the
  click handler on this).
- **Links** auto-embed: a `links[].url` matching `streamable.com/<id>` renders as an inline iframe
  in the modal; any other URL renders as a button.
- **Skills** `icon` field accepts an inline `<svg>` string, an image path (contains `/`), or emoji.
  (No mastery bars.)
- **Code snippets** live in `assets/code/**/*.luau` (real files). A project/commission's
  `files: [{ name, path }]` lists them; `name` may contain `/` to build a folder tree, `path` is
  the fetch URL. The modal renders a VS Code-style window (collapsible folder tree, Luau icon,
  hideable sidebar) and fetches each file on open/click, highlighting it via `highlight.js`.
  Inline `{ name, code }` is still supported as a fallback.
- **Feedback** cards are cloned once at runtime for an infinite auto-scroll carousel; scroll speed
  is `config.ui.feedbackScrollSpeed`.

### Live Discord/Spotify integration

The contact section pulls real-time Discord presence + Spotify activity via the **Lanyard API**
(`wss://api.lanyard.rest/socket`), keyed by `config.personal.discordUserId`. This requires the user
to be in the Lanyard Discord server. The WebSocket auto-reconnects after 5s on close. "Message me"
buttons copy the Discord handle to clipboard rather than opening DMs.
