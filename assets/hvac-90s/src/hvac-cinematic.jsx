// hvac-cinematic.jsx — IVAI HVAC cinematic 16:9 — palette, primitives, chrome.
// Self-contained (own HC/HF namespaces) so it never collides with the
// healthcare cinematic.jsx. Relies on globals from animations.jsx:
// Stage, Sprite, useTime, useTimeline, useSprite, Easing, clamp.

// ── Type ─────────────────────────────────────────────────────────────────────
const HF = {
  display: "'Inter','Inter Display',system-ui,sans-serif",
  body: "'Inter',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',ui-monospace,monospace"
};

// ── Palette — blue-collar IVAI HVAC ───────────────────────────────────────────
// Navy ground, brand blue + green pillars, amber/orange for PAIN points,
// green for RESOLUTION. White text. Per master-prompt brand spec.
const HC = {
  bg: '#06152B',
  bgDeep: '#040E1F',
  panel: '#0C2244',
  panelHi: '#13315C',
  fg: '#EAF2FF',
  fgSoft: 'rgba(234,242,255,0.80)',
  muted: 'rgba(234,242,255,0.52)',
  faint: 'rgba(234,242,255,0.34)',
  blue: '#3D7CFF',
  blueDeep: '#1A53EE',
  green: '#2CC56B',
  greenDeep: '#1FA259',
  amber: '#FF9416', // PAIN accent
  amberDeep: '#E07A0A',
  navy: '#0A203C',
  glass: 'rgba(10,30,60,0.60)',
  rule: 'rgba(61,124,255,0.22)',
  amberRule: 'rgba(255,148,22,0.30)',
  greenRule: 'rgba(44,197,107,0.30)'
};

const PRESENTER = (window.__resources && window.__resources.presenter) || 'assets/presenter.jpg';
const IVAI_ICON = (window.__resources && window.__resources.ivaiIcon) || 'assets/ivai-icon.png';

// ── IVAI logo mark — three pillars (blue/blue/green) ──────────────────────────
function IvaiPillars({ size = 1, white = false, animate = 1 }) {
  const e = Easing.easeOutCubic(clamp(animate, 0, 1));
  const baseY = 60;
  const c1 = white ? '#FFFFFF' : HC.blue;
  const c2 = white ? '#FFFFFF' : HC.blueDeep;
  const c3 = white ? '#FFFFFF' : HC.green;
  return (
    <svg width={66 * size} height={60 * size} viewBox="0 0 66 60" style={{ overflow: 'visible', display: 'block' }}>
      <rect x="2" y={baseY - 32 * e} width="14" height={32 * e} rx="7" fill={c1} opacity={white ? 0.92 : 1} />
      <rect x="22" y={baseY - 46 * e} width="14" height={46 * e} rx="7" fill={c2} opacity={white ? 0.92 : 1} style={{ height: "46px" }} />
      <rect x="42" y={baseY - 26 * e} width="14" height={26 * e} rx="7" fill={c3} />
    </svg>);

}

// Full lockup used in the lower-left chrome + end slate
// Layout: [icon] IVAI [three pillars] — icon leads, pillars trail.
function IvaiLockup({ scale = 1, white = false, sub = 'HVAC SERVICES', animate = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 * scale }}>
      <img src={IVAI_ICON} alt="" style={{ ...{
          height: 52 * scale, display: 'block',
          filter: white ?
          'brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.4))' :
          'drop-shadow(0 2px 8px rgba(0,0,0,0.3))', width: "103px"
        }, height: "80px" }} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ ...{
            fontFamily: HF.display, fontWeight: 800, fontSize: 40 * scale,
            letterSpacing: '-0.02em', color: white ? '#FFFFFF' : HC.fg
          }, textAlign: "center", fontSize: "60px" }}>IVAI</div>
        {sub &&
        <div style={{ ...{
            fontFamily: HF.mono, fontWeight: 600, fontSize: 11 * scale,
            letterSpacing: '0.34em', marginTop: 3 * scale,
            color: white ? 'rgba(255,255,255,0.78)' : HC.green, textAlign: "center"
          }, margin: "12px 0px 0px", lineHeight: "1.1", fontSize: "20px", letterSpacing: "1.9px" }}>{sub}</div>
        }
      </div>
      <IvaiPillars size={0.62 * scale} white={white} animate={animate} />
    </div>);

}

