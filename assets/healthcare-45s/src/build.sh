#!/usr/bin/env bash
# Build the IVAI Healthcare reel: render frames in Node, mux the Adriana VO via ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules/@napi-rs/canvas ] && [ ! -d node_modules/canvas ]; then
  echo "Installing canvas backend…"; npm install
fi
if [ ! -f narration.mp3 ]; then
  echo "ERROR: narration.mp3 (the Adriana VO) is missing from this folder." >&2; exit 1
fi

echo "Rendering 1080x1920 @ 30fps, locked to narration.mp3…"
node src/render.js
echo "Done → out/IVAI_Healthcare_Reel_vertical_1080x1920.mp4"
