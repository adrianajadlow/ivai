# IVAI Medical Intro — Design System

*Generated from index.html CSS custom properties. Updated 2026-05-17.*

## Brand Identity (`:root` CSS variables)

```css
:root {
  /* === IVAI Brand Identity === */
  --bg: #010534;                  /* Dark Navy (background) */
  --ink: #ffffff;                 /* Off-white (primary text) */
  --accent: #0062ff;              /* IVAI Blue (stats, accents, CTAs) */
  --accent-light: #4d9fff;        /* Light Blue (secondary accent) */
  --muted: #8892b0;               /* Medium gray (body text, muted) */
  --muted-dark: #3d4a5c;          /* Dark gray (borders, sub-text) */
  --font-display: "Inter", sans-serif;          /* Headlines */
  --font-data: "JetBrains Mono", monospace;     /* Stats, numbers */
}
```

### Color usage

| Color | Hex | Usage |
|-------|-----|-------|
| **IVAI Dark Navy** | `#010534` | Full-screen background |
| **IVAI Blue** | `#0062ff` | Stat numbers, accent text, dividers, CTAs |
| **Light Blue** | `#4d9fff` | Secondary accents, URL in CTA |
| **Off-white** | `#ffffff` | Primary headlines, body text |
| **Medium Gray** | `#8892b0` | Body copy, secondary text |
| **Dark Gray** | `#3d4a5c` | Dividers, subtle text |

### Typography

**Display font:** Inter
- **Headlines:** 72px, weight 700 (`.display`)
- **Extra-large:** 120px, weight 900 (`.display-xl` — for hero and brand close)
- **Stat numbers:** 180px, weight 900 (`.stat-number`)
- **Body text:** 36px, weight 500 (`.body-text`)
- **Stat labels:** 48px, weight 400 (`.stat-label`)
- **Data text:** 28px, monospace, weight 400 (`.data-text` — for sub-text on stats)

**All text:** sans-serif, high contrast on dark background. Minimum size 28px (data labels) for screen readability at video playback distance.

## Visual effects

### Grain

- Radial-gradient noise overlay (opacity 12%)
- Applied to every scene for texture
- Mix-blend-mode: `overlay` (cinema-grade, not cartoonish)
- Prevents flat digital look on stat cards

### Vignette

