# IVAI HVAC — 89-Second Cinematic Cut · Edit Decision List (EDL)

Build-ready assembly spec for the single combined 89s commercial. Timecodes are the
canonical timeline from `src/hvac-video.jsx` (`HVAC_TIMELINE`, total **1:29.83 ≈ 89.83s**,
the "Normal · 89s" pacing). Map each beat to the clips that already exist in the
**Higgsfield** workspace and the **Descript** project *"HVAC Lead-Response Optimization
Script"* (`bc3fae11-48e3-41d5-841f-80a1e45dfccc`).

> Status: the polished auto-assembly (mute clip audio + synced captions + transitions +
> brand card) needs Descript's AI editor, which was **out of credits** at build time.
> This EDL is the hand-off so the cut can be finished in one pass when credits return —
> or executed manually in any NLE (Premiere/Resolve/CapCut/Descript).

## Master spec
- **Canvas:** 1920×1080 (16:9), 30 fps
- **Total:** 89.83 s (acceptable 87–90 s)
- **Voice bed:** `ElevenLabs_2026-05-31T08_50_52_Adriana — IVAI Host …mp3` (84.11 s) — the
  single continuous narration. **First spoken word lands at t=4.00s** (logo cold-open first).
- **Clip audio:** **MUTE every video clip.** The Adriana VO owns all sound
  (mirrors `window.__hvacS1VO = false` in `hvac-video.jsx`). Optional soft music bed
  (one of the 30 s tracks) at ≈ −22 dB under the VO.
- **Vertical (9:16) clips:** scale-to-fill the 16:9 frame (no pillarbox bars).
- **Captions:** burned-in, bottom-center, bold sans (Inter), synced to the VO. Source text =
  `IVAI_HVAC_Captions.srt`.
- **Blend window 28–48 s:** cross-dissolve scene cuts (no hard-cut flash) so the
  talking-head math segment stays stable — per the `HVAC_BLEND_WINDOW` note in the JSX.

## Source clip inventory (HVAC only — excludes the JT Hair Salon + Mother's Day spots)

| Tag | Content | Dur | Aspect | Higgsfield gen id | Descript media name |
|-----|---------|-----|--------|-------------------|---------------------|
| OPEN-LIP | Lip-synced "You are spending money…" (twirl + walk to camera) | 8 | 16:9 | `2cc6f26b` (kling edit); voiced `68482d06` | `scene 1.mp4`, `first scene.mp4`, `hf_…68482d06….mp4` |
| OWNER-A | 15 s owner clip (from `IVAI-HVAC-Owner` ref) | 15 | 16:9 | `bcc7789b` (voiced `9000e5b8`) | `scene 2.mp4` / `scene 2-1.mp4` |
| OWNER-B | 15 s owner clip | 15 | 16:9 | `ed68fbb0` (voiced `be1e3baf`) | `scene 3.mp4` / `scene 3-1.mp4` |
| OWNER-C | 15 s owner clip | 15 | 16:9 | `ff0dd2e6` (voiced `967e74c3`) | `scene 4.mp4` / `scene 4-1.mp4` |
| OWNER-D | 15 s owner clip | 15 | 16:9 | `d5d1c687` (voiced `ced6bc06`) | `some scene.mp4` / `ya.mp4` |
| RIGHTNOW-LIP | Lip-synced "Right now… a homeowner's AC just quit… they call the next company" | 8 | 16:9 (ultra-wide) | `a4c756a3` (ref) / `fe828ddf` (9:16) | — |
| HAIRFLIP | wan2_7 talking head, hair-flip open, fleet of vans, has VO | 8 | 16:9 | `fa15f684` | `scene 2 hvac.mp4` |
| YARD-TH | wan2_7 talking head in service yard, fleet behind, has VO | 8 | 16:9 | `a57ab627` | — |
| BUILD-EST | Owner arms-crossed in front of IVAI building + white fleet, slow push-in | 8 | 9:16 | `8acf1d3e` | — |
| PHONE-BROLL | Dispatch desk: phone rings → missed call → voicemail, **no people** | 6 | 9:16 | `a95ab2b8` / `63682ea1` | — |
| WALK | Owner unfolds arms, confident walk toward camera, IVAI trucks | 8 | 9:16 | `df1474e8` / `2d216f24` | — |
| VO | Adriana narration | 84.11 | audio | — | `ElevenLabs_…Adriana — IVAI Host…mp3` |
| LOGO | Brand mark / end slate | still | 16:9 | — | `logo asset.png` + repo `IVAI_HVAC_EndSlate_horizontal_1920x1080.png` |

