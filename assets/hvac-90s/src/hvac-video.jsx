// hvac-video.jsx — IVAI HVAC cinematic · timeline, Stage, tweaks.
// Loads after animations.jsx, tweaks-panel.jsx, hvac-cinematic.jsx, hvac-scenes.jsx.

const HVAC_TWEAKS = /*EDITMODE-BEGIN*/{
  "pacing": "normal",
  "chrome": true,
  "captions": false
}/*EDITMODE-END*/;

// scene key, base duration (s), spoken VO caption, vo:[audioStart,audioEnd] (seconds
// scene key, base duration (s), spoken VO caption, vo:[audioStart,audioEnd] (seconds
// into assets/narration.mp3 — the Adriana ElevenLabs take, 84.19s). Scenes are timed
// to the user's exact voiceover timestamps; total 1:29.83.
const HVAC_TIMELINE = [
  // Scene cuts = the user's measured line-start timecodes. Voice (assets/narration.mp3,
  // 84.19s) plays CONTINUOUS at natural speed (rate locked 1.0 — never stretched/cut),
  // anchored so her first word lands at 4.00s; visuals cut under it on each mark. Total 1:29.83.
  { key: 'intro',      dur: 4.00,  cap: '' },                                                                                                  // 0.00  -> 4.00
  { key: 'hook',       dur: 8.33,  cap: 'You are spending money every single month just to make your phone ring.', vo: [0, 11.15] },            // 4.00  -> 12.33  (speaks to ~7.22, then silent walking hold)
  { key: 'channels',   dur: 5.11,  cap: 'Google ads. Local service ads. Yard signs. Door hangers. Social media.', vo: [11.15, 14.35] },        // 12.33 -> 17.44
  { key: 'unanswered', dur: 6.42,  cap: 'And when that phone finally rings — nobody picks up.', vo: [14.35, 16.75] },                           // 17.44 -> 23.86
  { key: 'money',      dur: 4.21,  cap: 'That is not a marketing problem. That is a MONEY problem.', vo: [16.75, 19.40] },                      // 23.86 -> 28.07
  { key: 'math',       dur: 16.03, cap: 'The average HVAC company misses thirty percent of inbound calls during peak season. At an average ticket of four hundred dollars per service call — and average ad spend of thirty to fifty dollars per lead — every missed call costs you the lead spend PLUS the job. That is eighty to four hundred and fifty dollars, gone, every time your phone rings and nobody answers.', vo: [19.40, 41.55] }, // 28.07 -> 44.10
  { key: 'competitor', dur: 10.59, cap: "And while you are missing that call — your competitor's truck is pulling into that driveway. YOUR trucks are sitting. YOUR techs are waiting. YOUR schedule has gaps.", vo: [41.55, 50.55] },  // 44.10 -> 54.69
  { key: 'afterhours', dur: 9.47,  cap: "On top of that — HVAC emergencies don't happen at nine in the morning. They happen at ten at night. In July. When it's a hundred and four degrees and a family's AC just died. If nobody answers — they call the next company. Every time.", vo: [50.55, 67.60] }, // 54.69 -> 64.16
  { key: 'evolve',     dur: 11.50, cap: 'Voice AI Agents from Intelligent Voice AI answers every call. Books the job. Dispatches your tech. And handles follow-up for every missed lead — twenty-four hours a day, seven days a week.', vo: [67.60, 77.15] }, // 64.16 -> 75.66
  { key: 'outcomes',   dur: 7.16,  cap: 'Your trucks stay busy. Your techs stay productive. Your revenue stops leaking.', vo: [77.15, 81.10] }, // 75.66 -> 82.82
  { key: 'end',        dur: 7.01,  cap: 'Visit getivai.com/hvac. Stop paying for leads your phone never answers.', vo: [81.10, 84.19] },        // 82.82 -> 89.83
];

function buildSchedule(timeline, factor) {
  let t = 0; const out = {};
  for (const s of timeline) { const d = s.dur * factor; out[s.key] = { start: t, end: t + d, cap: s.cap }; t += d; }
  return { schedule: out, duration: t };
}

// Silent visual HOLDS — the narration audio FREEZES (pauses, never stretches) across
// each window and resumes after. Empty: the voice plays purely continuous (the natural
// pauses in the recording — e.g. walking-and-silent before "Google ads" — come for free).
const HVAC_HOLDS = [];

// Seamless talking-head window (seconds). Scene cuts that land inside this range are
// blended (soft cross-dissolve via the scenes' own opacity fades) instead of hard-cut:
// the HCut white-flash is suppressed here so the 00:28–00:48 narration/talking-head
// segment stays perfectly stable with no cut pop or loop jump.
const HVAC_BLEND_WINDOW = [28, 48];

// Build a schedule whose scene cuts land on the audio-detected line onsets.
// First word is placed at `lead` seconds (the logo intro). Falls back to the
// static timeline durations until/unless detection succeeds.
function buildAutoSchedule(timeline, onsets, audioDur, lead) {
  const spoken = timeline.filter((s) => s.cap);
  const off = lead - onsets[0];
  const out = {};
  const introKey = timeline.find((s) => !s.cap);
  if (introKey) out[introKey.key] = { start: 0, end: onsets[0] + off, cap: '' };
  for (let i = 0; i < spoken.length; i++) {
    const start = onsets[i] + off;
    const end = i + 1 < spoken.length ? onsets[i + 1] + off : audioDur + off + 0.7;
    out[spoken[i].key] = { start, end, cap: spoken[i].cap };
  }
  const dur = out[spoken[spoken.length - 1].key].end;
  return { schedule: out, duration: dur };
}

