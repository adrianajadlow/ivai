/* IVAI Healthcare Reel — cinematic renderer (node-canvas + ffmpeg), PHOTO build.
 * 1080x1920 (9:16), 30fps, ~45.5s, locked to narration.mp3.
 * Features Adriana's real IVAI photos (Ken-Burns) per the client's scene direction:
 *   S1 host at the reception desk → S2 problem (messy office) blends to the hallway →
 *   S3 stats / confirmed appointments → S4 "the team" → text end-slate.
 *
 * Usage: node src/render.js            (full render)
 *        node src/render.js --stills 3,9,14,20,28,35,38,41,44
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let CV, GlobalFonts, loadImage, createCanvas;
try { CV = require('@napi-rs/canvas'); createCanvas = CV.createCanvas; GlobalFonts = CV.GlobalFonts; loadImage = CV.loadImage; }
catch (e) { CV = require('canvas'); createCanvas = CV.createCanvas; loadImage = CV.loadImage; }

const ROOT = path.join(__dirname, '..');
const FONTS = path.join(ROOT, 'fonts');
function regFont(file, family) { const p = path.join(FONTS, file); if (!fs.existsSync(p)) return; if (GlobalFonts) GlobalFonts.registerFromPath(p, family); else CV.registerFont(p, { family }); }
regFont('Anton-Regular.ttf', 'Anton'); regFont('BebasNeue-Regular.ttf', 'Bebas');
regFont('Oswald-Bold.ttf', 'Oswald'); regFont('Inter-Variable.ttf', 'Inter');

const W = 1080, H = 1920, FPS = 30;
const AUDIO = path.join(ROOT, 'narration.mp3');
const DUR = 45.505, FRAMES = Math.round(DUR * FPS);
const STAT_YC = Math.round(H * 0.735);

const C = {
  bg0: '#081325', bg1: '#0b2138', panel: '#0c2742',
  white: '#eef4fb', mute: '#9fb4ce', amber: '#f5a623', green: '#27d17c', red: '#ff5d63', teal: '#37e0c8',
};
const F = { anton: 'Anton', bebas: 'Bebas', oswald: 'Oswald', inter: 'Inter' };

const SCENES = [
  { key: 'hook',  t0: 0.0,   t1: 16.30, phase: 'problem' },
  { key: 'cost',  t0: 16.30, t1: 32.80, phase: 'problem' },
  { key: 'solve', t0: 32.80, t1: 40.00, phase: 'solution' },
  { key: 'cta',   t0: 40.00, t1: DUR,   phase: 'solution' },
];
function sceneAt(t) { for (const s of SCENES) if (t >= s.t0 && t < s.t1) return s; return SCENES[SCENES.length - 1]; }

const OVERLAYS = [
  { id: 'missed',    big: '25',      label: 'MISSED CALLS / MONTH',        t0: 5.4,  t1: 11.0,  tone: 'bad',  count: 25,     pre: '',  post: '' },
  { id: 'lost150',   big: '150,000', label: 'WALK OUT THE DOOR / YEAR',    t0: 11.2, t1: 16.05, tone: 'bad',  count: 150000, pre: '$', post: '' },
  { id: 'unans',     big: '35',      label: 'OF PATIENT CALLS UNANSWERED', t0: 17.6, t1: 23.8,  tone: 'bad',  count: 35,     pre: '',  post: '%' },
  { id: 'lost135',   big: '135,000', label: 'IN LOST REVENUE / YEAR',      t0: 24.2, t1: 31.5,  tone: 'bad',  count: 135000, pre: '$', post: '' },
  { id: 'recovered', big: '41,800',  label: 'RECOVERED · FIRST MONTH',     t0: 37.7, t1: 39.9,  tone: 'good', count: 41800,  pre: '$', post: '' },
];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function lifecycle(t, t0, t1, inD = 0.5, outD = 0.45) { if (t < t0 || t > t1) return 0; return Math.min(easeOut(clamp((t - t0) / inD)), easeOut(clamp((t1 - t) / outD))); }
function hexA(hex, a) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const fmt = n => Math.round(n).toLocaleString('en-US');
function track(ctx, text, x, y, sp) { const prev = ctx.textAlign; ctx.textAlign = 'left'; let cx = x; for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; } ctx.textAlign = prev; return cx - sp - x; }
function trackWidth(ctx, text, sp) { let w = 0; for (const ch of text) w += ctx.measureText(ch).width + sp; return w - sp; }

// ---- photo / cinematics ----
let P = {};
function drawCover(ctx, img, z, panX, panY) {
  const sw = img.width, sh = img.height, base = Math.max(W / sw, H / sh), sc = base * z;
  const dw = sw * sc, dh = sh * sc; ctx.drawImage(img, (W - dw) / 2 + panX, (H - dh) / 2 + panY, dw, dh);
}
function photoLayer(ctx, img, t, t0, t1, dir, tint) {
  if (!img) { ctx.fillStyle = C.bg1; ctx.fillRect(0, 0, W, H); return; }
  const p = clamp((t - t0) / Math.max(0.001, t1 - t0));
  const z = 1.02 + 0.10 * easeInOut(p), span = 64;
  const px = dir === 'left' ? lerp(span, -span, p) : dir === 'right' ? lerp(-span, span, p) : 0;
  const py = dir === 'in' ? lerp(24, -10, p) : lerp(16, -16, p);
  drawCover(ctx, img, z, px, py);
  if (tint === 'red') { ctx.fillStyle = hexA('#3a0d12', 0.36); ctx.fillRect(0, 0, W, H); }
  else if (tint === 'green') { ctx.fillStyle = hexA('#052619', 0.30); ctx.fillRect(0, 0, W, H); }
  else { ctx.fillStyle = hexA(C.bg0, 0.16); ctx.fillRect(0, 0, W, H); }
}
function scrims(ctx) {
  let g = ctx.createLinearGradient(0, 0, 0, 580); g.addColorStop(0, hexA(C.bg0, 0.85)); g.addColorStop(1, hexA(C.bg0, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 580);
  g = ctx.createLinearGradient(0, H - 880, 0, H); g.addColorStop(0, hexA(C.bg0, 0)); g.addColorStop(0.5, hexA(C.bg0, 0.74)); g.addColorStop(1, hexA(C.bg0, 0.95));
  ctx.fillStyle = g; ctx.fillRect(0, H - 880, W, 880);
}
function vignette(ctx) { const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.34, W / 2, H * 0.5, H * 0.82); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function grain(ctx, t) { ctx.save(); ctx.globalAlpha = 0.028; let s = (Math.floor(t * FPS) * 2654435761) >>> 0; const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); for (let i = 0; i < 520; i++) { ctx.fillStyle = rnd() > 0.5 ? '#fff' : '#000'; ctx.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); } ctx.restore(); }

// ---- chrome ----
function wordmark(ctx, x, y, h) { ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.white; ctx.font = `${h}px ${F.bebas}`; const w = trackWidth(ctx, 'IVAI', h * 0.06); track(ctx, 'IVAI', x, y, h * 0.06); ctx.fillStyle = C.amber; const d = h * 0.16; rr(ctx, x + w + h * 0.1, y - d, d, d, d * 0.18); ctx.fill(); }
function chrome(ctx, t, scene) {
  let a = clamp((t - 0.4) / 0.8) * (scene.key === 'cta' ? clamp((41.0 - t) / 0.5) : 1); if (a <= 0.01) return;
  const acc = scene.phase === 'solution' ? C.green : C.amber;
  ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = hexA(acc, 0.92); ctx.fillRect(64, 150, 132, 5); wordmark(ctx, 64, 132, 44);
  ctx.font = `24px ${F.oswald}`; const tag = scene.phase === 'solution' ? 'SOLUTION' : 'THE PROBLEM'; const tw = trackWidth(ctx, tag, 3);
  ctx.fillStyle = hexA(acc, 0.18); rr(ctx, W - 64 - tw - 32, 106, tw + 32, 38, 8); ctx.fill();
  ctx.fillStyle = acc; track(ctx, tag, W - 64 - tw - 16, 132, 3);
  ctx.restore();
}
function topHeadline(ctx, lines, accent, t, startT, size = 66) {
  const a = easeOut(clamp((t - startT) / 0.9)); if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const rise = (1 - a) * 14; ctx.font = `${size}px ${F.anton}`;
  let y = 296 + rise;
  for (let i = 0; i < lines.length; i++) { ctx.fillStyle = i === lines.length - 1 ? accent : C.white; ctx.fillText(lines[i], W / 2, y); y += size * 1.12; }
  ctx.restore();
}

// ---- stat overlay (lower third, over scrim) ----
function statOverlay(ctx, ov, t, yC) {
  const a = lifecycle(t, ov.t0, ov.t1, 0.55, 0.45); if (a <= 0.001) return;
  const col = ov.tone === 'good' ? C.green : C.red;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.translate(0, (1 - easeOut(clamp((t - ov.t0) / 0.6))) * 34); ctx.globalAlpha = a;
  if (ov.big) {
    const p = easeOut(clamp((t - ov.t0) / 0.9));
    const numStr = (ov.pre || '') + (ov.count ? fmt(lerp(0, ov.count, p)) : ov.big) + (ov.post || '');
    let size = 232; ctx.font = `${size}px ${F.anton}`;
    while (ctx.measureText(numStr).width > W - 150 && size > 90) { size -= 6; ctx.font = `${size}px ${F.anton}`; }
    const nw = ctx.measureText(numStr).width;
    ctx.shadowColor = hexA(col, 0.55); ctx.shadowBlur = 46; ctx.fillStyle = C.white; ctx.fillText(numStr, W / 2, yC); ctx.shadowBlur = 0;
    ctx.fillStyle = col; rr(ctx, (W - nw) / 2, yC + 22, nw, 11, 6); ctx.fill();
    ctx.font = `38px ${F.oswald}`; const lw = trackWidth(ctx, ov.label, 4); ctx.fillStyle = hexA(C.white, 0.95); track(ctx, ov.label, (W - lw) / 2, yC + 92, 4);
  } else {
    ctx.fillStyle = hexA(C.green, 0.16); ctx.beginPath(); ctx.arc(W / 2, yC - 96, 50, 0, 7); ctx.fill();
    ctx.strokeStyle = C.green; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(W / 2 - 18, yC - 96); ctx.lineTo(W / 2 - 4, yC - 80); ctx.lineTo(W / 2 + 22, yC - 114); ctx.stroke();
    ctx.font = `44px ${F.oswald}`; ctx.fillStyle = C.white; const lw = trackWidth(ctx, 'BOOKS APPOINTMENTS INTO', 3); track(ctx, 'BOOKS APPOINTMENTS INTO', (W - lw) / 2, yC + 4, 3);
    ctx.textAlign = 'center'; ctx.fillStyle = C.green; ctx.font = `82px ${F.anton}`; ctx.fillText('ATHENA · KAREO', W / 2, yC + 90);
  }
  ctx.restore();
}

// ---- scene extras ----
function leakGraph(ctx, t, t0, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  const gx = 120, gy = H * 0.40, gw = W - 240, gh = 150;
  ctx.strokeStyle = hexA(C.red, 0.92); ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
  const prog = clamp((t - t0 - 0.3) / 3.5), pts = 60;
  for (let i = 0; i <= pts * prog; i++) { const x = gx + gw * (i / pts), yy = gy + gh * (i / pts) + Math.sin(i * 0.6) * 6; if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
  ctx.stroke();
  if (prog > 0.02) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(gx + gw * prog, gy + gh * prog, 9, 0, 7); ctx.fill(); }
  ctx.restore();
}
function featureList(ctx, t) {
  const feats = ['Books into Athena · Kareo', 'Handles insurance', 'Routes complex cases'];
  for (let i = 0; i < feats.length; i++) {
    const st = 33.4 + i * 0.55, a = lifecycle(t, st, 37.7, 0.4, 0.45); if (a <= 0) continue;
    const wd = 610, x = W / 2 - wd / 2, y = 556 + i * 92;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = hexA('#0c2742', 0.9); ctx.strokeStyle = hexA(C.green, 0.65); ctx.lineWidth = 2; rr(ctx, x, y, wd, 76, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hexA(C.green, 0.16); ctx.beginPath(); ctx.arc(x + 44, y + 38, 23, 0, 7); ctx.fill();
    ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 33, y + 38); ctx.lineTo(x + 41, y + 48); ctx.lineTo(x + 56, y + 28); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = `34px ${F.oswald}`; ctx.fillText(feats[i], x + 84, y + 48);
    ctx.restore();
  }
}
function drawPalm(ctx, x, y, dir, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  rr(ctx, -28, -36, 50, 74, 15); ctx.fill();
  for (let i = 0; i < 4; i++) { rr(ctx, -26 + i * 13, -58, 10, 28, 5); ctx.fill(); }
  rr(ctx, -42, -8, 20, 26, 10); ctx.fill();
  ctx.restore();
}
function highFive(ctx, t) {
  const a = lifecycle(t, 40.2, 42.6, 0.4, 0.3); if (a <= 0) return;
  const cx = W / 2, cy = H * 0.525, hit = easeOut(clamp((t - 40.7) / 0.5));
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = hexA(C.green, 0.85); ctx.lineWidth = 5; ctx.lineCap = 'round';
  const rays = 12, R0 = 56 * hit, R1 = 118 + 70 * hit;
  for (let i = 0; i < rays; i++) { const ang = (i / rays) * Math.PI * 2 + 0.26; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * R0, cy + Math.sin(ang) * R0); ctx.lineTo(cx + Math.cos(ang) * R1, cy + Math.sin(ang) * R1); ctx.stroke(); }
  if (hit > 0 && hit < 1) { ctx.fillStyle = hexA('#ffffff', (1 - hit) * 0.5); ctx.beginPath(); ctx.arc(cx, cy, 104 * hit, 0, 7); ctx.fill(); }
  ctx.shadowColor = hexA(C.green, 0.6); ctx.shadowBlur = 18; ctx.fillStyle = '#ffffff';
  drawPalm(ctx, cx - 22 - (1 - hit) * 80, cy, 1, 0.82);
  drawPalm(ctx, cx + 22 + (1 - hit) * 80, cy, -1, 0.82);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center'; ctx.fillStyle = C.white; ctx.font = `76px ${F.anton}`; ctx.fillText('HIGH FIVE.', cx, H * 0.73);
  ctx.fillStyle = C.green; ctx.font = `34px ${F.oswald}`; const s = 'EVERY CALL ANSWERED', lw = trackWidth(ctx, s, 4); track(ctx, s, cx - lw / 2, H * 0.73 + 52, 4);
  ctx.restore();
}

// ---- end slate ----
function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H); g.addColorStop(0, C.bg0); g.addColorStop(0.55, C.bg1); g.addColorStop(1, C.bg0); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const gx = W * (0.5 + 0.1 * Math.sin(t * 0.25)), gy = H * 0.42, gl = ctx.createRadialGradient(gx, gy, 60, gx, gy, 1100);
  gl.addColorStop(0, hexA(C.green, 0.15)); gl.addColorStop(0.5, hexA(C.green, 0.03)); gl.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
}
function endSlate(ctx, t, sT) {
  background(ctx, t);
  ctx.fillStyle = C.amber; ctx.fillRect(110, 300, W - 220, 6);
  ctx.fillStyle = C.green; ctx.fillRect(110, H - 300, W - 220, 6);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const wy = H * 0.36, ws = 210; ctx.fillStyle = C.white; ctx.font = `${ws}px ${F.bebas}`;
  const m = ctx.measureText('IVAI').width; ctx.fillText('IVAI', W / 2 - ws * 0.05, wy);
  ctx.fillStyle = C.amber; const d = ws * 0.17; rr(ctx, W / 2 + m / 2 - ws * 0.02, wy - d, d, d, d * 0.18); ctx.fill();
  ctx.font = `34px ${F.oswald}`; ctx.fillStyle = C.mute; const tg = 'INTELLIGENT VOICE AI', tw = trackWidth(ctx, tg, 8); track(ctx, tg, W / 2 - tw / 2, wy + 64, 8);
  ctx.font = `70px ${F.anton}`; ctx.fillStyle = C.white; ctx.fillText('EVERY CALL ANSWERED.', W / 2, wy + 200); ctx.fillText('EVERY PATIENT BOOKED.', W / 2, wy + 276);
  ctx.fillStyle = C.green; ctx.font = `76px ${F.anton}`; ctx.fillText('24 / 7', W / 2, wy + 372);
  const pa = easeOut(clamp((t - sT - 0.7) / 0.6)); ctx.globalAlpha = pa;
  ctx.fillStyle = C.green; ctx.font = `28px ${F.oswald}`; { const fc = 'FREE SAVINGS CALCULATOR', fw = trackWidth(ctx, fc, 5); track(ctx, fc, W / 2 - fw / 2, wy + 438, 5); }
  ctx.font = `44px ${F.oswald}`; const cta = 'GetIVAI.com/healthcare', cw = ctx.measureText(cta).width + 96, pulse = 1 + 0.02 * Math.sin((t - sT) * 6);
  ctx.translate(W / 2, wy + 504); ctx.scale(pulse, pulse); ctx.fillStyle = C.amber; rr(ctx, -cw / 2, -44, cw, 88, 44); ctx.fill();
  ctx.fillStyle = '#10180c'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(cta, 0, 3);
  ctx.restore();
}
function drawCTA(ctx, t) {
  const sT = 42.6, eIn = easeOut(clamp((t - sT) / 0.7));
  if (eIn < 1) {
    photoLayer(ctx, P.walk, t, 40.0, 45.5, 'right', null); scrims(ctx);
    highFive(ctx, t);
  }
  if (eIn > 0) { ctx.save(); ctx.globalAlpha = eIn; endSlate(ctx, t, sT); ctx.restore(); }
}

function cutFlash(ctx, t) { for (const s of SCENES) { if (s.t0 <= 0.05) continue; const d = Math.abs(t - s.t0); if (d < 0.1) { ctx.fillStyle = hexA('#fff', (0.1 - d) / 0.1 * 0.35); ctx.fillRect(0, 0, W, H); } } }

function drawFrame(ctx, t) {
  const s = sceneAt(t);
  ctx.fillStyle = C.bg0; ctx.fillRect(0, 0, W, H);
  if (s.key === 'cta') { drawCTA(ctx, t); cutFlash(ctx, t); return; }
  if (s.key === 'hook') {
    photoLayer(ctx, P.desk, t, s.t0, s.t1, 'right', null); scrims(ctx);
    topHeadline(ctx, ['EVERY MISSED CALL', 'IS A LOST PATIENT.'], C.amber, t, 0.5);
  } else if (s.key === 'cost') {
    const dB = clamp((t - 22.6) / 1.8), dA = 1 - dB;
    if (dA > 0.01) { ctx.save(); ctx.globalAlpha = dA; photoLayer(ctx, P.messy, t, s.t0, 23.0, 'in', 'red'); ctx.restore(); }
    if (dB > 0.01) { ctx.save(); ctx.globalAlpha = dB; photoLayer(ctx, P.walk, t, 22.6, s.t1, 'left', null); ctx.restore(); }
    scrims(ctx);
    if (dA > 0.2) leakGraph(ctx, t, s.t0, dA);
    topHeadline(ctx, ['THE REVENUE', 'LEAK.'], C.red, t, 16.5);
  } else if (s.key === 'solve') {
    photoLayer(ctx, P.dash, t, s.t0, s.t1, 'in', 'green'); scrims(ctx);
    topHeadline(ctx, ['IVAI ANSWERS', 'EVERY CALL.'], C.green, t, 33.0, 60);
    featureList(ctx, t);
  }
  for (const ov of OVERLAYS) statOverlay(ctx, ov, t, STAT_YC);
  vignette(ctx); chrome(ctx, t, s); grain(ctx, t); cutFlash(ctx, t);
}

// ---- runner ----
async function preload() {
  const map = { desk: 'proc_desk.png', walk: 'proc_walk.png', messy: 'proc_messy.png', dash: 'proc_dash.png', reception: 'proc_reception.png' };
  for (const [k, f] of Object.entries(map)) { const p = path.join(ROOT, 'broll', f); if (fs.existsSync(p)) { try { P[k] = await loadImage(p); } catch (e) { console.error('load fail', f, e.message); } } }
  console.error('photos:', Object.keys(P).filter(k => P[k]).join(', ') || 'none');
}
async function stills(list) {
  await preload(); const dir = path.join(ROOT, 'frames'); if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  for (const ts of list) { const cv = createCanvas(W, H); const ctx = cv.getContext('2d'); drawFrame(ctx, parseFloat(ts)); const out = path.join(dir, `still_${String(ts).replace('.', '_')}.png`); fs.writeFileSync(out, cv.toBuffer('image/png')); console.log('still', ts); }
}
const writeFrame = (st, buf) => new Promise(res => { if (!st.write(buf)) st.once('drain', res); else res(); });
async function render() {
  await preload(); const outDir = path.join(ROOT, 'out'); if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'IVAI_Healthcare_Reel_vertical_1080x1920.mp4');
  const args = ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0', '-i', AUDIO, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-r', String(FPS), '-shortest', '-movflags', '+faststart', outFile];
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  const cv = createCanvas(W, H); const ctx = cv.getContext('2d'); const t0 = Date.now();
  for (let f = 0; f < FRAMES; f++) { drawFrame(ctx, f / FPS); const d = ctx.getImageData(0, 0, W, H).data; await writeFrame(ff.stdin, Buffer.from(d.buffer, d.byteOffset, d.byteLength)); if (f % 60 === 0) process.stderr.write(`\rframe ${f}/${FRAMES} (${(f / FRAMES * 100).toFixed(0)}%)  `); }
  ff.stdin.end(); await done; console.log(`\nDONE -> ${outFile} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
(async () => { const ai = process.argv.indexOf('--stills'); if (ai >= 0) await stills((process.argv[ai + 1] || '3,9,14,20,28,35,38,41,44').split(',')); else await render(); })().catch(e => { console.error(e); process.exit(1); });