- Radial gradient ellipse from transparent center → dark edges
- Opacity 60% (subtle, doesn't dominate)
- Draws focus to center content

### Glow (accent)

- Soft radial gradient circles positioned behind content
- Radius 400–600px
- Opacity animates 0.2 → 0.4 → 0.2 during scene hold
- Color: IVAI Blue at 30% opacity (not blown-out)
- Positioned strategically per scene (top-left pain scenes, bottom-right solution scenes)

## Animation timing

### Entrance tweens (all scenes)

- **Offset first tween:** 0.2–0.3s into scene start (no jump-cut feel)
- **Stagger:** 0.3–0.5s between elements
- **Duration:** 0.5–0.8s per element
- **Ease:** mix of `power3.out` (snappy), `power2.out` (smooth), `expo.out` (dramatic)

### Mid-scene activity patterns

| Pattern | Duration | Ease | Scenes |
|---------|----------|------|--------|
| **Glow pulse** | 3–4s | sine.inOut | All stat cards |
| **Breathing float** | 1.5s (yoyo, repeat 1) | sine.inOut | Accent text (scenes 8, 12) |
| **Counter animation** | 1.5–2.5s | power2.out | Dollar amounts (scenes 5, 11) |

### Shader transitions (4 total)

| Transition | From→To | Shader | Duration | Mood |
|-----------|---------|--------|----------|------|
| 1 | Pain stat → Pain stat | cinematic-zoom | 0.5s | Clinical, zooming in on problem |
| 2 | Pain narrative → Hero reveal | cross-warp-morph | 0.5s | Transformation moment |
| 3 | Solution narrative → Result stat | whip-pan | 0.5s | Fast-paced, energetic |
| 4 | Relief narrative → CTA brand | flash-through-white | 0.4s | Bright closing moment |

## Scenes at a glance

### Pain block (scenes 1–3, 6: ~18s total)

**Goal:** Establish the problem with specificity and empathy.

- Scene 1: Hook question (4s) — slow, deliberate entrance
- Scene 2: "The phones never stop" (3.5s) — urgent but measured
- Scene 3: "Missed calls" (3s) — tight, repetition for emphasis
- [Stat Card 1: 15–30% no-show rate (4s) — shader zoom]
- [Stat Card 2: $150K–$300K lost (4s) — shader in/out]
- Scene 6: "Your team is drowning" (3.5s) — empathetic close to pain block

**Pacing strategy:** Each line shorter than the last (4s → 3.5s → 3s) to accelerate urgency.

### Turn (scene 7: 3s)

**Goal:** Signal the transformation.

- Accent color on "Then I found"
- Clean, minimal layout
- No glow (visual reset before hero reveal)

### Solution block (scenes 8–9: ~8.5s total)

**Goal:** Introduce IVAI and its core functions.

- Scene 8: Hero reveal with shader (4.5s) — "Your AI front desk" with HIPAA/SOC 2 subtitle
- Scene 9: Verb cascade (4s) — Answer. Book. Remind. Bill. (staggered entrance for rhythm)

**Pacing strategy:** Slow on hero (let it breathe), then snap verbs in rapid succession.

### Result block (scenes 10–11: ~8.5s total)

**Goal:** Prove the impact with hard numbers.

- [Stat Card 3: 75% fewer no-shows (4.5s) — shader in/out, counter animation]
- Scene 11: +$215K Year 1 (4s) — tangible revenue proof, counter animation

**Pacing strategy:** Generous hold time (4–4.5s per stat) to let numbers sink in.

### Relief (scene 12: 4s)

**Goal:** Emotional resolution.

- "My team is back to what matters."
- Subtitle: "Our patients." (in muted text, accent blue on "matters")
- Breathing float on key phrase

### CTA (scene 13: 5s)

**Goal:** Brand close and call-to-action.

- Center-aligned, large type
- Wordmark: "Intelligent Voice AI"
- Tagline: "Your AI front desk. Always on. Never tired."
- URL: "GetIVAI.com" (accent blue, largest font on screen)
- Soft glow pulse behind text
- Shader flash-through-white (bright, optimistic close)

## Asset checklist

### Essential (before render)

- [ ] VO audio track (60s, Adriana's HeyGen clone)
- [ ] Ambient music bed (optional but recommended)
- [ ] SFX (phone ring, stat reveal "ding") — optional

### Nice to have (for visual richness)

- [ ] B-roll: overwhelmed front desk (3–5s clips for scene 2)
- [ ] B-roll: frustrated staff (2–3s clips for scene 3)
- [ ] B-roll: calm, organized office (3–5s clips for scene 8)
- [ ] B-roll: staff with patients (2–3s clips for scene 12)
- [ ] Logo animation: IVAI wordmark fade-in (for scene 8 or 13)
- [ ] Stat card background variation (optional — current flat color is clean)

## Next refinements (Claude Code)

### Animation

- **Scene 9 verbs:** Add character-by-character stagger so each letter animates individually (more engaging than full-word entrance)
- **Scene 10 stat:** Ken Burns zoom (scale 1 → 1.05 during hold) for cinema feel
- **Scene 4–5 transition:** Tighten counter animation to 1.5s (faster, snappier)

### Timing

- **Pain block:** Consider trimming scenes 1–3 total from 10.5s to 9.5s (feels slightly slow in playback)
- **Stat cards:** Verify 4s hold is sufficient — may need 4.5s for older audience to absorb numbers

### Styling

- **Divider width:** Currently 60px — test at 80px or 120px for more visual impact
- **Glow size:** Currently 400–600px — could increase to 700px on final stat cards for bolder finish
- **Font smoothing:** Add `-webkit-font-smoothing: antialiased` on headlines for pixel-perfect rendering

### Content

- **Scene 5 stat:** Consider adding small footnote: "($150K–$300K per physician annually)"
- **Scene 12 relief:** Could add optional second line: "That's what Intelligent Voice AI gives us back."

## Compliance & attribution

- **Stats:** All numbers sourced to Medical_Stats_for_Commercial.md, which traces to Shannon's whitepapers
- **Voice:** Adriana's HeyGen clone (bb1ceb3a38ff449c954f241b122c0dba)
- **Brand alignment:** Colors, typography, tone all match IVAI_Brand_Guide.md (v1.0, April 2026)
- **HIPAA/SOC 2:** Labeled as "HIPAA-compliant · SOC 2 secure" (not claimed without qualification)

---

**Skeleton source:** Skeleton C (Product Explainer, 1920×1080, 45–60s)

**Template location:** `/heygen-com/hyperframes/blob/main/docs/guides/claude-design-hyperframes.md`

**Updated:** May 17, 2026