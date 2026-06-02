# IVAI HVAC 90s — Composition Snapshots (reference only)

Browser snapshots of the `IVAI HVAC 90s.html` Claude Design project
(title: *"IVAI · HVAC · Cinematic 16:9"*, ~1:42 runtime). **Reference material
only — these are not the editable source.**

## Files

| File | What it is |
|------|------------|
| `IVAI_HVAC_90s_snapshot_t0010.mhtml` | Full MHTML page archive (frame near t=00:10). |
| `IVAI_HVAC_90s_snapshot_t0056.mhtml` | Full MHTML page archive (frame near t=00:56). |
| `rendered_frame_t0008.html` | Extracted rendered DOM, ~t=00:08. |
| `rendered_frame_t0010.html` | Extracted rendered DOM, ~t=00:10. |
| `rendered_frame_t0056.html` | Extracted rendered DOM, ~t=00:56. |

## Important

Each file captures the **rendered DOM at a single frozen frame**, not the
composition's editable code. The editable source lives in the Claude Design
project as JSX modules (not retrievable from this environment — the serve host
returns `403 "Host not in allowlist"` under the network policy):

- `hvac-scenes.jsx` — on-screen caption/script text
- `hvac-voice.jsx` — voice-over + lip-sync alignment
- `hvac-cinematic.jsx` — visuals, video layers, transitions
- `hvac-video.jsx`, `animations.jsx` — composition root + player

To change the wording, the 28s–48s talking-head blend, or the lip-sync timing,
edit those modules inside Claude Design directly. Note: the only `gap` tokens in
these snapshots are CSS flexbox `gap:` properties, not the spoken word.