// ── Presenter plate — graded ken-burns portrait, optionally framed to a side ──
// objectPosition picks the crop; from/to drive a slow ken-burns push.
// NOTE: object-fit is "contain" so the ENTIRE frame is always visible (no crop);
// the ken-burns scale/translate is disabled for the same reason. Letterbox bars
// (HC.bgDeep) fill any area the media doesn't cover when it isn't a 16:9 source.
function PresenterPlate({
  start, end,
  src = PRESENTER,
  objectPosition = '50% 14%',
  from = { s: 1.06, x: 0, y: 0 },
  to = { s: 1.16, x: 0, y: -1 },
  grade = 0.30,
  tint = 'navy', // 'navy' | 'amber' | 'green' | 'day'
  inset = {} // override container box (left/right/width…)
}) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const tIn = clamp(localTime / 0.5, 0, 1);
        const tOut = clamp((localTime - (duration - 0.5)) / 0.5, 0, 1);
        const opacity = Easing.easeOutCubic(tIn) * (1 - Easing.easeInCubic(tOut));

        const grad = {
          navy: `linear-gradient(180deg, rgba(6,21,43,0.18) 0%, rgba(6,21,43,0.30) 55%, rgba(6,21,43,${0.55 + grade}) 100%)`,
          amber: `linear-gradient(180deg, rgba(40,16,4,0.12) 0%, rgba(20,12,30,0.30) 55%, rgba(6,21,43,${0.55 + grade}) 100%)`,
          green: `linear-gradient(180deg, rgba(6,36,30,0.14) 0%, rgba(6,28,40,0.30) 55%, rgba(6,21,43,${0.50 + grade}) 100%)`,
          day: `linear-gradient(180deg, rgba(6,21,43,0.0) 0%, rgba(6,21,43,0.10) 60%, rgba(6,21,43,${0.32 + grade * 0.5}) 100%)`
        }[tint];

        const filter = {
          navy: `saturate(0.96) contrast(1.08) brightness(${1 - grade * 0.5})`,
          amber: `saturate(1.05) contrast(1.10) brightness(${1 - grade * 0.55}) sepia(0.10)`,
          green: `saturate(1.0) contrast(1.08) brightness(${1 - grade * 0.45})`,
          day: `saturate(1.05) contrast(1.05) brightness(${1.02 - grade * 0.3})`
        }[tint];

        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity, background: HC.bgDeep, ...inset }}>
            <img src={src} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', objectPosition,
              transformOrigin: 'center',
              filter, willChange: 'transform'
            }} />
            <div style={{ position: 'absolute', inset: 0, background: grad, pointerEvents: 'none' }} />
            {/* vignette */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 42%, transparent 46%, rgba(4,14,31,0.42) 100%)'
            }} />
          </div>);

      }}
    </Sprite>);

}

// Side-scrim — darkens one side so text on top reads. side: 'left' | 'right'
function SideScrim({ side = 'right', width = '62%' }) {
  const dir = side === 'right' ? '270deg' : '90deg';
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0, width,
      background: `linear-gradient(${dir}, rgba(6,21,43,0.94) 0%, rgba(6,21,43,0.86) 42%, rgba(6,21,43,0.55) 72%, transparent 100%)`,
      pointerEvents: 'none'
    }} />);

}