CDN base for Higgsfield results: `https://d8j0ntlcm91z4.cloudfront.net/user_3EHtJDt4KGPk48Od9RCZHN1zBF1/`
(e.g. `hf_20260530_031409_2cc6f26b-469d-4a3c-8e4f-28fe16a4b15c.mp4`).

## The cut (11 beats → 89.83 s)

| # | Beat | In | Out | Dur | Primary clip | VO line | On-screen caption | Transition |
|---|------|----|-----|-----|--------------|---------|-------------------|------------|
| 1 | intro | 0.00 | 4.00 | 4.00 | LOGO (dark, pillars animate in) | — (silent) | — | cold open → soft cut |
| 2 | hook | 4.00 | 12.33 | 8.33 | OPEN-LIP | "You're spending money every month just to make your phone ring." | hook line | cut |
| 3 | channels | 12.33 | 17.44 | 5.11 | BUILD-EST or OWNER-A (head) | "Google ads. Local service ads. Yard signs. Door hangers. Social." | channels list | cut |
| 4 | unanswered | 17.44 | 23.86 | 6.42 | **PHONE-BROLL** (scale-to-fill) | "And when that phone finally rings — nobody picks up." | "…nobody picks up." | cut → dip |
| 5 | money | 23.86 | 28.07 | 4.21 | YARD-TH (emphasis) | "That's not a marketing problem. That's a MONEY problem." | "That's a **MONEY** problem." | hard cut |
| 6 | math | 28.07 | 44.10 | 16.03 | OWNER-B → OWNER-C (cross-dissolve, **blend window**) | "The average HVAC company misses 30% of inbound calls… every missed call costs you the lead spend PLUS the job… $80 to $450, gone, every time nobody answers." | running stat captions ($400 ticket · $30–50/lead · $80–450 lost) | cross-dissolve, no flash |
| 7 | competitor | 44.10 | 54.69 | 10.59 | WALK + OWNER-A | "Your competitor's truck is pulling into that driveway. YOUR trucks are sitting. YOUR techs are waiting. YOUR schedule has gaps." | "YOUR trucks / techs / schedule" | cut on beats |
| 8 | afterhours | 54.69 | 64.16 | 9.47 | RIGHTNOW-LIP (+ tail of OWNER-D) | "HVAC emergencies don't happen at 9am. They happen at 10 at night. In July. 104°, and a family's AC just died. No answer? They call the next company." | "They call the next company. Every time." | cut |
| 9 | evolve | 64.16 | 75.66 | 11.50 | OWNER-D → HAIRFLIP (confident) | "Evolve AI Agents from Intelligent Voice AI answers every call. Books the job. Dispatches your tech. And handles follow-up for every missed lead — 24/7." | "Answers every call. Books the job. 24/7." | uplift cut, green accent |
| 10 | outcomes | 75.66 | 82.82 | 7.16 | WALK (`2d216f24`) / OWNER-C tail | "Your trucks stay busy. Your techs stay productive. Your revenue stops leaking." | "Revenue stops leaking." | cut |
| 11 | end | 82.82 | 89.83 | 7.01 | LOGO end slate | "Visit getivai.com/hvac. Stop paying for leads your phone never answers." | **getivai.com/hvac** · "Stop paying for leads your phone never answers." | fade to brand card |

## Audio plan
1. Lay VO (`ElevenLabs …Adriana…mp3`) on its own track, head at **t=4.00s**.
2. Mute all 11 video segments.
3. (Optional) music bed at −22 dB, ducking −6 dB under VO; fade out over beat 11.
4. Total VO ≈ 84.1 s + 4.0 s lead-in ≈ 88.1 s of speech; tail silence to 89.83 s on the card.

## Finishing in Descript once AI credits return
1. Open project `bc3fae11-48e3-41d5-841f-80a1e45dfccc`.
2. New composition **"IVAI HVAC — 89s Cinematic Cut"** (1920×1080) — keep the existing 74 s comp untouched.
3. Run the editor agent with the prompt in `IVAI_HVAC_89s_build_brief.txt` (this folder), or
   hand-place the 11 beats above.
4. Publish → Video → 1080p for the shareable link.

## Note on the existing draft
`IVAI_HVAC_draft_90s.mp4` (89.9 s) is already rendered inside the Descript project and is the
fastest shareable artifact — Share/Export it directly from Descript. This EDL exists so the
*next* revision can be rebuilt cleanly and consistently.
