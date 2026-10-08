# Flappy Pepe design system

## Overview

Flappy Pepe is a casual, single-page arcade game. The design pairs a quiet mint background and a cream game console with an original pixel landscape. The large, rounded title and playful copy establish the personality; the green Play action remains the clear next step. Supporting instructions are brief and secondary.

The actual implementation lives in `src/style.css`, the HTML template in `src/main.ts`, and the canvas renderer in `src/art.ts`. Components are native DOM patterns, not React components or a separately exported library.

## Colors

The canonical format is sRGB hex. CSS primitives feed semantic roles where shared across the interface. This is an intentionally light-only design.

| Token / value | Implemented role |
| --- | --- |
| `--bg-page` → `--sage-100`, `#edf3e9` | Page background, with an extremely faint 28px square grid |
| `--bg-surface` → `--cream-50`, `#fbfcf5` | Toolbar, console footer, results, instructions |
| `--bg-scene`, `#dcebdc` | Opaque backing for small labels over the canvas |
| `--text-primary` → `--sage-950`, `#263e2d` | Headings, body emphasis, structural icons |
| `--text-secondary` → `--sage-700`, `#4f634e` | Supporting text, captions, instructions |
| `--border` → `--sage-300`, `#cad9c3` | Dividers, secondary control boundaries, keycaps |
| `--accent` → `--green-700`, `#385d2c` | Filled primary action |
| `--accent-hover`, `#294a20` | Primary action hover |
| `--on-accent`, `#fbfcf5` | Primary button text and icons |
| `--focus`, `#365fb5` | 3px keyboard focus outline with 4px offset |
| `--green-600`, `#507d39` | Large title accent, best-score numerals, tiny redundant status dots |
| `--green-100`, `#e0eaca` | Selected sound-control background and text selection |
| `--sage-200`, `#dce6d5` | Tip icon surfaces and neutral control hover |
| `--sage-50`, `#f6f8ef` | Keycap background |
| `--sage-500`, `#71846c` | Decorative hint separators |
| `--gold-100`, `#f4eccf`; `--gold-700`, `#796537` | Trophy tip and trophy icon |

Canvas colors are independently named drawing materials in `src/art.ts`: sky `#dcebdc`, clouds `#f6f8e9`, far hills `#c0d7b9`, hills `#aecb9c`, grass `#729752`, ground `#e9e4bd`, pipes `#91b46a`, and outlines `#36543b`. These are decorative/gameplay assets, not UI action tokens.

Measured examples: primary text on page **10.28:1**, secondary text on page **5.76:1**, primary button label **7.34:1**, small canvas labels on their opaque backing **5.26:1**. Large green title text measures **4.29:1** against the page and exceeds the 3:1 large-text threshold. See validation for sampling methods and limits.

## Typography

Two local variable font faces load with `font-display: swap` and no synthetic styles:

- **Bricolage Grotesque**, CSS family `Bricolage`, weights 200–800; fallback `'Arial Rounded MT Bold', system-ui, sans-serif`. Used for brand, display headings, and score numerals. Asset: `public/fonts/bricolage-latin.woff2`.
- **DM Sans**, weights 100–1000; fallback `system-ui, sans-serif`. Used for controls, body, labels, and keycaps. Asset: `public/fonts/dm-sans-latin.woff2`.

The browser confirmed both faces loaded. `src/style.css` defines `--font-display` and `--font-body`; heading weight is usually 800, body 400, controls 600. Root body size is 16px with 1.5 line-height. Body paragraphs use 1.6–1.65 where appropriate. Text remains selectable outside the gesture surface.

| Role | Final size and treatment |
| --- | --- |
| Main title | `clamp(3.25rem, 6.5vw, 5rem)`, 1.06 line-height, −3.8px tracking; mobile override `clamp(2rem, 14vw, 3.65rem)`, −2.8px tracking |
| Game overlay heading | 2rem / 1.1, −1.1px tracking; mobile 1.75rem, −0.8px |
| Instruction dialog heading | 1.75rem / 1.15, −0.7px |
| Hero description / primary button | 1rem; mobile description 0.8125rem |
| Overlay instructions / tip headings | 0.875rem; mobile overlay instructions 0.8125rem |
| Tip body | 0.75rem / 1.65; 27ch desktop and 38ch mobile measure |
| Score numerals | 1.5rem in toolbar, mobile 1.375rem; 2.5rem in results; tabular numbers |
| Compact chrome / decorative labels | 0.5625–0.75rem, 500–600 weight, positive uppercase tracking; deliberately compact arcade details |

Headings use balanced wrapping; paragraphs use pretty wrapping. No essential score or instruction is ellipsized. Uppercase styling is CSS except the decorative canvas-club signature.

## Layout

`.wrap` establishes shared alignment: maximum 1120px, 40px side margins by default, 24px below 960px, and 16px below 680px. Spacing follows 4, 8, 12, 16, 24, 32 and 48px steps, with component-specific optical adjustments. The corresponding `--space-*` values are available in `:root`; much of this single-page composition uses those values directly.