// Bottom scrim — darkens lower band so a centered subject stays clear.
function BottomScrim({ height = '54%', strength = 0.92 }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height, pointerEvents: 'none',
      background: `linear-gradient(0deg, rgba(4,14,31,${strength}) 0%, rgba(5,18,38,${strength * 0.62}) 34%, rgba(6,21,43,0.18) 68%, transparent 100%)`
    }} />);

}

// ── VideoPlate — plays a live clip mapped to the timeline playhead ─────────────
// Plays natively while the deck plays; snaps currentTime when scrubbing/paused.
// tint/grade match PresenterPlate so footage sits in the same color world.
// NOTE: object-fit is "contain" so the ENTIRE moving frame is always visible (no
// crop); any zoom scale is dropped for the same reason. Uncovered area shows the
// navy backdrop (HC.bgDeep) as letterbox.
function VideoPlate({
  start, end, src,
  objectPosition = '50% 32%',
  zoom = 1, origin = 'center',
  panKeys = null, panY = 50, // [[t,ox],…] dynamic objectPosition-x to track a moving subject
  inset = {},
  tint = 'day', grade = 0.20,
  sound = false, // unmute when playing + in-window
  loop = false, loopFrom = 0, // loop a tail region when the scene outruns the clip
  fit = false, // stretch the clip to span the scene (gentle slow-mo, no freeze/jump)
  vignette = true
}) {
  const { time, playing } = useTimeline();
  const ref = React.useRef(null);
  const localTime = time - start;
  const duration = end - start;
  const active = time >= start - 0.25 && time <= end + 0.05;

  React.useEffect(() => {
    const vid = ref.current;
    if (!vid) return;
    const vd = vid.duration && isFinite(vid.duration) ? vid.duration : duration;
    // fit: scale playback so the whole clip spans the scene (no freeze on extension)
    const fitRate = fit && vd > 0.5 ? clamp(vd / duration, 0.5, 1) : 1;
    if (Math.abs(vid.playbackRate - fitRate) > 0.02) vid.playbackRate = fitRate;
    // when the scene runs past the clip, loop a tail region so the head keeps moving
    let target;
    if (fit) {
      target = clamp(localTime * fitRate, 0, vd - 0.02);
    } else if (loop && vd > loopFrom + 1 && localTime > vd - 0.25) {
      const span = vd - 0.25 - loopFrom;
      target = loopFrom + (localTime - (vd - 0.25)) % span;
    } else {
      target = clamp(localTime, 0, vd - 0.02);
    }
    vid.muted = !(sound && playing && active);
    if (!active) {if (!vid.paused) vid.pause();return;}
    if (playing) {
      if (Math.abs(vid.currentTime - target) > 0.2) {try {vid.currentTime = target;} catch (e) {}}
      if (vid.paused) vid.play().catch(() => {});
    } else {
      if (!vid.paused) vid.pause();
      if (Math.abs(vid.currentTime - target) > 0.03) {try {vid.currentTime = target;} catch (e) {}}
    }
  });

  const tIn = clamp(localTime / 0.5, 0, 1);
  const tOut = clamp((localTime - (duration - 0.5)) / 0.5, 0, 1);
  const op = active ? Easing.easeOutCubic(tIn) * (1 - Easing.easeInCubic(tOut)) : 0;

  let objPos = objectPosition;
  if (panKeys && panKeys.length) {
    const lo = panKeys[0],hi = panKeys[panKeys.length - 1];
    const lt = clamp(localTime, lo[0], hi[0]);
    let ox = lo[1];
    for (let i = 0; i < panKeys.length - 1; i++) {
      const [t0, o0] = panKeys[i],[t1, o1] = panKeys[i + 1];
      if (lt >= t0 && lt <= t1) {const f = (lt - t0) / (t1 - t0 || 1);ox = o0 + (o1 - o0) * Easing.easeInOutCubic(f);break;}
    }
    objPos = `${ox}% ${panY}%`;
  }

  const grad = {
    navy: `linear-gradient(180deg, rgba(6,21,43,0.18) 0%, rgba(6,21,43,0.30) 55%, rgba(6,21,43,${0.55 + grade}) 100%)`,
    green: `linear-gradient(180deg, rgba(6,36,30,0.14) 0%, rgba(6,28,40,0.30) 55%, rgba(6,21,43,${0.50 + grade}) 100%)`,
    day: `linear-gradient(180deg, rgba(6,21,43,0.0) 0%, rgba(6,21,43,0.08) 60%, rgba(6,21,43,${0.26 + grade * 0.5}) 100%)`
  }[tint];
  const filter = {
    navy: `saturate(0.98) contrast(1.06) brightness(${1 - grade * 0.4})`,
    green: `saturate(1.0) contrast(1.06) brightness(${1 - grade * 0.35})`,
    day: `saturate(1.05) contrast(1.04) brightness(${1.02 - grade * 0.3})`
  }[tint];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: op, background: HC.bgDeep, ...inset, textAlign: "center" }}>
      <video ref={ref} src={src} muted playsInline preload="auto" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'contain', objectPosition: objPos,
        transformOrigin: origin, filter, borderRadius: "0px", borderStyle: "solid", borderWidth: "0px", margin: "0px"
      }} />
      <div style={{ position: 'absolute', inset: 0, background: grad, pointerEvents: 'none' }} />
      {vignette &&
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 44%, transparent 48%, rgba(4,14,31,0.40) 100%)'
      }} />
      }
    </div>);

}

