# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

```bash
npx serve -p 3000 .
```

No build step, no bundler, no compilation. Files are served as-is.

## Architecture

**Pure static site** — five files, no framework, no dependencies beyond Google Fonts.

| File | Role |
|------|------|
| `index.html` | All markup and content. Single-page, anchor-based routing: `#hero` `#boot` `#homelab` `#services` `#telemetry` `#timeline` `#ailab` `#network` `#cta`. |
| `styles.css` | All styling (~1950 lines). CSS custom properties in `:root` — change design tokens there first. No preprocessor. |
| `script.js` | Self-contained IIFEs (see below). |
| `favicon.svg` | SVG favicon — dark rounded square with `bf` in cyan (`#67e8f9`). |

## Design system

All colors, spacing, and motion are CSS variables in `:root` at the top of `styles.css`.

Primary accents: `--cyan: #67e8f9` (primary), `--green: #4ade80` (status only), `--pink: #f472b6` (glitch only), `--purple: #c4b5fd` (AI section only), `--amber: #fcd34d` (warnings).  
Backgrounds: `--bg #05070b` → `--bg-4 #1a2030` (four levels, named `--bg-1` through `--bg-4`). Legacy aliases `--bg2/3/4` exist for backwards compat.  
Line/border tokens: `--line`, `--line-mid`, `--line-strong` (replaces old `--border` family).  
Category colors for service cards: `--cat-media: #c4b5fd`, `--cat-infrastructure: #67e8f9`, `--cat-network: #4ade80`.

Service card category theming uses `:has([data-cat="..."])` to set `--cat-color` per card — no per-card class needed.

## script.js — IIFEs in order

0. **Boot intro overlay** — fills `#biBar` and cycles status text over 1.7s via rAF, then fades `.boot-intro` out and removes it.
0b. **Custom cursor** — dot (`#curDot`) follows mouse exactly; ring (`#curRing`) lerps behind via a continuous rAF loop at 0.18 factor. Adds `.hover` class to ring over `a/button/.svc-card`. Only activates when `(hover: hover) and (pointer: fine)` matches.
0c. **Live uptime counter** — sets `#uptimeDays` to days elapsed since `2024-03-01`.
0d. **Scroll to top** — shows `#toTop` after 700px scroll; smooth-scrolls to top on click.
0e. **Clipboard copy** — clicking `#sshCmd` writes `ping bytefort.xyz` to clipboard; shows `#toast` for 2.2s with fallback text on clipboard API failure.
0f. **Text scramble** — on intersection of `.section-tag` elements, scrambles characters via rAF using `CHARS = '!<>-_\\/[]{}=+*^?#@~01'` before resolving to real text. No-ops on `prefers-reduced-motion`.
0g. **Click ripple** — disabled in current version.
1. **Scroll progress bar** — updates `#progressBar` width% on scroll.
2. **Mouse glow** — moves `#mouseGlow` (fixed radial gradient) via `transform` to follow the cursor.
3. **Hero canvas** — 85-particle network on `#heroCanvas`; mouse repels nearby particles.
4. **Typing animation** — types/deletes rotating role strings into `#typedText`.
5. **Animated counters** — `IntersectionObserver` on `[data-count]` elements; ease-out-cubic 0→target.
6. **Navbar** — scroll-state class on `#navbar`, active link tracking across sections, hamburger toggle for `#mobileMenu`.
7. **Boot scroll driver** — scroll progress through the 380vh `#boot` section appends terminal lines into `#bootTerminal` (incremental, not full rebuild), fills `#bootBar`, shows `#bootStats` at 98%.
8. **Homelab scroll driver** — scroll progress through the 480vh `#homelab` section switches `.active` between four `.hl-stage` / `.hl-panel` pairs (`#hlStage0–3`, `#hlPanel0–3`).
9. **Scroll reveal** — `IntersectionObserver` adds `.visible` to `.reveal-up` elements (stagger: 60ms × index % 6).
10. **3D card hover** — `mousemove` on `.svc-card` applies `perspective(800px) rotateX/Y`.
11. **Service filter** — `.filter-btn[data-filter]` toggles `.hidden` on `.svc-card[data-category]`.
12. **Live telemetry** — `IntersectionObserver` starts on `#telemetry`; simulates CPU/mem/net/temp/req metrics with drift. Updates every 2.2s. Draws sparklines via SVG path generation. Tails a fake log into `#tlmLog` every 1.4s. All animation skipped on `prefers-reduced-motion`.
13. **WeTTY modal** — document-level click delegation on `[data-modal="wetty"]` opens `#wettyModal`. Uses `visibility`/`pointer-events` toggle (not `display`) so CSS transitions fire correctly. Closes on backdrop click, close button, or `Escape`.
14. **Secret terminal** — press `` ` `` to open a slide-up terminal panel (`#secretTerm`). Commands: `help neofetch df free top uname date ip addr docker ps services ping traceroute speedtest curl sudo rm vim fortune matrix clear exit`. `openTerm()` sets all `.svc-modal` to `visibility:hidden`; `closeTerm()` restores them. `run()` splits input into `cmd + args[]` and dispatches to `CMDS[cmd](args)`.
15. **Matrix rain** — Konami code (`↑↑↓↓←→←→BA`) or the `matrix` terminal command triggers a canvas rain on `#matrixRain` (z-index 99999). Listens for `CustomEvent('bytefort:matrix')` so the terminal can trigger it without coupling IIFEs.

## Sticky scroll sections

Both sticky sections use the same pattern: tall outer wrapper holds scroll distance; `position: sticky` inner panel pins to viewport.

