# IVAI Healthcare Reel — ~45s Vertical · Edit Decision List (EDL)

Build-ready assembly spec for the short-form social reel (Instagram / TikTok).
The composition is rendered deterministically by `src/render.js`
(node-canvas → ffmpeg); this EDL is the human-readable map of the timeline.

## Master spec
- **Canvas:** 1080 × 1920 (9:16), **30 fps**
- **Total:** **45.505 s** (locked to the VO; `-shortest`)
- **Voice bed:** `narration.mp3` — the single continuous Adriana ElevenLabs take
  (45.51 s). Her first word lands at **t = 0.0** (no logo cold-open; chrome fades
  in over her). Clip audio N/A (fully synthetic visuals).
- **Scene cuts land inside measured VO silence** (ffmpeg `silencedetect`,
  noise=-30dB): **16.22 s**, the **31.7–33.9 s** pause (problem→solution pivot),
  and the **39.2–40.6 s** pause (→ CTA).

## The cut (4 scenes → 45.5 s)

| # | Scene | In | Out | Phase | Visual | On-screen overlays |
|---|-------|----|-----|-------|--------|--------------------|
| 1 | **Hook** | 0.00 | 16.30 | problem (amber) | Adriana at the IVAI reception desk (`proc_desk`, Ken-Burns push-in) + "EVERY MISSED CALL IS A LOST PATIENT." | `25` **MISSED CALLS / MONTH** (5.4–11.0) · `$150,000` **WALK OUT THE DOOR / YEAR** (11.2–16.1) |
| 2 | **The cost** | 16.30 | 32.80 | problem (amber) | Messy front office (`proc_messy`, red grade) + leak graph → **dissolve** to Adriana in the hallway (`proc_walk`) | `35%` **OF PATIENT CALLS UNANSWERED** (17.6–23.8) · `$135,000` **IN LOST REVENUE / YEAR** (24.2–31.5) |
| 3 | **IVAI solves** | 32.80 | 40.00 | solution (green) | Green "Confirmed Appointments" hallway (`proc_dash`) + booking toasts (✓ booked) | **BOOKS APPOINTMENTS INTO ATHENA · KAREO** (33.2–37.0) · `$41,800` **RECOVERED REVENUE** (37.2–39.9) |
| 4 | **CTA / end-slate** | 40.00 | 45.51 | solution (green) | Adriana + colleague — "THE TEAM THAT NEVER MISSES A CALL" (`proc_walk`) → **dissolve** to IVAI. end-slate | amber pill **GetIVAI.com/healthcare** (42.0→) |

All 7 brief overlays are covered, in the brief's listed order:
`25 missed calls / month` → `$150,000 / year` → `35% unanswered` →
`$135,000 / year` → `Books into Athena / Kareo` → `Recovered $41,800` →
`GetIVAI.com/healthcare`.

## Brand system (from `../hvac-90s` end-slate)
- Navy `#081325`/`#0b2138`, amber `#f5a623`, green `#27d17c`, alarm red `#ff5d63`.
- Display: **Anton** (numbers/headlines), **Bebas Neue** (IVAI wordmark),
  **Oswald** (labels), **Inter** (body). Amber = problem phase, green = solution.

## Cinematic treatment
- Drifting radial glow (amber→green by phase), parallax grid, animated voice
  waveform, film grain + vignette, count-up number reveals, soft white cut-flash
  on each beat, pulsing CTA pill. Motion is physically eased (cubic / easeInOut) —
  no hard pops except the intentional beat cuts.

## Re-render
```bash
cd assets/healthcare-45s
npm install            # @napi-rs/canvas
bash src/build.sh      # → out/IVAI_Healthcare_Reel_vertical_1080x1920.mp4
# QA stills:  node src/render.js --stills 5,8,13,20,28,35,38.5,43
```

## Dropping in Adriana / AI b-roll later (when Higgsfield credits allow)
`src/render.js` auto-detects `host1.{png,jpg}` (Hook) and `host2.{png,jpg}`
(IVAI-solves) in the project root and composites them as graded, slow-push-in
backdrops behind the graphics. For the brief's true lip-synced talking-head +
360° orbit, generate the clip via Higgsfield (Seedance 2.0 / Kling 3.0, 9:16,
audio = `narration.mp3` segment) and slot it under Scene 1 in any NLE, keeping
this overlay/caption track on top.