// ── BridgeVideo — crossfades in CLEAN live talking footage over a window ───────
// Plays the clip from `clipStart` forward (continuous motion) during [bIn,bOut],
// dissolving in/out. Used to cover the source's truck B-roll + popup span with
// her talking head — no freeze, no cut, same zoom/distance as the main plate.
// NOTE: object-fit "contain" + no zoom so the whole frame stays visible.
function BridgeVideo({ start, src, bIn, bOut, clipStart, zoom = 1, origin = 'center', ox = 3.3, panY = 50, inset = {}, grade = 0.22, fade = 0.5 }) {
  const { time, playing } = useTimeline();
  const ref = React.useRef(null);
  const lt = time - start;
  const inWin = lt >= bIn - 0.6 && lt <= bOut + 0.2;

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const vd = v.duration && isFinite(v.duration) ? v.duration : 15;
    if (!inWin) {if (!v.paused) v.pause();return;}
    const target = clamp(clipStart + (lt - bIn), 0, vd - 0.03);
    if (playing) {
      if (Math.abs(v.currentTime - target) > 0.25) {try {v.currentTime = target;} catch (e) {}}
      if (v.paused) v.play().catch(() => {});
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - target) > 0.03) {try {v.currentTime = target;} catch (e) {}}
    }
  });

  const fIn = Easing.easeInOutCubic(clamp((lt - bIn) / fade, 0, 1));
  const fOut = 1 - Easing.easeInOutCubic(clamp((lt - (bOut - fade)) / fade, 0, 1));
  const op = inWin ? Math.max(0, Math.min(fIn, fOut)) : 0;
  const filter = `saturate(0.98) contrast(1.06) brightness(${1 - grade * 0.4})`;
  // Always mounted (just transparent when idle) so it is buffered + playing
  // BEFORE the window — guarantees the truck underneath is never revealed.
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: op, pointerEvents: 'none', background: HC.bgDeep, ...inset }}>
      <video ref={ref} src={src} muted playsInline preload="auto" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'contain', objectPosition: `${ox}% ${panY}%`,
        transformOrigin: origin, filter
      }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(6,21,43,0.0) 0%, rgba(6,21,43,0.10) 60%, rgba(6,21,43,0.28) 100%)' }} />
    </div>);

}