Desktop order: brand/help header, centered hero, full-width game console, three instruction columns, small footer. This same DOM order is retained on mobile. The console groups score and best at the leading edge and sound/pause at the trailing edge.

Breakpoints:

- **960px:** reduce outer/toolbar spacing and hide the secondary readiness text.
- **680px:** compact header, hide decorative hero note and free-play tagline, hide the supplemental flight counter, stack instruction tips, center playfield instructions, and show the small frog above them. Controls are 44px targets. The footer wraps naturally.
- **360px:** tighten score spacing, omit redundant trophy/help icons and the extra “to flap” hint, and stack dialog key descriptions.

The game scene is `max(430px, 27rem)` high on desktop and `max(440px, 28rem)` on mobile. Its rem minimum grows with text enlargement. A size-container query at 600px scene height gives the ready content a cream surface to keep enlarged text clear of pipes. Header and toolbar can wrap. `.title-row` is bounded on mobile so its decorative spark cannot create overflow.

Canvas world height is always 460 logical units. Width comes from the measured scene aspect ratio; drawing is scaled for device pixels (capped at 2×). Resizing preserves pipe distances from Pepe and pauses an active flight. Absolute physical coordinates in this illustration are intentional; content layout generally uses logical CSS properties.

Observed widths: 1440, 768, 390 and 320 CSS pixels. A 320px viewport with 200% root-font enlargement also fits after fixes. Browser-native zoom and RTL layouts were not verified; the delivered content is English, left-to-right.

## Elevation & Depth

The console uses a structural sage border, a 5px low-opacity bottom shadow, and a soft 12px/30px ambient shadow. The primary button has a 3px dark-green bottom edge. These imply an arcade control without glossy effects.

Paused/results states add a translucent scene cover, 3px backdrop blur, and a solid cream card. The dialog uses a darker green translucent backdrop and a 20px/80px shadow. Background and canvas layers never cover primary controls. No page entrance animation or idle autoplay is used.

## Shapes

`--radius-control: 10px` applies to buttons. `--radius-panel: 18px` applies to the console (14px on mobile). Result cards use 16px; the native dialog 20px; icon surfaces 12px; keycaps 5px. The ready-state caption backing uses 4px corners. Pixel art uses crisp rectangular blocks rather than rounded outlines.

## Components

- **Brand and header** (`src/main.ts`, `.site-header`, `.brand`, `.help-button`): local SVG frog, home anchor, and native instructions button. A first-focusable skip link jumps to the game region.
- **Primary action** (`.primary-button`, `#start`): one green action changes among Play now, Resume flight, and Play again. Hover darkens its fill; focus has a visible blue outline; active scales to 0.96 only when reduced motion is not requested.
- **Icon control** (`.icon-button`): currentColor inline SVG, explicit accessible label, optional `aria-pressed` for sound. Pause is natively disabled before play and after a collision. It becomes Resume while paused.
- **Score group** (`.stats`, `.stat`, `.results`): label plus tabular number. Results explicitly display final score and personal best. A persistent polite live region announces starts, pauses, and results; it does not announce every animation frame.
- **Playfield** (`#game-view`, `.flap-control`): canvas is decorative to the accessibility tree; a native button over it supplies keyboard and pointer input with an instructional accessible name. The focus outline is inset 6px so it stays inside the scene.
- **Overlay state** (`.game-overlay`, `.ready-overlay`, `.panel-overlay`): HTML text and controls remain independent of canvas drawing. Replay/resume receives focus when the game stops. The score resets only on a new flight.
- **Flight-school dialog** (`#help-dialog`): native modal, named heading, explicit close and Got it buttons, Escape support, and focus returned to How to play. Opening it pauses play and closing it leaves the flight paused.
- **Instruction tip** (`.tip`, `.tip-icon`): three explanatory articles with consistent icon, heading, and compact body. They become one column on mobile.
- **Storage notice** (`#storage-note`): persistent inline explanation when browser storage is unavailable. Gameplay and session records still work.

Icons share 24×24 viewboxes and 1.8px currentColor strokes; play is filled. Motion is limited to 120ms button background/press transitions with the specified 0.96 press scale. Essential flight motion begins only through the Play action. Reduced motion removes decorative drift and rotation as well as button transitions.

## Do's and Don'ts

- Reuse `.wrap`, the semantic surface/text tokens, local font faces, and the existing icon treatment for any additional page.
- Keep one filled green primary action per state. Secondary controls remain outlined or neutral.
- Keep user-facing instructions and results in HTML, with native buttons and visible keyboard focus.
- Protect small text over illustration with an opaque background; do not assume a light sky will stay behind it at every width.
- Allow toolbar/header wrapping and use a growing scene height when adding text. Do not reintroduce a fixed-height text container.
- Keep score motion essential and decoration optional. Do not add idle animation or a second theme without a product need and a fresh review.
- A new page can reuse the header, `.wrap`, heading/body roles, and primary-action pattern, but this game's exact hero/scene composition is not a universal page template.
