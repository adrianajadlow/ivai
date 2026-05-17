# IVAI Medical Intro

A HyperFrames video composition for Intelligent Voice AI's healthcare B2B intro. Plain HTML + GSAP; rendered to MP4 by the `hyperframes` CLI.

**Specs:**
- **Duration:** 60 seconds
- **Resolution:** 1920×1080 (16:9 landscape)
- **Scenes:** 13
- **Voice:** Adriana's HeyGen voice clone (bb1ceb3a38ff449c954f241b122c0dba)
- **Audio:** Soft ambient pad (to be added)

## Requirements

- **Node.js 22+** — [nodejs.org](https://nodejs.org/)
- **FFmpeg** — `brew install ffmpeg` (macOS) or `sudo apt install ffmpeg` (Debian/Ubuntu) or [ffmpeg.org/download](https://ffmpeg.org/download.html) (Windows)

Verify: `npx hyperframes doctor`

## Preview

```bash
npx hyperframes preview
```

Opens the HyperFrames Studio at `http://localhost:3002` with frame-accurate scrubbing, live timeline scrubbing, and full composition playback.

## Structure

### Scene breakdown

| # | Scene | Duration | Type | Content |
|---|-------|----------|------|----------|
| 1 | Opener | 4s | Hard cut | Hook: "If you run a medical office..." |
| 2 | Pain #1 | 3.5s | Hard cut | "The phones never stop." |
| 3 | Pain #2 | 3s | Hard cut | "Missed calls." |
| 4 | Stat #1 | 4s | Shader out | 15–30% no-show rate |
| 5 | Stat #2 | 4s | Shader in/out | $150K–$300K lost/physician |
| 6 | Pain #3 | 3.5s | Hard cut | "Your team is drowning in admin." |
| 7 | Turn | 3s | Hard cut | "Then I found Intelligent Voice AI." |
| 8 | Hero | 4.5s | Shader in/out | "Your AI front desk." (solution reveal) |
| 9 | Verbs | 4s | Hard cut | Answer. Book. Remind. Bill. |
| 10 | Result #1 | 4.5s | Shader in/out | 75% fewer no-shows |
| 11 | Result #2 | 4s | Hard cut | +$215K Year 1 revenue |
| 12 | Relief | 4s | Hard cut | "My team is back to what matters." |
| 13 | CTA | 5s | Shader in (final) | Brand close: GetIVAI.com |

### Animation patterns used

- **Entrance tweens** — all scenes have `tl.from()` with staggered y-offsets
- **Counter animations** — dollar amounts animate from 0 (scenes 5 & 11)
- **Glow pulses** — soft radial glows on key stat cards (opacity breathing)
- **Breathing float** — accent text drifts up/down slightly (scenes 8, 12)
- **Scale zoom** — stat numbers scale from 0 (expo.out)

### Shader transitions (4 total)

1. **s4→s5** (`cinematic-zoom`, 0.5s) — pain stat progression
2. **s7→s8** (`cross-warp-morph`, 0.5s) — turn to hero reveal
3. **s9→s10** (`whip-pan`, 0.5s) — solution to result
4. **s12→s13** (`flash-through-white`, 0.4s) — relief to final CTA

## Refine with Claude Code

This project was drafted in Claude Design. To polish animations, timing, and pacing:

```bash
npx hyperframes lint                     # verify structure (should pass with zero errors)
npx hyperframes preview                  # open the studio for live feedback
```

Then open in Claude Code and iterate:

- "Make the stat counters snappier — animate from 0 to target in 1.5s instead of 2.5s."
- "Scene 6 feels slow; trim to 3s."
- "Add character stagger to the 'Answer. Book. Remind. Bill.' verbs so each letter enters one by one."
- "Change the shader on transition 2 from cross-warp-morph to ripple-waves."
- "The pain block (scenes 1–3) needs more energy — add faster pacing and tighter cuts."
- "Add a smooth zoom-in (scale: 1 → 1.05) on the stat numbers for Ken Burns effect."

## Render

```bash
npx hyperframes render index.html -o output.mp4
```

1920×1080 / 30fps by default. Use `--fps 60` or `--resolution 3840x2160` to override.

## Audio workflow

1. **Record VO** in HeyGen using Adriana's voice clone, or use existing audio file
2. **Export audio track** as WAV or MP3
3. **Add to composition** via an `<audio>` element with data attributes
4. **Test sync** in the preview studio with timeline scrubbing
5. **Render with audio** — the CLI mixes automatically

## Brand colors

- **IVAI Dark Navy** — `#010534` (background)
- **IVAI Blue** — `#0062ff` (accent, stats, CTAs)
- **IVAI Light Blue** — `#4d9fff` (secondary accent)
- **Neutral Dark** — `#3d4a5c` (muted text, borders)
- **Off-white** — `#ffffff` (primary text)

## Files

- `index.html` — main composition (HTML + inline CSS + GSAP timeline)
- `preview.html` — browser player wrapper (copy verbatim, do not edit)
- `README.md` — this file
- `DESIGN.md` — brand identity reference (auto-generated from CSS custom properties)

## Notes for next iteration

### Visual assets to source

- B-roll footage for pain scenes (overwhelmed front desk, ringing phones, etc.)
- B-roll for solution scenes (calm office, staff with patients, etc.)
- Optional: logo animations or brand icon reveals

### Audio to add

- **VO:** 60s script recorded with Adriana's HeyGen clone
- **Music bed:** soft ambient pad, ducked under VO (suggest Epidemic Sound library: ambient/medical-adjacent)
- **SFX:** subtle phone ring at scene 2, satisfying "ding" at stat reveals (optional)

### Timing refinements

- Scene 1 opener currently 4s — could trim to 3.5s if pacing feels slow in preview
- Stat card durations (scenes 4, 5, 10) — verify 4s is long enough for viewer to read and absorb
- Verify shader transitions don't overlap with exit animations (currently clean)

### Copy refinements

- Scene 5: Consider adding a second line under "$150K–$300K" such as "annually, in inefficiencies" for clarity
- Scene 9: The four verbs could benefit from a brief hold after each entrance before the next one enters (increase stagger time)

## Compliance

- ✅ All stats sourced to IVAI whitepapers (Medical_Stats_for_Commercial.md)
- ✅ HIPAA and SOC 2 labeled as "compliant" (not claimed without qualification)
- ✅ Case study numbers (75%, $215K, 30%→7.5%) trace to CA medical clinic source
- ⚠️ Audio and B-roll assets pending — verify they align with brand tone (warm, specific, credible; not salesy)