// ── SeamlessHead — ONE continuous, blended talking head (no cuts, no truck) ───
// scene3.mp4 is 15s with a ~1.5s truck B-roll insert (≈5.85–7.35s) and runs
// shorter than the math scene (~23s). To make the woman on the left read as one
// seamless, dynamically-blended shot — no hard cut, no truck, no loop jump — we
// run TWO stacked layers of the clip looping the CLEAN post-truck talking region
// [loopIn..loopOut], offset by half a period and cross-dissolving continuously.
// When one layer reaches its wrap it fades out while the other (sitting mid-region,
// fully opaque) covers — so the seam is always hidden behind a soft dissolve.
// NOTE: object-fit "contain" + no zoom so the ENTIRE moving frame is shown (no crop).
function SeamlessHead({
  start, end, src,
  loopIn = 7.7, loopOut = 14.8, fade = 1.1,
  zoom = 1, origin = 'center', panKeys = null, panY = 50,
  inset = {}, grade = 0.22, tint = 'navy', vignette = true
}) {
  const { time, playing } = useTimeline();
  const aRef = React.useRef(null);
  const bRef = React.useRef(null);
  const lt = time - start;
  const duration = end - start;
  const active = time >= start - 0.3 && time <= end + 0.05;
  const L = Math.max(1.5, loopOut - loopIn); // loop period
  const half = L / 2;

  // virtual position of each layer inside the clean loop region
  const posA = loopIn + ((lt % L) + L) % L;
  const posB = loopIn + (((lt + half) % L) + L) % L;

  React.useEffect(() => {
    const a = aRef.current, b = bRef.current;
    if (!a || !b) return;
    a.muted = true; b.muted = true;
    if (!active) { if (!a.paused) a.pause(); if (!b.paused) b.pause(); return; }
    const sync = (v, target) => {
      if (playing) {
        if (Math.abs(v.currentTime - target) > 0.25) { try { v.currentTime = target; } catch (e) {} }
        if (v.paused) v.play().catch(() => {});
      } else {
        if (!v.paused) v.pause();
        if (Math.abs(v.currentTime - target) > 0.05) { try { v.currentTime = target; } catch (e) {} }
      }
    };
    sync(a, posA); sync(b, posB);
  });

  // scene in/out envelope
  const tIn = clamp(lt / 0.6, 0, 1);
  const tOut = clamp((lt - (duration - 0.6)) / 0.6, 0, 1);
  const sceneOp = active ? Easing.easeOutCubic(tIn) * (1 - Easing.easeInCubic(tOut)) : 0;

  // each layer fades to 0 only right at its own wrap; the other is mid-region (opaque)
  const phaseA = (((lt % L) + L) % L) / L;          // 0..1
  const phaseB = ((((lt + half) % L) + L) % L) / L;
  const edge = (p) => clamp(Math.min(p, 1 - p) / (fade / L), 0, 1); // dips to 0 at wrap
  let aE = edge(phaseA), bE = edge(phaseB);
  const sum = aE + bE || 1;
  const aOp = sceneOp * (aE / sum);
  const bOp = sceneOp * (bE / sum);

  // shared dynamic framing — both layers track the same crop so the dissolve aligns
  let objPos = `50% ${panY}%`;
  if (panKeys && panKeys.length) {
    const lo = panKeys[0], hi = panKeys[panKeys.length - 1];
    const lk = clamp(lt, lo[0], hi[0]);
    let ox = lo[1];
    for (let i = 0; i < panKeys.length - 1; i++) {
      const [t0, o0] = panKeys[i], [t1, o1] = panKeys[i + 1];
      if (lk >= t0 && lk <= t1) { const f = (lk - t0) / (t1 - t0 || 1); ox = o0 + (o1 - o0) * Easing.easeInOutCubic(f); break; }
    }
    objPos = `${ox}% ${panY}%`;
  }

  const grad = {
    navy: `linear-gradient(180deg, rgba(6,21,43,0.18) 0%, rgba(6,21,43,0.30) 55%, rgba(6,21,43,${0.55 + grade}) 100%)`,
    green: `linear-gradient(180deg, rgba(6,36,30,0.14) 0%, rgba(6,28,40,0.30) 55%, rgba(6,21,43,${0.50 + grade}) 100%)`,
    day: `linear-gradient(180deg, rgba(6,21,43,0.0) 0%, rgba(6,21,43,0.08) 60%, rgba(6,21,43,${0.26 + grade * 0.5}) 100%)`
  }[tint];
  const filter = `saturate(0.98) contrast(1.06) brightness(${1 - grade * 0.4})`;

  const vidStyle = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'contain', objectPosition: objPos,
    transformOrigin: origin, filter
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: HC.bgDeep, ...inset }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: aOp }}>
        <video ref={aRef} src={src} muted playsInline preload="auto" style={vidStyle} />
      </div>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: bOp }}>
        <video ref={bRef} src={src} muted playsInline preload="auto" style={vidStyle} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: grad, pointerEvents: 'none' }} />
      {vignette &&
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 44%, transparent 48%, rgba(4,14,31,0.40) 100%)' }} />
      }
    </div>);

}

