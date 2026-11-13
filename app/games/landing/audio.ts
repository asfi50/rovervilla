/**
 * Touchdown's sound: generative music and synthesized effects, all made in the browser with the
 * Web Audio API, so there are no audio files to download or license. Browsers only allow sound
 * after a click, so the engine is created from the title screen's first button.
 */

export type Mood = "title" | "orbit" | "descent" | "surface" | "found" | "crash" | "finale";
export type Sfx =
  | "click"
  | "hover"
  | "confirm"
  | "back"
  | "callout"
  | "thud"
  | "crash"
  | "echo"
  | "found"
  | "chute"
  | "entry"
  | "deploy"
  | "shutter"
  | "light"
  | "star"
  | "static"
  | "type";

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Chords as [bass, ...pad notes] in MIDI numbers. D minor, mostly. */
const CH = {
  Dm9: [38, 50, 57, 60, 64, 65],
  Bbmaj9: [34, 53, 57, 60, 62],
  Fmaj7: [41, 53, 57, 60, 64],
  Cadd9: [36, 55, 60, 62, 64],
  Gm9: [43, 53, 57, 58, 62],
  Asus4: [45, 57, 62, 64],
  A7: [45, 55, 61, 64],
  CE: [40, 55, 60, 64, 67],
  F: [41, 53, 57, 60, 65],
  Dm7: [38, 53, 57, 60, 62],
  Bbmaj7: [34, 53, 57, 62],
  Csus: [36, 53, 55, 60],
  C: [36, 52, 55, 60, 64],
  Dmlow: [26, 38, 45, 50],
} satisfies Record<string, number[]>;
type Step = [number[], number];

/** Progressions: [chord, seconds]. A "next" mood plays once, then hands over. */
const SONGS: Record<Mood, { steps: Step[]; next?: Mood; bells: number; pulse?: boolean }> = {
  title: { steps: [[CH.Dm9, 8], [CH.Bbmaj9, 8], [CH.Fmaj7, 8], [CH.Cadd9, 8]], bells: 0.55 },
  orbit: { steps: [[CH.Dm9, 8], [CH.Bbmaj9, 8], [CH.Fmaj7, 8], [CH.Cadd9, 8]], bells: 0.4 },
  descent: { steps: [[CH.Dm9, 8], [CH.Bbmaj9, 8], [CH.Gm9, 8], [CH.Asus4, 4], [CH.A7, 4]], bells: 0.12, pulse: true },
  surface: { steps: [[CH.Fmaj7, 8], [CH.Cadd9, 8], [CH.Dm9, 8], [CH.Bbmaj9, 8]], bells: 0.35 },
  found: { steps: [[CH.F, 3.2], [CH.CE, 3.2], [CH.Dm7, 3.2], [CH.Bbmaj7, 3.2], [CH.Csus, 2.4], [CH.C, 2.4], [CH.F, 8]], next: "surface", bells: 0.7 },
  crash: { steps: [[CH.Dmlow, 12]], next: "descent", bells: 0 },
  finale: {
    steps: [[CH.Bbmaj9, 6], [CH.F, 6], [CH.CE, 6], [CH.Dm7, 6], [CH.Bbmaj7, 6], [CH.Csus, 3], [CH.C, 3], [CH.F, 12]],
    next: "title",
    bells: 0.8,
  },
};

type Voice = { rel: GainNode; stop: number; nodes: AudioScheduledSourceNode[] };

export class GameAudio {
  readonly ctx: AudioContext;
  private master: GainNode;
  private musicBus: GainNode;
  private sfxBus: GainNode;
  private ambBus: GainNode;
  private padBus: GainNode;
  private padFilter: BiquadFilterNode;
  private bellBus: GainNode;
  private pulseBus: GainNode;
  private pulseFilter: BiquadFilterNode;
  private revSend: GainNode;
  private analyser: AnalyserNode;
  private white: AudioBuffer;
  private pink: AudioBuffer;
  private brown: AudioBuffer;