function HvacApp() {
  const [tweaks, setTweak] = useTweaks(HVAC_TWEAKS);
  const factor = tweaks.pacing === 'tight' ? 0.9 : tweaks.pacing === 'relaxed' ? 1.18 : 1.0;
  window.__hvacCaptions = !!tweaks.captions;
  window.__hvacS1VO = false; // built-in scene audio off; the Adriana narration owns sound

  // Auto-sync: detect each line's start in narration.mp3 and snap scene cuts to it.
  const spokenCount = HVAC_TIMELINE.filter((s) => s.cap).length;
  const [auto, setAuto] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    detectLineOnsets(NAR_SRC, spokenCount)
      .then(({ onsets, duration }) => {
        if (!alive || onsets.length < spokenCount) return; // not enough breaks → keep static
        setAuto({ onsets, audioDur: duration });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const { schedule, duration } = React.useMemo(() => {
    if (auto && auto.onsets.length >= spokenCount) {
      return buildAutoSchedule(HVAC_TIMELINE, auto.onsets, auto.audioDur, 4.0);
    }
    return buildSchedule(HVAC_TIMELINE, factor);
  }, [auto, factor]);

  return (
    <>
      <Stage width={1920} height={1080} duration={duration} background={HC.bgDeep}
        persistKey={`ivai-hvac-${tweaks.pacing}`}>
        <HvacBody tweaks={tweaks} schedule={schedule} />
        <MasterVoice schedule={schedule} timeline={HVAC_TIMELINE} holds={HVAC_HOLDS}
          audioAnchor={auto ? auto.onsets[0] : null} />
        <TimelineBridge />
      </Stage>

      <VoiceControl />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Pacing">
          <TweakRadio label="Cut" value={tweaks.pacing}
            options={[
              { value: 'tight', label: 'Tight · 80s' },
              { value: 'normal', label: 'Normal · 89s' },
              { value: 'relaxed', label: 'Relaxed · 105s' },
            ]}
            onChange={(v) => setTweak('pacing', v)} />
        </TweakSection>
        <TweakSection label="Overlays">
          <TweakToggle label="Broadcast chrome" value={tweaks.chrome} onChange={(v) => setTweak('chrome', v)} />
          <TweakToggle label="VO captions" value={tweaks.captions} onChange={(v) => setTweak('captions', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function HvacBody({ tweaks, schedule }) {
  const time = useTime();

  React.useEffect(() => {
    const root = document.getElementById('hvac-root');
    if (!root) return;
    const sec = Math.floor(time);
    const label = `t=${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    if (root.getAttribute('data-screen-label') !== label) root.setAttribute('data-screen-label', label);
  }, [Math.floor(time)]);

  const S = schedule;
  // Hard-cut flash at every scene boundary — EXCEPT inside the 00:28–00:48 talking-head
  // window, where cuts are cross-dissolved instead of flashed so the segment stays stable.
  const cutMarks = Object.values(S).map(s => s.start)
    .filter(t => t > 0.1)
    .filter(t => !(t >= HVAC_BLEND_WINDOW[0] && t <= HVAC_BLEND_WINDOW[1]));
  // chrome hidden during full-bleed intro & end slate
  const chromeOff = (time < S.hook.start) || (time >= S.end.start);
  const phase = time >= S.evolve.start
    ? { label: 'RESOLUTION · VOICE AI', accent: 'green' }
    : { label: 'PAIN · MISSED CALLS', accent: 'amber' };

  return (
    <div id="hvac-root" data-screen-label="t=00:00" data-screen-label-name="IVAI HVAC"
      style={{ position: 'absolute', inset: 0, background: HC.bgDeep }}>
      <ScIntro      start={S.intro.start}      end={S.intro.end} />
      <ScHook       start={S.hook.start}       end={S.hook.end}       caption={S.hook.cap} />
      <ScChannels   start={S.channels.start}   end={S.channels.end}   caption={S.channels.cap} />
      <ScUnanswered start={S.unanswered.start} end={S.unanswered.end} caption={S.unanswered.cap} />
      <ScMoney      start={S.money.start}      end={S.money.end}      caption={S.money.cap} />
      <ScMath       start={S.math.start}       end={S.math.end}       caption={S.math.cap} />
      <ScCompetitor start={S.competitor.start} end={S.competitor.end} caption={S.competitor.cap} />
      <ScAfterHours start={S.afterhours.start} end={S.afterhours.end} caption={S.afterhours.cap} />
      <ScEvolve     start={S.evolve.start}     end={S.evolve.end}     caption={S.evolve.cap} />
      <ScOutcomes   start={S.outcomes.start}   end={S.outcomes.end}   caption={S.outcomes.cap} />
      <ScEnd        start={S.end.start}        end={S.end.end} />

      {tweaks.chrome && !chromeOff && <HvacChrome time={time} label={phase.label} />}
      <HCut time={time} marks={cutMarks} />
    </div>
  );
}

const _hvacRoot = ReactDOM.createRoot(document.getElementById('app'));
_hvacRoot.render(<HvacApp />);