// ── LineVoice — speaks a VO line synced to a scene window ──────────────────────
// Primary: an audio file (audioSrc) played in sync with the playhead.
// Fallback: browser SpeechSynthesis (fires once on entry while playing).
// Only audible while the timeline is PLAYING and inside [start,end].
function speakLineTTS(text) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.96;u.pitch = 1.02;u.volume = 1;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices() || [];
      const fem = vs.find((v) => /female|samantha|victoria|karen|moira|tessa|zira|aria|jenny|joanna|salli|kendra/i.test(v.name)) ||
      vs.find((v) => /^en-US/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || vs[0];
      if (fem) u.voice = fem;
      window.speechSynthesis.speak(u);
    };
    if ((window.speechSynthesis.getVoices() || []).length) pick();else
    window.speechSynthesis.onvoiceschanged = pick;
  } catch (e) {}
}

function LineVoice({ start, end, text, audioSrc, enabledFlag = '__hvacS1VO', tts = true }) {
  const { time, playing } = useTimeline();
  const localTime = time - start;
  const duration = end - start;
  const spokenRef = React.useRef(false);
  const audioRef = React.useRef(null);
  const hasFileRef = React.useRef(null); // null=unknown, true=file ok, false=use TTS

  React.useEffect(() => {
    if (!audioSrc) {hasFileRef.current = false;return;}
    const a = new Audio();
    a.preload = 'auto';
    a.addEventListener('canplaythrough', () => {hasFileRef.current = true;}, { once: true });
    a.addEventListener('error', () => {hasFileRef.current = false;}, { once: true });
    a.src = audioSrc;
    audioRef.current = a;
    return () => {
      try {a.pause();} catch (e) {}
      try {if (window.speechSynthesis) window.speechSynthesis.cancel();} catch (e) {}
    };
  }, [audioSrc]);

  React.useEffect(() => {
    const enabled = !!window[enabledFlag];
    const inWin = localTime >= 0 && localTime <= duration + 0.05;
    const a = audioRef.current;
    if (localTime < 0.05) spokenRef.current = false; // re-arm on replay

    if (!enabled || !inWin || !playing) {
      if (a && !a.paused) a.pause();
      try {if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) window.speechSynthesis.pause();} catch (e) {}
      return;
    }
    if (hasFileRef.current === true && a) {
      try {if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel();} catch (e) {}
      const ad = a.duration && isFinite(a.duration) ? a.duration : duration;
      const target = clamp(localTime, 0, ad - 0.02);
      if (Math.abs(a.currentTime - target) > 0.25) {try {a.currentTime = target;} catch (e) {}}
      if (a.paused) a.play().catch(() => {});
    } else if (hasFileRef.current === false) {
      // only when there is NO audio file — never race TTS against a still-loading clip
      if (!tts) return;
      if (!spokenRef.current && localTime < 1.3) {
        spokenRef.current = true;
        speakLineTTS(text);
      } else {
        try {if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();} catch (e) {}
      }
    }
  });

  return null;
}
function HvacChrome({ time, label = 'PAIN · MISSED CALLS' }) {
  const logoIn = clamp((time - 2.0) / 0.8, 0, 1);
  const e = Easing.easeOutCubic(logoIn);
  const t = Math.floor(time);
  const tFmt = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  return (
    <>
      {/* top status strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(4,14,31,0.55), rgba(4,14,31,0))',
        fontFamily: HF.mono, fontSize: 13, fontWeight: 600,
        letterSpacing: '0.28em', textTransform: 'uppercase', color: HC.muted
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: HC.amber, boxShadow: `0 0 10px ${HC.amber}` }} />
          {label}
        </span>
        <span style={{ color: HC.fgSoft, letterSpacing: '0.2em' }}>REC · {tFmt}</span>
      </div>

      {/* lower-left persistent logo */}
      <div style={{
        position: 'absolute', left: 48, bottom: 56, opacity: e,
        transform: `translateY(${(1 - e) * 10}px)`, pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))'
      }}>
        <IvaiLockup scale={0.92} white={true} />
      </div>
    </>);

}