  private world: "mars" | "moon" = "mars";
  private mood: Mood | null = null;
  private step = 0;
  private nextChord = 0;
  private nextBell = 0;
  private nextPulse = 0;
  private pulseIdx = 0;
  private nextPing = 0;
  private nextPuff = 0;
  private nextAlarm = 0;
  private alarmHi = false;
  private chord: number[] = CH.Dm9;
  private voices: Voice[] = [];
  private tension = 0;
  private sonar: { p: number; kind: "echo" | "machine" } | null = null;
  private rcs = 0;
  private alarm = false;
  private timer: number;
  private musicVol = 0.8;
  private sfxVol = 0.9;
  private muted = false;

  // Continuous sounds.
  private engine: { roar: GainNode; lp: BiquadFilterNode; hiss: GainNode; rumble: GainNode };
  private wind: { g: GainNode };
  private rover: { motor: OscillatorNode; motorG: GainNode; servo: OscillatorNode; servoG: GainNode; crunch: GainNode };
  private radio: GainNode;
  private hum: GainNode;

  constructor() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx({ latencyHint: "interactive" });
    this.ctx = ctx;

    // Master: gentle glue compression, then a limiter so nothing clips.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 24;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -3;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.002;
    lim.release.value = 0.12;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.master = ctx.createGain();
    this.master.connect(comp).connect(lim).connect(this.analyser).connect(ctx.destination);

    this.musicBus = this.gain(this.master, this.musicVol ** 2);
    this.sfxBus = this.gain(this.master, this.sfxVol ** 2);
    this.ambBus = this.gain(this.sfxBus, 1);

    // Reverb: a long, dark synthetic hall shared by music and effects.
    const conv = ctx.createConvolver();
    conv.buffer = this.impulse(4.2);
    const revLp = ctx.createBiquadFilter();
    revLp.type = "lowpass";
    revLp.frequency.value = 4200;
    this.revSend = ctx.createGain();
    this.revSend.connect(conv).connect(revLp).connect(this.gain(this.master, 0.55));

    // Pads go through one slowly breathing low-pass filter.
    this.padBus = ctx.createGain();
    this.padBus.gain.value = 1;
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 1100;
    this.padFilter.Q.value = 0.4;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoAmt = this.gain(this.padFilter.frequency, 380);
    lfo.connect(lfoAmt);
    lfo.start();
    this.padBus.connect(this.padFilter);
    this.padFilter.connect(this.musicBus);
    this.padFilter.connect(this.gain(this.revSend, 0.7));

    // Bells: a soft echo, then the hall.
    this.bellBus = ctx.createGain();
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.43;
    const fb = this.gain(delay, 0.34);
    const fbLp = ctx.createBiquadFilter();
    fbLp.type = "lowpass";
    fbLp.frequency.value = 2600;
    delay.connect(fbLp).connect(fb);
    this.bellBus.connect(this.musicBus);
    this.bellBus.connect(delay);
    delay.connect(this.gain(this.musicBus, 0.5));
    this.bellBus.connect(this.gain(this.revSend, 0.9));

    // Descent pulse.
    this.pulseFilter = ctx.createBiquadFilter();
    this.pulseFilter.type = "lowpass";
    this.pulseFilter.frequency.value = 600;
    this.pulseFilter.Q.value = 3;
    this.pulseBus = ctx.createGain();
    this.pulseBus.gain.value = 0;
    this.pulseFilter.connect(this.pulseBus);
    this.pulseBus.connect(this.musicBus);
    this.pulseBus.connect(this.gain(this.revSend, 0.35));

    this.white = this.noise("white");
    this.pink = this.noise("pink");
    this.brown = this.noise("brown");

    // Engine: low roar, a little hiss, and sub rumble.
    const roarSrc = this.loop(this.brown);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 200;
    const roar = this.gain(this.sfxBus, 0);
    roarSrc.connect(lp).connect(roar);
    const hissSrc = this.loop(this.white);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.6;
    const hiss = this.gain(this.sfxBus, 0);
    hissSrc.connect(bp).connect(hiss);
    const sub = ctx.createOscillator();
    sub.frequency.value = 38;
    const rumble = this.gain(this.sfxBus, 0);
    sub.connect(rumble);
    sub.start();
    this.engine = { roar, lp, hiss, rumble };