- **Boot** (`#boot`): `height: 380vh` outer, `100vh` sticky inner. Progress = `(scrollY - sectionTop) / (sectionHeight - viewportHeight)`.
- **Homelab** (`#homelab`): `height: 480vh` outer, `100vh` sticky inner. Progress maps to 4 stages via `Math.floor(progress * 4)`.

## Terminal line classes

Lines injected by the boot scroll driver use CSS classes from `styles.css`:
- `.t-line.ok` — green, standard boot messages
- `.t-line.info` — cyan, per-service URL lines
- `.t-line.done` — bright green bold, final line
- `.t-line.show` — triggers the reveal transition (added via `requestAnimationFrame` after DOM insertion)

## Telemetry section

`#telemetry` (`s-telemetry`) — 6-card grid (`tlm-grid`) with these data-metric values: `cpu`, `mem`, `net`, `disk`, `temp`, plus a stats card. The primary CPU card (`tlm-primary`) spans 3 columns and holds an SVG sparkline. **Live data** is fetched from `https://api.bytefort.xyz/metrics` every 2.2s; the `update()` function in IIFE 12 falls back to simulated drift if the fetch fails. Response fields map to `[data-tlm-val]` elements. Log lines are injected as `<span class="ll {level}">` inside `#tlmLog`.

Hardware baseline: Dell PowerEdge R720 · 2× Xeon E5-2650 · 64GB DDR3 ECC · 4.76TB VMFS. Seed state in IIFE 12: `cpu: 3, mem: 43, disk: 3.48, diskTotal: 4.76`.

## Timeline section

`#timeline` (`s-timeline`) — vertical build log rail (`.tl-track` / `.tl-rail`) with `.tl-item` milestones. The rail has an animated glow pulse via `::after`. Each item uses `.tl-dot` (pulsing on last item). All items use `.reveal-up` for scroll-in.

## Key CSS classes

| Class | Trigger | Effect |
|-------|---------|--------|
| `.reveal-up` | `.visible` added by observer | `opacity 0→1`, `translateY(36px) skewY(1deg) → none` |
| `.boot-intro` | `.hide` added by JS | `opacity → 0`, then element removed |
| `.cur-ring` | `.hover` added by JS | expands `28px → 44px`, border turns cyan |
| `.to-top` | `.show` added on scroll | fades in from `translateY(12px)` |
| `.hl-stage` / `.hl-panel` | `.active` toggled by homelab driver | fades in from offset position |
| `.svc-card` | `.hidden` toggled by filter | `display: none` |
| `.tlm-card` | `data-metric` attribute | identifies which metric to update |

## Service cards

Each `.svc-card` carries `data-category="media|infrastructure|network"`. The JS filter and CSS theming both read this. The `.svc-icon` and `.svc-badge` inside carry `data-cat="..."` which drives `--cat-color` via CSS `:has()`.

Cards are normally `<a>` tags (whole card is a link). If a card needs a picker instead of a single URL, use `<div class="svc-card svc-card--modal" data-modal="<id>">` — the modal IIFE uses document-level delegation to catch clicks. The modal itself uses `visibility: hidden` / `.is-open` class toggle.

Modal CSS constraints:
- **Never** use `display: none` + `requestAnimationFrame` for open transitions — the browser batches them into the same paint frame and the transition doesn't fire.
- **Never** use `backdrop-filter` on the modal backdrop — causes a Safari stacking context bug where the element paints above higher z-index siblings (e.g. the secret terminal at z-index 9000).
- **Never** use `inset: 0` shorthand or `min()`/`max()` CSS functions — Cloudflare's CSS minifier can strip them; use explicit `top/right/bottom/left` and `width + max-width` instead.

Current service count: **14** (Dashboard, Jellyfin, Jellyseerr, Prowlarr, Nginx Proxy Manager, qBittorrent, Radarr, Sonarr, VMware, WeTTY, Grafana, Safe, Speed Test, Status). Update `data-count` on `#hero .hs-num` and `.cta-stat-n`, the homelab panel `[ N ONLINE ]` label, and `.hl-svc-grid` entries whenever services are added or removed.

## Reduced-motion guard

IIFEs 0f, 3 (hero canvas), 4 (typing animation), and 12 (telemetry) check `matchMedia('(prefers-reduced-motion: reduce)').matches` at startup and return early or skip intervals. IIFE 4 sets a static fallback string (`'Homelab Engineer'`) instead of animating.

## Custom cursor notes

The cursor is only active on `(hover: hover) and (pointer: fine)` devices (not touch). CSS sets `cursor: none` on `body, a, button` inside that media query. Both `#curDot` and `#curRing` use `position: fixed; top: 0; left: 0` anchored at origin — positioning is done entirely via `transform: translate(x, y) translate(-50%, -50%)` so centering stays correct even when ring size transitions.

## Deployment

Served via **Cloudflare Tunnel** (zero open ports) behind **Cloudflare CDN**. Changes pushed to `main` on GitHub are live, but CSS/JS assets are edge-cached — after any `styles.css` or `script.js` change, purge the cache: Cloudflare dashboard → bytefort.xyz → **Caching → Overview → Purge Cache → Purge Everything**.

**Content Security Policy** is set via `<meta http-equiv="Content-Security-Policy">` in `index.html` (no Nginx config available). Current policy allows:
- `style-src`: self + `unsafe-inline` + Google Fonts
- `script-src`: self + `https://static.cloudflareinsights.com`
- `connect-src`: self + `https://api.bytefort.xyz` + `https://cloudflareinsights.com`

If a new external resource is added (font, script, fetch target), update the CSP meta tag or it will be blocked silently in the browser console.