// ── Lower-third stat pill — slides up from bottom, holds, fades ────────────────
// accent: 'amber' (pain) | 'green' (resolution) | 'blue'
function LowerThird({ kicker, headline, accent = 'amber', delay = 0.2, hold = 3.2 }) {
  const { localTime, duration } = useSprite();
  const accColor = accent === 'green' ? HC.green : accent === 'blue' ? HC.blue : HC.amber;
  const tIn = clamp((localTime - delay) / 0.5, 0, 1);
  const startOut = Math.min(delay + hold, duration - 0.45);
  const tOut = clamp((localTime - startOut) / 0.45, 0, 1);
  const e = Easing.easeOutCubic(tIn);
  const oOut = 1 - Easing.easeInCubic(tOut);
  const op = e * oOut;
  if (op <= 0.001) return null;
  return (
    <div style={{
      position: 'absolute', right: 64, bottom: 70,
      opacity: op, transform: `translateY(${(1 - e) * 26}px)`
    }}>
      <div style={{
        display: 'flex', alignItems: 'stretch',
        background: 'rgba(10,32,60,0.92)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${accent === 'green' ? HC.greenRule : accent === 'blue' ? HC.rule : HC.amberRule}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)'
      }}>
        <div style={{ width: 6, background: accColor, flex: '0 0 auto' }} />
        <div style={{ padding: '20px 44px 22px', textAlign: 'center' }}>
          {kicker &&
          <div style={{
            fontFamily: HF.mono, fontSize: 14, fontWeight: 600,
            textTransform: 'uppercase', color: accColor,
            marginBottom: 8, textAlign: 'center', letterSpacing: '0.32em'
          }}>{kicker}</div>
          }
          <div style={{
            fontFamily: HF.display, fontWeight: 800,
            lineHeight: 1.08, color: HC.fg, fontSize: 50,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.018em',
            textAlign: 'center', whiteSpace: 'nowrap'
          }}>{headline}</div>
        </div>
      </div>
    </div>);

}

// ── Captions — the spoken VO line, bottom-center ───────────────────────────────
function Caption({ text, show = true }) {
  const { localTime, duration } = useSprite();
  if (!show || !text) return null;
  const tIn = clamp(localTime / 0.3, 0, 1);
  const tOut = clamp((localTime - (duration - 0.35)) / 0.35, 0, 1);
  const op = Easing.easeOutCubic(tIn) * (1 - Easing.easeInCubic(tOut));
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: 150, transform: 'translateX(-50%)',
      maxWidth: 1280, textAlign: 'center', opacity: op * 0.96, pointerEvents: 'none',
      fontFamily: HF.body, fontSize: 30, fontWeight: 600, color: '#FFFFFF',
      letterSpacing: '-0.005em', lineHeight: 1.3, textWrap: 'balance',
      textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.6)'
    }}>{text}</div>);

}

