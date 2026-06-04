# IVAI Healthcare Reel — ~45s vertical (9:16)

Short-form social reel (Instagram / TikTok) for **Intelligent Voice AI (IVAI)**
healthcare automation, hosted by Adriana. Built to the same brand system as
`../hvac-90s`: deep navy, amber accent, green highlights, condensed display type.

## Format
- **1080 × 1920 (9:16), 30 fps**
- Runtime locked to the supplied Adriana voiceover (**45.5 s**, ElevenLabs).
- Master audio = `narration.mp3` (single continuous VO; clip audio muted).

## Pipeline (no AI-generation credits required)
The cinematic composition is rendered **deterministically in code** — a
`node-canvas` (Cairo) frame renderer driving `ffmpeg` for encode + audio mux.
This mirrors the repo's established fallback when Higgsfield/Descript credits
are unavailable. Optional photoreal host shots (Adriana) and AI b-roll can be
composited in later by Higgsfield gen-id when credits allow.

- `src/render.js` — frame renderer (brand system, 4-scene timeline, Ken-Burns,
  animated stat overlays, synced captions, end-slate).
- `src/build.sh` — runs the renderer → encodes `IVAI_Healthcare_Reel_*.mp4`.
- `IVAI_Healthcare_45s_EDL.md` — edit decision list (beats → timecodes → overlays).
- `IVAI_Healthcare_Captions.srt` — timed on-screen captions (synced to the VO).

## On-screen overlays (from the brief)
`25 missed calls / month` · `$150,000 / year` · `35% unanswered` ·
`$135,000 / year` · `Books into Athena / Kareo` · `Recovered $41,800` ·
`GetIVAI.com/healthcare`

## Photos (host build)
The reel features Adriana's real IVAI photos via cinematic Ken-Burns motion.
Source frames live in `broll/` (git-ignored) as `proc_*.png`, 1188×2112 cover-crops:
- `proc_desk` — Adriana at the IVAI reception desk → **Scene 1 (host)**
- `proc_messy` — chaotic paper-stacked front office → **Scene 2 (the problem)**
- `proc_walk` — Adriana + colleague in the green hallway → **Scene 2 blend + Scene 4 close**
- `proc_dash` — green hallway with the "Confirmed Appointments" screen → **Scene 3**

Note: the figures are stills with camera (Ken-Burns) motion — not generative
subject motion. True walking/high-five animation or a lip-synced talking head
needs Higgsfield image-to-video (credits).

## Status
**Delivered.** `out/IVAI_Healthcare_Reel_vertical_1080x1920.mp4` — 1080×1920,
30 fps, 45.5 s, all 7 stat overlays + the real photos + IVAI end-slate over the
Adriana VO. Rebuild any time with `bash src/build.sh`.
