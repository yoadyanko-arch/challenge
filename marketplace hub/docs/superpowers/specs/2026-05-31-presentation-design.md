# Marketplace Hub Presentation — Design Spec
Date: 2026-05-31

## Overview
Convert the existing 3-page one-pager (`Marketplace_Hub_One_Pager_3p_v3`) into a single HTML presentation file with 13 slides in 16:9 format. Reuses all existing visual assets: SVG illustrations, brand colors, card components.

## Output
Single file: `Marketplace_Hub_Presentation_v1.html`

## Slide Structure (13 slides)

| # | Type | Content |
|---|------|---------|
| 1 | Gate | Marketplace Hub |
| 2 | Content | Vision |
| 3 | Content | Problem + Solution (2-col) |
| 4 | Content | Ecosystem (4 cards) + Services (6 cards) |
| 5 | Gate | מודל כלכלי |
| 6 | Content | Model 1 — Referral Commission (full card + SVG) |
| 7 | Content | Model 2 — Hub Package (full card + SVG) |
| 8 | Content | Model 3 — Revenue Share (full card + SVG) |
| 9 | Content | Model 4 — Success Fee (full card + SVG) |
| 10 | Gate | תוכנית פעולה |
| 11 | Content | Stages 1–2 (2-col grid) |
| 12 | Content | Stages 3–4 (2-col grid) |
| 13 | Content | Stages 5–6 (2-col grid) |

## Visual Design

### Dimensions
- 1280×720px (16:9)
- Body background: `#D6CBC3` (same as one-pager)
- Slide box-shadow: same as one-pager page

### Gate Slides
- Full `--burg-deep` (#5E1228) background
- Section name centered: ~3rem, weight 900, white
- Thin `--rose` horizontal line beneath name
- Subtle radial gradient overlay (rose, low opacity)
- No header, no navigation counter distraction

### Content Slides
- Header: 52px tall — logo badge + divider + section title + pill label (same as one-pager)
- Top accent bar: 5px gradient
- Content area: flex column, adapted from one-pager sections
- Economic model slides: single `.mc` card centered/expanded, full SVG illustration
- Action plan slides: 2-col grid with 2 `.sc` stage cards side by side
- General slides: adapted vision box, problem/solution 2-col, eco+services grid

### Brand Tokens (unchanged)
```
--burg: #8B1C3C  --burg-deep: #5E1228  --rose: #C2305A
--cream: #F5EDE8  --bg: #F9F5F1  --card: #FFFFFF
--text: #160810  --mid: #4A253A  --muted: #8A6070  --border: #E0CCC4
```

## Navigation

### Keyboard
- `ArrowRight` or `ArrowDown` → next slide
- `ArrowLeft` or `ArrowUp` → previous slide

### Buttons
- Two arrow buttons, bottom-left and bottom-right corners
- 36×36px, semi-transparent burg background, white chevron icon
- Hidden on gate slides or styled differently

### Slide Counter
- Center bottom: `N / 13` in small muted text
- Hidden on gate slides

## Technical Implementation
- Single HTML file, no external dependencies except Google Fonts (Rubik)
- All slides as `<div class="slide" data-index="N">` inside a `.deck` container
- Active slide: `opacity:1; pointer-events:auto` — others: `opacity:0; pointer-events:none`
- Instant transition (no animation) for clean presentation feel
- JS: ~20 lines — keydown listener + button click handlers + counter update
- Print-friendly: `@media print` shows all slides as separate pages