    // Wind: pink noise through a wandering band-pass.
    const windSrc = this.loop(this.pink);
    const wbp = ctx.createBiquadFilter();
    wbp.type = "bandpass";
    wbp.frequency.value = 420;
    wbp.Q.value = 0.7;
    const wl = ctx.createOscillator();
    wl.frequency.value = 0.11;
    wl.connect(this.gain(wbp.frequency, 230));
    wl.start();
    const g = this.gain(this.ambBus, 0);
    windSrc.connect(wbp).connect(g);
    this.wind = { g };

    // Rover: motor, servo whine, wheels on gravel.
    const motor = ctx.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.value = 70;
    const mlp = ctx.createBiquadFilter();
    mlp.type = "lowpass";
    mlp.frequency.value = 360;
    const motorG = this.gain(this.sfxBus, 0);
    motor.connect(mlp).connect(motorG);
    motor.start();
    const servo = ctx.createOscillator();
    servo.frequency.value = 700;
    const servoG = this.gain(this.sfxBus, 0);
    servo.connect(servoG);
    servo.start();
    const crunchSrc = this.loop(this.white);
    const cbp = ctx.createBiquadFilter();
    cbp.type = "bandpass";
    cbp.frequency.value = 3200;
    cbp.Q.value = 1.1;
    const crunch = this.gain(this.sfxBus, 0);
    crunchSrc.connect(cbp).connect(crunch);
    this.rover = { motor, motorG, servo, servoG, crunch };

    // Radio bed under Ground's voice.
    const radioSrc = this.loop(this.white);
    const rbp = ctx.createBiquadFilter();
    rbp.type = "bandpass";
    rbp.frequency.value = 2200;
    rbp.Q.value = 1.4;
    this.radio = this.gain(this.sfxBus, 0);
    radioSrc.connect(rbp).connect(this.radio);

    // Faint electrical hum of the lander's systems; the Moon has no wind to cover silence.
    const h1 = ctx.createOscillator();
    h1.frequency.value = 110;
    const h2 = ctx.createOscillator();
    h2.frequency.value = 220.6;
    this.hum = this.gain(this.ambBus, 0);
    const hlp = ctx.createBiquadFilter();
    hlp.type = "lowpass";
    hlp.frequency.value = 400;
    h1.connect(hlp);
    h2.connect(this.gain(hlp, 0.4));
    hlp.connect(this.hum);
    h1.start();
    h2.start();