// ── Big data callout — eyebrow + huge number + subtitle ────────────────────────
function HCallout({ eyebrow, value, unit, subtitle, color = HC.fg, delay = 0, size = 220, glow = HC.blue }) {
  const { localTime } = useSprite();
  const tEye = clamp((localTime - delay) / 0.35, 0, 1);
  const tVal = clamp((localTime - delay - 0.2) / 0.5, 0, 1);
  const tSub = clamp((localTime - delay - 0.65) / 0.4, 0, 1);
  const valScale = 0.92 + 0.08 * Easing.easeOutBack(tVal);
  return (
    <div>
      {eyebrow &&
      <div style={{
        fontFamily: HF.mono, fontSize: 16, fontWeight: 600,
        letterSpacing: '0.30em', textTransform: 'uppercase', color: glow,
        opacity: tEye, transform: `translateX(${(1 - tEye) * -14}px)`, marginBottom: 14
      }}>{eyebrow}</div>
      }
      <div style={{
        fontFamily: HF.display, fontSize: size, fontWeight: 900, color,
        letterSpacing: '-0.04em', lineHeight: 0.96, fontVariantNumeric: 'tabular-nums',
        opacity: tVal, transform: `scale(${valScale})`, transformOrigin: 'left center',
        whiteSpace: 'nowrap', textShadow: `0 0 60px ${glow}55`
      }}>
        {value}
        {unit && <span style={{ fontSize: size * 0.42, color: HC.fgSoft, marginLeft: 10, fontWeight: 800 }}>{unit}</span>}
      </div>
      {subtitle &&
      <div style={{
        fontFamily: HF.body, fontSize: 27, fontWeight: 500, color: HC.fgSoft,
        marginTop: 16, letterSpacing: '-0.005em', maxWidth: 760, lineHeight: 1.3,
        opacity: tSub, transform: `translateY(${(1 - tSub) * 8}px)`, textWrap: 'balance'
      }}>{subtitle}</div>
      }
    </div>);

}

// Headline line that wipes in from the left
function HLine({ text, size = 84, weight = 800, color = HC.fg, width, delay = 0, lh = 1.05 }) {
  const { localTime, duration } = useSprite();
  const tIn = clamp((localTime - delay) / 0.5, 0, 1);
  const e = Easing.easeOutCubic(tIn);
  const tOut = clamp((localTime - (duration - 0.45)) / 0.45, 0, 1);
  return (
    <div style={{
      width, fontFamily: HF.display, fontSize: size, fontWeight: weight, color,
      letterSpacing: '-0.025em', lineHeight: lh, textWrap: 'balance',
      opacity: e * (1 - Easing.easeInCubic(tOut)),
      transform: `translateX(${(1 - e) * -22}px)`
    }}>{text}</div>);

}

// Eyebrow kicker with leading dash
function HKicker({ text, color = HC.blue, delay = 0 }) {
  const { localTime } = useSprite();
  const e = Easing.easeOutCubic(clamp((localTime - delay) / 0.4, 0, 1));
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, opacity: e,
      transform: `translateY(${(1 - e) * -6}px)`,
      fontFamily: HF.mono, fontSize: 16, fontWeight: 600,
      letterSpacing: '0.32em', textTransform: 'uppercase', color
    }}>
      <span style={{ width: 34, height: 3, background: color, borderRadius: 2 }} />
      {text}
    </div>);

}

// Cut flash between scenes
function HCut({ time, marks }) {
  let opacity = 0;
  for (const m of marks) {
    const dt = time - m;
    if (dt >= 0 && dt < 0.16) opacity = Math.max(opacity, (1 - dt / 0.16) * 0.16);
  }
  if (opacity === 0) return null;
  return <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity, pointerEvents: 'none' }} />;
}
