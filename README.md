# Flappy Pepe

A small, self-contained browser arcade game: flap through the pipes, earn a point for each one cleared, and try again. No account is needed. Includes keyboard, mouse and touch controls, pause/resume, optional synthesized sound, a final score, and a personal best saved in this browser.

**Brief interpretation:** “pay button” was treated as a typo for **Play**. A clarification was offered; no payment terms were supplied. This delivery is a free game, with no payment processing or wallet connection.

## Install and run

Use Node.js **22.12 or newer** (validated with 24.21.0) and npm.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. The app uses Vite, strict TypeScript, native HTML controls, and a Canvas 2D renderer. A UI framework is unnecessary for this single game; there are no runtime package dependencies.

## Check, rebuild, and preview

```sh
npm run typecheck
npm test
npm run build
node scripts/check-export.mjs
npm run preview
```

The production export is already included in `dist/`, together with the source and `package-lock.json`. Preview serves that export, so rebuild after changing source. Do not open `index.html` through `file://`; use an HTTP static server.

In a restricted workspace, install this package's dependencies in a separate directory and set `FLAPPY_DEPS_DIR` to it. `scripts/run.mjs` resolves Vite and TypeScript there. Ordinary installs need no environment variables. The worker used `/tmp/flappy-pepe-deps`; no dependency trees, npm caches, registry mirrors, or archives are included in the submission.

## Publish

Upload **the contents of `dist/`**, including `assets/`, `fonts/`, and `frog.svg`, to any static HTTP host. Set `index.html` as the index document. No build service, backend, credentials, environment file, SPA rewrite, or external CDN is required. Vite's `base: './'` makes the export work at a directory subpath as well as a domain root. The published runtime requests only its local files.

If publishing from this source repository, keep the rebuilt `dist/` in the submission; the intended publisher serves it without rebuilding. Include the bundled font licenses. Exclude installed dependency/cache directories from any later submission. No ignore file was created or changed for this assignment.

## Controls and behavior

| Action | Control |
| --- | --- |
| Start or replay | Play now / Play again button; Enter or Space when focused |
| Flap | Space when the game is focused, Arrow Up, click, or tap the playfield |
| Pause / resume | P, Escape, or the toolbar pause button |
| Instructions | How to play; Escape closes the native dialog |
| Sound | Speaker toggle; muted initially |

Opening instructions, hiding the page, or substantially resizing the playfield pauses a flight. Returning to the page requires an explicit resume. Reduced motion disables decorative cloud drift, frog rotation, and button transitions; the essential, user-started game physics remain active.

The `flappy-pepe-v1` local-storage record contains only best score, completed flight count, and sound preference. If storage is blocked or full, the game remains playable and explains that records last for this visit. No scores leave the browser.

## Validation performed

On 2026-10-09 (Asia/Taipei), after the final source changes:

- `FLAPPY_DEPS_DIR=/tmp/flappy-pepe-deps npm run typecheck` — passed, TypeScript 5.9.3.
- `npm test` — **12 passed**, including lift/gravity, both world edges, pipe collision, one point per pipe, pause, frame clamping, resize, replay, storage failures, and ten cleared pipes at mobile and desktop logical widths.
- `FLAPPY_DEPS_DIR=/tmp/flappy-pepe-deps npm run build` — passed, Vite 7.3.7; the resulting export is included.
- `node scripts/check-export.mjs` — passed; eight export files, 121,000 bytes, with relative local asset URLs.
- Production-browser checks at `/preview/` — start, keyboard flap, a one-point flight, pause/resume, collision/final score, replay, persistence after reload, sound toggle, instructions, focus return, and synthetic touch input passed.
- Rendered layouts inspected at 1440, 768, 390, and 320 CSS pixels. The repaired 320px layout and 200% root-font enlargement have no horizontal overflow. Reduced-motion behavior was checked.
- axe scans found no violations in the inspected ready, paused, final-score, and instruction states. Automated canvas contrast remained incomplete; additional rendered-color measurements identified and resolved caption contrast issues.

See [artifacts/validation.md](artifacts/validation.md) for the six-domain Better Interface review, precise coverage, fixes, measurements, screenshots, and limitations. Native browser zoom, physical touch devices, screen-reader use, Safari/Firefox, audible sound quality, and exhaustive contrast across every game frame were **not verified**. This is the worker's validation, not an independent certification.

## Source map

- `src/main.ts` — page, state transitions, inputs, focus, audio, canvas lifecycle.
- `src/game.ts` — deterministic physics, scoring, collisions, responsive world size.
- `src/art.ts` — original pixel frog, pipes, clouds, and landscape.
- `src/storage.ts` — validated, failure-tolerant browser records.
- `src/style.css` — design tokens, layout, component states, responsive and motion rules.
- `tests/game.test.mjs` — reproducible Node tests without a browser or backend.
- [DESIGN.md](DESIGN.md) — implemented design system.

## Attribution

Bricolage Grotesque and DM Sans are bundled as local Latin variable WOFF2 fonts, distributed through Fontsource. Their SIL Open Font Licenses are in `public/fonts/` and `dist/fonts/`. The drawing and UI icons are code-native artwork in this project.

Design review applies Jakub Krehel's [Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), pinned at `267330e1adfc66a718fb65fa6918c1f06d0a689e` (MIT, copyright 2026 Jakub Krehel). The documentation method is adapted from Paul Bakaus's [Impeccable document reference](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), pinned at `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` (Apache-2.0, copyright 2025 Paul Bakaus). The assignment supplied those references locally; no live upstream version was substituted. Their combined license notices are retained in `artifacts/design-guidance-LICENSE.txt`.