    this.timer = window.setInterval(() => this.tick(), 40);
  }

  // ---------- plumbing ----------

  private gain(to: AudioNode | AudioParam, v: number) {
    const g = this.ctx.createGain();
    g.gain.value = v;
    g.connect(to as AudioNode);
    return g;
  }

  private noise(kind: "white" | "pink" | "brown") {
    const len = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0, peak = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w;
      else if (kind === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last;
      }
      peak = Math.max(peak, Math.abs(d[i]));
    }
    for (let i = 0; i < len; i++) d[i] /= peak || 1;
    return buf;
  }

  private impulse(seconds: number) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * (1 - t) ** 2.6 * Math.min(1, i / (rate * 0.012));
      }
    }
    return buf;
  }

  private loop(buf: AudioBuffer) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.loopStart = Math.random() * 1.5;
    s.start(0, Math.random() * 2);
    return s;
  }

  private osc(type: OscillatorType, f: number, t: number) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    return o;
  }

  /** A short enveloped tone into `to`. */
  private tone(to: AudioNode, f: number, t: number, dur: number, peak: number, type: OscillatorType = "sine", attack = 0.004) {
    const o = this.osc(type, f, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(to);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  /** A burst of filtered noise. */
  private burst(to: AudioNode, t: number, dur: number, peak: number, filter: BiquadFilterType, f: number, q = 1, f2?: number, buf = this.white) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    const bq = this.ctx.createBiquadFilter();
    bq.type = filter;
    bq.frequency.setValueAtTime(f, t);
    if (f2) bq.frequency.exponentialRampToValueAtTime(f2, t + dur);
    bq.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + Math.min(0.01, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bq).connect(g).connect(to);
    s.start(t, Math.random() * 2);
    s.stop(t + dur + 0.05);
  }

  /** A soft glassy bell: a few inharmonic partials with different decays. */
  private bell(midi: number, t: number, peak = 0.05, to: AudioNode = this.bellBus) {
    const f = mtof(midi);
    this.tone(to, f, t, 2.8, peak, "sine", 0.006);
    this.tone(to, f * 2.0, t, 1.2, peak * 0.28, "sine", 0.004);
    this.tone(to, f * 3.01, t, 0.5, peak * 0.1, "sine", 0.003);
    if (this.world === "moon") this.tone(to, f * 4.2, t, 0.35, peak * 0.05, "sine", 0.002);
  }

  // ---------- music ----------

  private playChord(notes: number[], t: number, dur: number) {
    // Release whatever is still sounding.
    for (const v of this.voices) {
      v.rel.gain.setTargetAtTime(0, t, 1.1);
      for (const n of v.nodes) n.stop(t + 6);
    }
    this.voices = [];
    this.chord = notes;
    const [bass, ...pad] = notes;
    const moon = this.world === "moon";
    const atk = Math.min(2.4, dur * 0.35);
    const rel = this.ctx.createGain();
    rel.gain.value = 1;
    rel.connect(this.padBus);
    const nodes: AudioScheduledSourceNode[] = [];
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + atk);
    env.connect(rel);
    const per = 0.05 / Math.sqrt(pad.length);
    for (const m of pad) {
      for (const det of moon ? [-4, 5] : [-8, 7]) {
        const o = this.osc(moon ? "triangle" : "sawtooth", mtof(m), t);
        o.detune.value = det + (Math.random() - 0.5) * 3;
        const g = this.ctx.createGain();
        g.gain.value = moon ? per * 1.6 : per;
        o.connect(g).connect(env);
        o.start(t);
        nodes.push(o);
      }
    }
    // Sub bass.
    const b = this.osc("sine", mtof(bass), t);
    const bg = this.ctx.createGain();
    bg.gain.value = 0.11;
    b.connect(bg).connect(env);
    b.start(t);
    nodes.push(b);
    this.voices.push({ rel, stop: t + dur + 8, nodes });
  }

  private tick() {
    const ctx = this.ctx;
    if (ctx.state !== "running") return;
    const now = ctx.currentTime;
    const ahead = now + 0.3;
    const song = this.mood ? SONGS[this.mood] : null;

    if (song) {
      while (this.nextChord < ahead) {
        if (this.step >= song.steps.length) {
          if (song.next) {
            this.setMood(song.next, this.world, this.nextChord);
            return;
          }
          this.step = 0;
        }
        const [notes, dur] = song.steps[this.step];
        this.playChord(notes, Math.max(now, this.nextChord), dur);
        this.nextChord += dur;
        this.step++;
      }
      // Bells drift over the pad, picked from the chord so they always fit.
      while (this.nextBell < ahead) {
        if (song.bells > 0 && Math.random() < song.bells) {
          const pad = this.chord.slice(1);
          const m = pad[Math.floor(Math.random() * pad.length)] + (Math.random() < 0.6 ? 12 : 24);
          this.bell(Math.min(88, m), this.nextBell, 0.035 + Math.random() * 0.025);
        }
        this.nextBell += 0.9 + Math.random() * 2.2;
      }
      // Descent: a pulse that tightens as the ground comes up.
      if (song.pulse) {
        const spb = 60 / (92 + this.tension * 24) / 4;
        while (this.nextPulse < ahead) {
          const pad = this.chord.slice(1);
          const pat = [0, 2, 1, 2];
          const m = pad[pat[this.pulseIdx % 4] % pad.length] + (this.pulseIdx % 8 === 0 ? 0 : 12);
          this.tone(this.pulseFilter, mtof(m), this.nextPulse, 0.16, 0.11, "triangle", 0.003);
          if (this.tension > 0.55 && this.pulseIdx % 16 === 0) this.kick(this.nextPulse, 0.32 * this.tension);
          if (this.tension > 0.55 && this.pulseIdx % 16 === 3) this.kick(this.nextPulse, 0.2 * this.tension);
          this.pulseIdx++;
          this.nextPulse += spb;
        }
      } else this.nextPulse = ahead;
    }

    // Sonar: pings speed up as you close in.
    if (this.sonar) {
      while (this.nextPing < ahead) {
        const p = this.sonar.p;
        const f = this.sonar.kind === "echo" ? 1480 : 990;
        this.tone(this.sfxBus, f * (1 + p * 0.12), this.nextPing, 0.45, 0.05 + p * 0.05);
        this.tone(this.revSend, f * 2, this.nextPing, 0.3, 0.02 + p * 0.02);
        this.nextPing += 2.4 - p * 2.05;
      }
    } else this.nextPing = ahead;

    // RCS: little puffs while the thrusters fire.
    if (this.rcs > 0.05) {
      while (this.nextPuff < ahead) {
        this.burst(this.sfxBus, this.nextPuff, 0.07, 0.07 * this.rcs, "bandpass", 3600, 0.8);
        this.nextPuff += 0.09 + Math.random() * 0.04;
      }
    } else this.nextPuff = ahead;

    // Low-fuel alarm.
    if (this.alarm) {
      while (this.nextAlarm < ahead) {
        this.alarmHi = !this.alarmHi;
        const f = this.alarmHi ? 920 : 700;
        const t = this.nextAlarm;
        const o = this.osc("square", f, t);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.025, t + 0.01);
        g.gain.setValueAtTime(0.025, t + 0.13);
        g.gain.linearRampToValueAtTime(0, t + 0.15);
        o.connect(lp).connect(g).connect(this.sfxBus);
        o.start(t);
        o.stop(t + 0.2);
        this.nextAlarm += this.alarmHi ? 0.18 : 0.82;
      }
    } else this.nextAlarm = ahead;
  }

  private kick(t: number, peak: number) {
    const o = this.osc("sine", 70, t);
    o.frequency.exponentialRampToValueAtTime(34, t + 0.22);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(this.musicBus);
    o.start(t);
    o.stop(t + 0.4);
  }

  // ---------- public API ----------

  async resume() {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  /** Switch music. Moon and Mars share themes but use different instruments. */
  setMood(mood: Mood, world: "mars" | "moon" = this.world, at?: number) {
    if (mood === this.mood && world === this.world && at === undefined) return;
    this.world = world;
    this.mood = mood;
    this.step = 0;
    const now = this.ctx.currentTime;
    this.nextChord = at ?? now + 0.05;
    this.nextBell = this.nextChord + 1.5;
    this.nextPulse = this.nextChord;
    this.pulseIdx = 0;
    const p = this.pulseBus.gain;
    p.setTargetAtTime(mood === "descent" ? 0.25 + this.tension * 0.75 : 0, now, 0.4);
    this.padFilter.frequency.setTargetAtTime(mood === "crash" ? 380 : mood === "found" || mood === "finale" ? 1600 : 1100, now, 1.2);
    this.padBus.gain.setTargetAtTime(mood === "descent" ? 0.75 : 1, now, 0.8);
    if (mood === "found") this.motif("found", now + 0.6);
    if (mood === "title") this.motif("title", now + 2.5);
  }

  /** 0 high up, 1 near the ground. */
  setTension(t: number) {
    this.tension = Math.max(0, Math.min(1, t));
    const now = this.ctx.currentTime;
    if (this.mood === "descent") {
      this.pulseBus.gain.setTargetAtTime(0.25 + this.tension * 0.75, now, 0.3);
      this.pulseFilter.frequency.setTargetAtTime(500 + this.tension * 2200, now, 0.3);
    }
  }

  /** The signal motif: a short call on the bells. */
  motif(kind: "title" | "found", t = this.ctx.currentTime + 0.05) {
    const notes = kind === "title" ? [69, 74, 77, 76] : [72, 77, 81, 84];
    const gaps = kind === "title" ? [0, 0.42, 0.84, 1.7] : [0, 0.38, 0.76, 1.5];
    notes.forEach((m, i) => this.bell(m, t + gaps[i], 0.07));
  }

  setVolume(music: number, sfx: number) {
    this.musicVol = music;
    this.sfxVol = sfx;
    this.applyVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyVolume();
  }

  private applyVolume() {
    const now = this.ctx.currentTime;
    this.musicBus.gain.setTargetAtTime(this.muted ? 0 : this.musicVol ** 2, now, 0.08);
    this.sfxBus.gain.setTargetAtTime(this.muted ? 0 : this.sfxVol ** 2, now, 0.08);
  }

  setEngine(throttle: number) {
    const t = this.ctx.currentTime;
    const th = Math.max(0, Math.min(1, throttle));
    const moon = this.world === "moon";
    this.engine.roar.gain.setTargetAtTime(th * (moon ? 0.38 : 0.5), t, 0.04);
    this.engine.lp.frequency.setTargetAtTime((moon ? 120 : 160) + th * (moon ? 420 : 800), t, 0.06);
    this.engine.hiss.gain.setTargetAtTime(th * (moon ? 0.015 : 0.05), t, 0.05);
    this.engine.rumble.gain.setTargetAtTime(th * 0.16, t, 0.05);
  }

  setRcs(level: number) {
    this.rcs = level;
  }

  setWind(level: number) {
    this.wind.g.gain.setTargetAtTime(Math.max(0, level) * 0.24, this.ctx.currentTime, 0.5);
  }

  setHum(on: boolean) {
    this.hum.gain.setTargetAtTime(on ? 0.012 : 0, this.ctx.currentTime, 0.6);
  }

  /** speed 0..1 */
  setRover(speed: number) {
    const t = this.ctx.currentTime;
    const s = Math.max(0, Math.min(1, speed));
    this.rover.motor.frequency.setTargetAtTime(55 + s * 70, t, 0.1);
    this.rover.motorG.gain.setTargetAtTime(s * 0.07, t, 0.1);
    this.rover.servo.frequency.setTargetAtTime(520 + s * 520, t, 0.1);
    this.rover.servoG.gain.setTargetAtTime(s * 0.008, t, 0.1);
    this.rover.crunch.gain.setTargetAtTime(s * (0.02 + Math.random() * 0.05), t, 0.03);
  }

  /** p 0 far .. 1 close; null stops the pings. */
  setSonar(p: number | null, kind: "echo" | "machine" = "machine") {
    this.sonar = p === null ? null : { p: Math.max(0, Math.min(1, p)), kind };
  }

  setAlarm(on: boolean) {
    this.alarm = on;
  }

  setRadio(on: boolean) {
    this.radio.gain.setTargetAtTime(on ? 0.008 : 0, this.ctx.currentTime, 0.08);
  }

  /** Quindar tones: the beeps that opened (2525 Hz) and closed (2475 Hz) Apollo transmissions. */
  quindar(open: boolean) {
    const t = this.ctx.currentTime + 0.01;
    this.tone(this.sfxBus, open ? 2525 : 2475, t, 0.25, 0.035, "sine", 0.004);
    this.burst(this.sfxBus, t + (open ? 0.25 : 0), 0.12, 0.03, "bandpass", 2000, 1.5);
  }

  /** Stop every continuous sound (between scenes). */
  quiet() {
    this.setEngine(0);
    this.setRcs(0);
    this.setWind(0);
    this.setRover(0);
    this.setSonar(null);
    this.setAlarm(false);
    this.setRadio(false);
    this.setHum(false);
  }

  play(name: Sfx, n = 0) {
    const c = this.ctx;
    const t = c.currentTime + 0.005;
    const S = this.sfxBus;
    switch (name) {
      case "hover":
        this.tone(S, 2600, t, 0.03, 0.012);
        break;
      case "click":
        this.tone(S, 1700, t, 0.05, 0.05);
        this.burst(S, t, 0.02, 0.02, "highpass", 5000);
        break;
      case "type":
        this.burst(S, t, 0.015, 0.012, "bandpass", 3000 + Math.random() * 1500, 3);
        break;
      case "confirm":
        this.bell(81, t, 0.05, S);
        this.bell(88, t + 0.07, 0.04, S);
        break;
      case "back":
        this.bell(88, t, 0.04, S);
        this.bell(81, t + 0.07, 0.04, S);
        break;
      case "callout":
        this.tone(S, 1250, t, 0.08, 0.04);
        break;
      case "static":
        this.burst(S, t, 0.18, 0.05, "bandpass", 1800, 0.8);
        break;
      case "chute": {
        this.burst(S, t, 0.5, 0.35, "bandpass", 900, 0.6, 300);
        const o = this.osc("sine", 140, t);
        o.frequency.exponentialRampToValueAtTime(55, t + 0.3);
        const g = c.createGain();
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        o.connect(g).connect(S);
        o.start(t);
        o.stop(t + 0.5);
        break;
      }
      case "entry":
        this.burst(S, t, 3.2, 0.3, "bandpass", 2400, 0.5, 220, this.pink);
        this.burst(this.revSend, t, 3.2, 0.12, "bandpass", 1800, 0.5, 200, this.pink);
        break;
      case "thud": {
        const o = this.osc("sine", 95, t);
        o.frequency.exponentialRampToValueAtTime(36, t + 0.35);
        const g = c.createGain();
        g.gain.setValueAtTime(0.65, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g).connect(S);
        o.start(t);
        o.stop(t + 0.55);
        this.burst(S, t, 1.1, 0.22, "lowpass", 700, 0.5, 200, this.brown);
        this.burst(S, t + 0.02, 0.28, 0.08, "bandpass", 1800, 9);
        break;
      }
      case "crash": {
        const o = this.osc("sine", 72, t);
        o.frequency.exponentialRampToValueAtTime(22, t + 1.3);
        const g = c.createGain();
        g.gain.setValueAtTime(0.9, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.connect(g).connect(S);
        o.start(t);
        o.stop(t + 1.7);
        this.burst(S, t, 2.0, 0.7, "lowpass", 4500, 0.4, 140, this.brown);
        this.burst(this.revSend, t, 1.2, 0.4, "lowpass", 3000, 0.4, 200);
        for (let i = 0; i < 22; i++) this.burst(S, t + 0.1 + Math.random() * 1.6, 0.03 + Math.random() * 0.05, 0.05 + Math.random() * 0.08, "bandpass", 1500 + Math.random() * 4000, 2);
        // Then the radio drops out.
        const lo = this.osc("sine", 1000, t + 1.4);
        lo.frequency.exponentialRampToValueAtTime(180, t + 2.3);
        const lg = c.createGain();
        lg.gain.setValueAtTime(0, t + 1.4);
        lg.gain.linearRampToValueAtTime(0.03, t + 1.45);
        lg.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
        lo.connect(lg).connect(S);
        lo.start(t + 1.4);
        lo.stop(t + 2.5);
        this.burst(S, t + 1.4, 1.2, 0.05, "bandpass", 2000, 0.7);
        break;
      }
      case "echo": {
        const pad = this.chord.slice(1);
        [0, 1, 2, 3].forEach((i) => this.bell(pad[i % pad.length] + 24 - (i < pad.length ? 0 : 12), t + i * 0.085, 0.06, this.bellBus));
        this.bell(93, t + 0.4, 0.03);
        break;
      }
      case "found":
        this.motif("found", t);
        break;
      case "light":
        [69, 76, 81, 88].forEach((m, i) => this.bell(m, t + i * 0.12, 0.05));
        break;
      case "star":
        this.bell(84 + n * 5, t, 0.07, S);
        this.bell(91 + n * 5, t + 0.05, 0.03, S);
        break;
      case "deploy": {
        const o = this.osc("sawtooth", 260, t);
        o.frequency.linearRampToValueAtTime(640, t + 1.3);
        const lp = c.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 900;
        const g = c.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.04, t + 0.1);
        g.gain.setValueAtTime(0.04, t + 1.2);
        g.gain.linearRampToValueAtTime(0, t + 1.4);
        o.connect(lp).connect(g).connect(S);
        o.start(t);
        o.stop(t + 1.5);
        this.burst(S, t + 1.45, 0.2, 0.12, "bandpass", 900, 3);
        break;
      }
      case "shutter":
        this.burst(S, t, 0.02, 0.2, "bandpass", 3000, 2);
        this.burst(S, t + 0.09, 0.03, 0.15, "bandpass", 2200, 2);
        break;
    }
  }

  /** Current output level, for tests. */
  levels() {
    const a = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(a);
    let peak = 0;
    let sum = 0;
    for (const v of a) {
      peak = Math.max(peak, Math.abs(v));
      sum += v * v;
    }
    return { peak, rms: Math.sqrt(sum / a.length) };
  }

  dispose() {
    clearInterval(this.timer);
    this.ctx.close();
  }
}
