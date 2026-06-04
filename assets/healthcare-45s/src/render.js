/* IVAI Healthcare Reel — deterministic cinematic renderer (node-canvas + ffmpeg).
 *
 * 1080x1920 (9:16), 30fps, ~45.5s, locked to assets/healthcare-45s/narration.mp3.
 * Renders each frame on a Skia/Cairo canvas and streams raw RGBA into ffmpeg,
 * which muxes the Adriana VO. No AI-generation credits required.
 *
 * Usage:
 *   node src/render.js                              # full render -> out/IVAI_Healthcare_Reel_vertical_1080x1920.mp4
 *   node src/render.js --stills 2,8,13,20,28,35,38,43   # QA stills -> frames/still_*.png
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ---- canvas backend (prefer @napi-rs/canvas, fall back to node-canvas) ----
let CV, GlobalFonts, loadImage, createCanvas;
try { CV = require('@napi-rs/canvas'); createCanvas = CV.createCanvas; GlobalFonts = CV.GlobalFonts; loadImage = CV.loadImage; }
catch (e) { CV = require('canvas'); createCanvas = CV.createCanvas; loadImage = CV.loadImage; }

const ROOT = path.join(__dirname, '..');
const FONTS = path.join(ROOT, 'fonts');
function regFont(file, family) {
  const p = path.join(FONTS, file); if (!fs.existsSync(p)) return;
  if (GlobalFonts) GlobalFonts.registerFromPath(p, family); else CV.registerFont(p, { family });
}
regFont('Anton-Regular.ttf', 'Anton');
regFont('BebasNeue-Regular.ttf', 'Bebas');
regFont('Oswald-Bold.ttf', 'Oswald');
regFont('Inter-Variable.ttf', 'Inter');
regFont('Archivo-Variable.ttf', 'Archivo');

// ---------------------------------------------------------------- constants
const W = 1080, H = 1920, FPS = 30;
const AUDIO = path.join(ROOT, 'narration.mp3');
const DUR = 45.505;
const FRAMES = Math.round(DUR * FPS);

const C = {
  bg0: '#081325', bg1: '#0b2138', panel: '#0c2742',
  white: '#eef4fb', mute: '#8ea6c2', dim: '#5b78a0',
  amber: '#f5a623', amberD: '#cf8512',
  green: '#27d17c', greenD: '#159f5d',
  red: '#ff5d63', teal: '#37e0c8',
};
const F = { anton: 'Anton', bebas: 'Bebas', oswald: 'Oswald', inter: 'Inter', archivo: 'Archivo' };

// --------------------------------------------------------------- scene plan
// Cuts land inside real VO silence (measured): 16.2 / 31.7-33.9 / 39.2-40.6.
const SCENES = [
  { key: 'hook',  t0: 0.0,   t1: 16.30, phase: 'problem' },
  { key: 'cost',  t0: 16.30, t1: 32.80, phase: 'problem' },
  { key: 'solve', t0: 32.80, t1: 40.00, phase: 'solution' },
  { key: 'cta',   t0: 40.00, t1: DUR,   phase: 'solution' },
];
function sceneAt(t) { for (const s of SCENES) if (t >= s.t0 && t < s.t1) return s; return SCENES[SCENES.length - 1]; }

// Stat overlays in the brief's listed order, anchored to the audio beats.
const OVERLAYS = [
  { id: 'missed',    big: '25',      label: 'MISSED CALLS / MONTH',        t0: 5.4,  t1: 11.0,  tone: 'bad',  count: 25,     pre: '',  post: '' },
  { id: 'lost150',   big: '150,000', label: 'WALK OUT THE DOOR / YEAR',    t0: 11.2, t1: 16.05, tone: 'bad',  count: 150000, pre: '$', post: '' },
  { id: 'unans',     big: '35',      label: 'OF PATIENT CALLS UNANSWERED', t0: 17.6, t1: 23.8,  tone: 'bad',  count: 35,     pre: '',  post: '%' },
  { id: 'lost135',   big: '135,000', label: 'IN LOST REVENUE / YEAR',      t0: 24.2, t1: 31.5,  tone: 'bad',  count: 135000, pre: '$', post: '' },
  { id: 'books',     big: '',        label: 'BOOKS INTO ATHENA / KAREO',   t0: 33.2, t1: 37.0,  tone: 'good', count: 0,      pre: '',  post: '' },
  { id: 'recovered', big: '41,800',  label: 'RECOVERED REVENUE',           t0: 37.2, t1: 39.95, tone: 'good', count: 41800,  pre: '$', post: '' },
];

// ------------------------------------------------------------------- easing
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function lifecycle(t, t0, t1, inDur = 0.5, outDur = 0.45) {
  if (t < t0 || t > t1) return 0;
  return Math.min(easeOut(clamp((t - t0) / inDur)), easeOut(clamp((t1 - t) / outDur)));
}

// -------------------------------------------------------------- small utils
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
const fmt = n => Math.round(n).toLocaleString('en-US');
function track(ctx, text, x, y, spacing) { // letter-spaced draw, align-independent
  const prev = ctx.textAlign; ctx.textAlign = 'left';
  let cx = x; for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
  ctx.textAlign = prev; return cx - spacing - x;
}
function trackWidth(ctx, text, spacing) { let w = 0; for (const ch of text) w += ctx.measureText(ch).width + spacing; return w - spacing; }

// ------------------------------------------------------------------ layers
function background(ctx, t, phase) {
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, C.bg0); g.addColorStop(0.55, C.bg1); g.addColorStop(1, C.bg0);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const gx = W * (0.5 + 0.12 * Math.sin(t * 0.25)), gy = H * (0.42 + 0.05 * Math.cos(t * 0.2));
  const acc = phase === 'solution' ? C.green : C.amber;
  const glow = ctx.createRadialGradient(gx, gy, 60, gx, gy, 1150);
  glow.addColorStop(0, hexA(acc, phase === 'solution' ? 0.16 : 0.12));
  glow.addColorStop(0.5, hexA(acc, 0.03)); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}
function gridLayer(ctx, t) {
  ctx.save(); ctx.strokeStyle = hexA('#3a6ea5', 0.09); ctx.lineWidth = 1;
  const sp = 90, off = (t * 14) % sp;
  for (let x = -sp + off; x < W + sp; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 130, H); ctx.stroke(); }
  ctx.restore();
}
function waveBand(ctx, t, yc, color, amp, alpha, bars = 46) {
  ctx.save();
  const span = W * 0.92, x0 = (W - span) / 2, bw = span / bars;
  for (let i = 0; i < bars; i++) {
    const ph = i * 0.5 + t * 6.5, env = Math.sin((i / bars) * Math.PI);
    const h = amp * env * (0.35 + 0.65 * Math.abs(Math.sin(ph)));
    ctx.fillStyle = hexA(color, alpha * (0.5 + 0.5 * env));
    rr(ctx, x0 + i * bw + bw * 0.18, yc - h, bw * 0.64, h * 2, bw * 0.32); ctx.fill();
  }
  ctx.restore();
}
function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.32, W / 2, H * 0.5, H * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 260);
  tg.addColorStop(0, 'rgba(4,9,18,0.55)'); tg.addColorStop(1, 'rgba(4,9,18,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 260);
}
function grain(ctx, t) {
  ctx.save(); ctx.globalAlpha = 0.03;
  let s = (Math.floor(t * FPS) * 2654435761) >>> 0;
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
  for (let i = 0; i < 600; i++) { ctx.fillStyle = rnd() > 0.5 ? '#fff' : '#000'; ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6); }
  ctx.restore();
}

// ------------------------------------------------------------------- chrome
function wordmark(ctx, x, y, h, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.white; ctx.font = `${h}px ${F.bebas}`;
  const w = trackWidth(ctx, 'IVAI', h * 0.06); track(ctx, 'IVAI', x, y, h * 0.06);
  ctx.fillStyle = C.amber; const d = h * 0.16; rr(ctx, x + w + h * 0.10, y - d, d, d, d * 0.18); ctx.fill();
  ctx.restore();
}
function chrome(ctx, t, scene) {
  let a = clamp((t - 0.4) / 0.8);
  if (a <= 0.01) return;
  const acc = scene.phase === 'solution' ? C.green : C.amber;
  ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = hexA(acc, 0.9); ctx.fillRect(64, 150, 150, 5);
  wordmark(ctx, 64, 130, 46, 1);
  ctx.font = `26px ${F.oswald}`;
  const tag = scene.phase === 'solution' ? 'SOLUTION' : 'THE PROBLEM';
  const tw = trackWidth(ctx, tag, 3);
  ctx.fillStyle = hexA(acc, 0.16); rr(ctx, W - 64 - tw - 34, 104, tw + 34, 40, 8); ctx.fill();
  ctx.fillStyle = acc; track(ctx, tag, W - 64 - tw - 17, 132, 3);
  ctx.beginPath(); ctx.arc(W - 64 - tw - 24, 124, 4, 0, 7); ctx.fill();
  ctx.restore();
}

// --------------------------------------------------------------- stat block
function statOverlay(ctx, ov, t) {
  const a = lifecycle(t, ov.t0, ov.t1, 0.55, 0.45);
  if (a <= 0.001) return;
  const tone = ov.tone;
  const col = tone === 'good' ? C.green : tone === 'cta' ? C.amber : C.red;
  const yC = H * 0.605;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.translate(0, (1 - easeOut(clamp((t - ov.t0) / 0.6))) * 36); ctx.globalAlpha = a;

  if (ov.big) {
    const p = easeOut(clamp((t - ov.t0) / 0.9));
    const numStr = (ov.pre || '') + (ov.count ? fmt(lerp(0, ov.count, p)) : ov.big) + (ov.post || '');
    let size = 232; ctx.font = `${size}px ${F.anton}`;
    while (ctx.measureText(numStr).width > W - 150 && size > 90) { size -= 6; ctx.font = `${size}px ${F.anton}`; }
    const nw = ctx.measureText(numStr).width;
    ctx.shadowColor = hexA(col, 0.5); ctx.shadowBlur = 42;
    ctx.fillStyle = C.white; ctx.fillText(numStr, W / 2, yC);
    ctx.shadowBlur = 0;
    ctx.fillStyle = col; rr(ctx, (W - nw) / 2, yC + 22, nw, 11, 6); ctx.fill();
    ctx.font = `38px ${F.oswald}`;
    const lw = trackWidth(ctx, ov.label, 4);
    ctx.fillStyle = hexA(C.white, 0.92); track(ctx, ov.label, (W - lw) / 2, yC + 92, 4);
  } else {
    const col2 = tone === 'good' ? C.green : C.amber;
    ctx.fillStyle = hexA(col2, 0.16); ctx.beginPath(); ctx.arc(W / 2, yC - 92, 50, 0, 7); ctx.fill();
    ctx.fillStyle = col2; ctx.font = `60px ${F.inter}`; ctx.fillText('✓', W / 2, yC - 72);
    ctx.font = `44px ${F.oswald}`; ctx.fillStyle = C.white;
    const lw = trackWidth(ctx, 'BOOKS APPOINTMENTS INTO', 3); track(ctx, 'BOOKS APPOINTMENTS INTO', (W - lw) / 2, yC + 6, 3);
    ctx.fillStyle = col2; ctx.font = `82px ${F.anton}`; ctx.fillText('ATHENA · KAREO', W / 2, yC + 92);
  }
  ctx.restore();
}

// ----------------------------------------------------------- scene visuals
function artHook(ctx, t, s) {
  waveBand(ctx, t, H * 0.305, C.amber, 28, 0.20);
  const ha = easeOut(clamp((t - 0.5) / 1.1));
  ctx.save(); ctx.globalAlpha = ha; ctx.textAlign = 'center';
  ctx.fillStyle = C.white; ctx.font = `90px ${F.anton}`;
  ctx.fillText('EVERY MISSED CALL', W / 2, H * 0.26);
  ctx.fillStyle = C.amber; ctx.fillText('IS A LOST PATIENT.', W / 2, H * 0.26 + 92);
  ctx.restore();
  const calls = ['(415) 555 · 0182', '(212) 555 · 7741', '(305) 555 · 9930'];
  const yBase = 664, slot = 96, cw = 506, ch = 80, x = W / 2 - cw / 2;
  for (let i = 0; i < calls.length; i++) {
    const start = 1.4 + i * 0.55, la = lifecycle(t, start, s.t1 + 0.4, 0.4, 0.4);
    if (la <= 0) continue;
    const missed = (t - start) > 1.0;
    const yy = yBase + i * slot + (1 - easeOut(clamp((t - start) / 0.5))) * 24;
    const acc = missed ? C.red : C.teal;
    ctx.save(); ctx.globalAlpha = la;
    ctx.fillStyle = hexA('#0c2742', 0.95); ctx.strokeStyle = hexA(acc, 0.85); ctx.lineWidth = 2;
    rr(ctx, x, yy, cw, ch, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hexA(acc, 0.16); ctx.beginPath(); ctx.arc(x + 48, yy + ch / 2, 24, 0, 7); ctx.fill();
    ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.lineCap = 'round'; const cyc = yy + ch / 2;
    if (missed) { ctx.beginPath(); ctx.moveTo(x + 40, cyc - 8); ctx.lineTo(x + 56, cyc + 8); ctx.moveTo(x + 56, cyc - 8); ctx.lineTo(x + 40, cyc + 8); ctx.stroke(); }
    else { ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(x + 48, cyc, 7, 0, 7); ctx.fill(); }
    ctx.textAlign = 'left'; ctx.fillStyle = C.white; ctx.font = `30px ${F.oswald}`; ctx.fillText(calls[i], x + 90, yy + 36);
    ctx.fillStyle = hexA(missed ? C.red : C.mute, 0.95); ctx.font = `20px ${F.inter}`; ctx.fillText(missed ? 'MISSED — sent to voicemail' : 'incoming call…', x + 90, yy + 62);
    ctx.restore();
  }
}
function artCost(ctx, t, s) {
  waveBand(ctx, t, H * 0.305, C.amber, 24, 0.16);
  const a = easeOut(clamp((t - s.t0 - 0.2) / 1.0));
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.fillStyle = C.white; ctx.font = `82px ${F.anton}`; ctx.fillText('THE REVENUE', W / 2, H * 0.235);
  ctx.fillStyle = C.red; ctx.fillText('LEAK', W / 2, H * 0.235 + 86);
  ctx.restore();
  ctx.save();
  const gx = 120, gy = H * 0.335, gw = W - 240, gh = 150;
  ctx.strokeStyle = hexA(C.red, 0.9); ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
  const prog = clamp((t - s.t0 - 0.4) / 3.5), pts = 60;
  for (let i = 0; i <= pts * prog; i++) {
    const x = gx + gw * (i / pts), yy = gy + gh * (i / pts) + Math.sin(i * 0.6) * 6;
    if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  if (prog > 0.02) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(gx + gw * prog, gy + gh * prog, 9, 0, 7); ctx.fill(); }
  ctx.restore();
}
function artSolve(ctx, t, s) {
  waveBand(ctx, t, H * 0.30, C.green, 30, 0.26);
  const a = easeOut(clamp((t - s.t0 - 0.1) / 0.9));
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.fillStyle = C.white; ctx.font = `80px ${F.anton}`; ctx.fillText('IVAI ANSWERS 24/7.', W / 2, H * 0.205);
  ctx.restore();
  const ba = easeOut(clamp((t - 33.0) / 1.0));
  ctx.save(); ctx.globalAlpha = ba; ctx.textAlign = 'left';
  const cw = 560, ch = 250, x = (W - cw) / 2, y = H * 0.255;
  ctx.fillStyle = hexA('#0c2742', 0.95); ctx.strokeStyle = hexA(C.green, 0.6); ctx.lineWidth = 2; rr(ctx, x, y, cw, ch, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.green; ctx.font = `24px ${F.oswald}`; ctx.fillText('INCOMING CALL  ·  BOOKED', x + 30, y + 44);
  const slots = ['New patient · 9:00', 'Follow-up · 10:30', 'New patient · 1:15', 'Cleaning · 3:45'];
  for (let i = 0; i < slots.length; i++) {
    const sa = clamp((t - 33.4 - i * 0.3) / 0.5); if (sa <= 0) continue;
    ctx.globalAlpha = ba * sa;
    ctx.fillStyle = hexA(C.green, 0.12); rr(ctx, x + 26, y + 62 + i * 44, cw - 52, 36, 8); ctx.fill();
    ctx.fillStyle = C.white; ctx.font = `24px ${F.inter}`; ctx.fillText(slots[i], x + 44, y + 87 + i * 44);
    ctx.fillStyle = C.green; ctx.textAlign = 'right'; ctx.fillText('✓ booked', x + cw - 44, y + 87 + i * 44); ctx.textAlign = 'left';
  }
  ctx.restore();
}

// CTA / END SLATE
function endSlate(ctx, t) {
  const p = easeOut(clamp((t - 40.0) / 1.0));
  background(ctx, t, 'solution');
  ctx.fillStyle = hexA(C.amber, p); ctx.fillRect(110, 300, W - 220, 6);
  ctx.fillStyle = hexA(C.green, p); ctx.fillRect(110, H - 300, W - 220, 6);
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const wy = H * 0.36, ws = 210 * (0.96 + 0.04 * p);
  ctx.globalAlpha = p; ctx.fillStyle = C.white; ctx.font = `${ws}px ${F.bebas}`;
  const m = ctx.measureText('IVAI').width;
  ctx.fillText('IVAI', W / 2 - ws * 0.05, wy);
  ctx.fillStyle = C.amber; const d = ws * 0.17; rr(ctx, W / 2 + m / 2 - ws * 0.02, wy - d, d, d, d * 0.18); ctx.fill();
  ctx.font = `34px ${F.oswald}`; ctx.fillStyle = hexA(C.mute, p);
  const tg = 'INTELLIGENT VOICE AI', tw = trackWidth(ctx, tg, 8); track(ctx, tg, W / 2 - tw / 2, wy + 64, 8);
  ctx.font = `70px ${F.anton}`; ctx.fillStyle = hexA(C.white, p);
  ctx.fillText('EVERY CALL ANSWERED.', W / 2, wy + 200);
  ctx.fillText('EVERY PATIENT BOOKED.', W / 2, wy + 276);
  ctx.fillStyle = C.green; ctx.font = `76px ${F.anton}`; ctx.fillText('24 / 7', W / 2, wy + 372);
  const pa = easeOut(clamp((t - 41.0) / 0.8)); ctx.globalAlpha = pa;
  ctx.font = `44px ${F.oswald}`; const cta = 'GetIVAI.com/healthcare', cw = ctx.measureText(cta).width + 96;
  const pulse = 1 + 0.02 * Math.sin((t - 41) * 6);
  ctx.translate(W / 2, wy + 492); ctx.scale(pulse, pulse);
  ctx.fillStyle = C.amber; rr(ctx, -cw / 2, -44, cw, 88, 44); ctx.fill();
  ctx.fillStyle = '#10180c'; ctx.textBaseline = 'middle'; ctx.fillText(cta, 0, 3);
  ctx.restore();
}

function cutFlash(ctx, t) {
  for (const s of SCENES) {
    if (s.t0 <= 0.05) continue;
    const d = Math.abs(t - s.t0);
    if (d < 0.12) { ctx.fillStyle = hexA('#ffffff', (0.12 - d) / 0.12 * 0.4); ctx.fillRect(0, 0, W, H); }
  }
}

// --------------------------------------------------------------- main frame
let HOST = {};
function drawFrame(ctx, t) {
  const s = sceneAt(t);
  if (s.key === 'cta') { endSlate(ctx, t); cutFlash(ctx, t); return; }
  background(ctx, t, s.phase);
  gridLayer(ctx, t);
  const host = s.key === 'solve' ? HOST.h2 : HOST.h1;
  if (host) {
    ctx.save();
    const z = 1.06 + 0.06 * easeInOut(clamp((t - s.t0) / (s.t1 - s.t0)));
    const iw = W * z, ih = iw * host.height / host.width;
    ctx.globalAlpha = 0.5; ctx.drawImage(host, (W - iw) / 2, (H - ih) / 2 - 80, iw, ih);
    ctx.fillStyle = hexA(C.bg0, 0.55); ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (s.key === 'hook') artHook(ctx, t, s);
  else if (s.key === 'cost') artCost(ctx, t, s);
  else if (s.key === 'solve') artSolve(ctx, t, s);
  for (const ov of OVERLAYS) statOverlay(ctx, ov, t);
  vignette(ctx);
  chrome(ctx, t, s);
  grain(ctx, t);
  cutFlash(ctx, t);
}

// ------------------------------------------------------------------ runner
async function preload() {
  for (const [k, f] of [['h1', 'host1'], ['h2', 'host2']]) {
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
      const p = path.join(ROOT, f + ext);
      if (fs.existsSync(p)) { try { HOST[k] = await loadImage(p); } catch (e) {} break; }
    }
  }
}
async function stills(list) {
  await preload();
  const dir = path.join(ROOT, 'frames'); if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  for (const ts of list) {
    const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');
    drawFrame(ctx, parseFloat(ts));
    const out = path.join(dir, `still_${String(ts).replace('.', '_')}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png')); console.log('still', ts, '->', out);
  }
}
const writeFrame = (stream, buf) => new Promise(res => { if (!stream.write(buf)) stream.once('drain', res); else res(); });
async function render() {
  await preload();
  const outDir = path.join(ROOT, 'out'); if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, 'IVAI_Healthcare_Reel_vertical_1080x1920.mp4');
  const args = ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
    '-i', AUDIO, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-r', String(FPS), '-shortest', '-movflags', '+faststart', outFile];
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  const canvas = createCanvas(W, H); const ctx = canvas.getContext('2d');
  const t0 = Date.now();
  for (let f = 0; f < FRAMES; f++) {
    drawFrame(ctx, f / FPS);
    const data = ctx.getImageData(0, 0, W, H).data;
    await writeFrame(ff.stdin, Buffer.from(data.buffer, data.byteOffset, data.byteLength));
    if (f % 60 === 0) process.stderr.write(`\rframe ${f}/${FRAMES} (${(f / FRAMES * 100).toFixed(0)}%)  `);
  }
  ff.stdin.end(); await done;
  console.log(`\nDONE -> ${outFile} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
(async () => {
  const ai = process.argv.indexOf('--stills');
  if (ai >= 0) await stills((process.argv[ai + 1] || '2,8,13,20,28,35,38,43').split(','));
  else await render();
})().catch(e => { console.error(e); process.exit(1); });
