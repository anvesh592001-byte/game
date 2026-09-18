// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — audio.js
// Procedural WebAudio: festival music, mystery, epic phase-3,
// boss themes, and full SFX library. No external files.
// ============================================================
'use strict';

const Audio2 = {
  ctx: null, master: null, musicGain: null, sfxGain: null, dlgGain: null,
  unlocked: false, curTrack: null, musicTimer: null, step: 0, trackName: null,

  unlock() {
    if (this.unlocked) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.master);
      this.dlgGain = this.ctx.createGain(); this.dlgGain.connect(this.master);
      this.unlocked = true;
      this.applyVolumes();
      if (this.pendingTrack) this.play(this.pendingTrack);
    } catch (e) { }
  },
  applyVolumes() {
    if (!this.unlocked) return;
    const s = SaveSys.data.settings;
    this.master.gain.value = s.master;
    this.musicGain.gain.value = s.music * 0.5;
    this.sfxGain.gain.value = s.sfx;
    this.dlgGain.gain.value = s.dialogueVol;
  },

  // ---- low level tone helpers ----
  tone(freq, dur, type = 'sine', vol = 0.3, dest, when = 0, slideTo = null) {
    if (!this.unlocked) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.3, freq = 1000, q = 1, dest, when = 0) {
    if (!this.unlocked) return;
    const t = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || this.sfxGain);
    src.start(t);
  },

  // ---- SFX library ----
  sfx(name) {
    if (!this.unlocked) return;
    const S = this;
    const fx = {
      jump() { S.tone(300, 0.18, 'square', 0.12, null, 0, 560); },
      land() { S.noise(0.08, 0.2, 300, 1); },
      dash() { S.noise(0.16, 0.22, 2200, 2); S.tone(900, 0.14, 'sawtooth', 0.06, null, 0, 300); },
      attack() { S.noise(0.09, 0.25, 1800, 3); S.tone(220, 0.08, 'square', 0.08, null, 0, 120); },
      hit() { S.noise(0.1, 0.3, 700, 2); S.tone(140, 0.12, 'square', 0.18, null, 0, 60); },
      hurt() { S.tone(400, 0.2, 'sawtooth', 0.15, null, 0, 100); S.noise(0.15, 0.2, 500, 1); },
      enemyDie() { S.noise(0.3, 0.25, 400, 1); S.tone(300, 0.35, 'sawtooth', 0.1, null, 0, 50); },
      power() { S.tone(440, 0.3, 'sine', 0.2, null, 0, 880); S.tone(660, 0.35, 'sine', 0.12, null, 0.05, 1320); },
      ult() { S.tone(220, 0.7, 'sawtooth', 0.2, null, 0, 880); S.noise(0.6, 0.3, 900, 0.7); S.tone(440, 0.8, 'sine', 0.18, null, 0.1, 1760); },
      shield() { S.tone(700, 0.4, 'sine', 0.14, null, 0, 900); },
      heal() { S.tone(523, 0.2, 'sine', 0.15); S.tone(659, 0.2, 'sine', 0.15, null, 0.12); S.tone(784, 0.3, 'sine', 0.15, null, 0.24); },
      projectile() { S.tone(800, 0.15, 'sine', 0.12, null, 0, 400); },
      explode() { S.noise(0.5, 0.4, 250, 0.7); S.tone(90, 0.5, 'sine', 0.3, null, 0, 40); },
      checkpoint() { S.tone(523, 0.15, 'sine', 0.18); S.tone(784, 0.2, 'sine', 0.18, null, 0.14); S.tone(1046, 0.4, 'sine', 0.18, null, 0.28); },
      pickup() { S.tone(880, 0.1, 'sine', 0.14); S.tone(1320, 0.16, 'sine', 0.14, null, 0.08); },
      ui() { S.tone(600, 0.06, 'sine', 0.12); },
      uiConfirm() { S.tone(600, 0.08, 'sine', 0.14); S.tone(900, 0.14, 'sine', 0.14, null, 0.07); },
      uiBack() { S.tone(500, 0.08, 'sine', 0.12, null, 0, 300); },
      pause() { S.tone(400, 0.1, 'sine', 0.12); S.tone(300, 0.12, 'sine', 0.12, null, 0.08); },
      bell() { S.tone(1560, 1.6, 'sine', 0.12); S.tone(2340, 1.2, 'sine', 0.05, null, 0.01); },
      drum() { S.tone(120, 0.25, 'sine', 0.4, null, 0, 60); S.noise(0.06, 0.15, 900, 1); },
      dhol() { S.tone(180, 0.18, 'sine', 0.35, null, 0, 90); S.noise(0.09, 0.2, 2500, 2); },
      door() { S.noise(0.6, 0.25, 150, 0.8); S.tone(70, 0.7, 'sine', 0.25, null, 0, 45); },
      rumble() { S.tone(50, 1.4, 'sine', 0.35, null, 0, 30); S.noise(1.2, 0.25, 120, 0.6); },
      wind() { S.noise(1.6, 0.12, 500, 0.4); },
      bossRoar() { S.tone(90, 1.1, 'sawtooth', 0.3, null, 0, 45); S.noise(1.0, 0.3, 300, 0.7); S.tone(140, 0.9, 'square', 0.12, null, 0.1, 60); },
      teleport() { S.tone(1200, 0.3, 'sine', 0.15, null, 0, 100); S.noise(0.25, 0.2, 3000, 3); },
      corrupt() { S.tone(160, 0.6, 'sawtooth', 0.14, null, 0, 55); S.noise(0.5, 0.15, 250, 1); },
      seal() { S.tone(180, 2.2, 'sine', 0.25, null, 0, 60); S.tone(360, 1.8, 'sine', 0.12, null, 0.3, 90); S.noise(2.0, 0.2, 200, 0.5); },
      stinger() { S.tone(110, 1.6, 'sawtooth', 0.22, null, 0, 108); S.tone(116, 1.6, 'sawtooth', 0.18, null, 0.02, 112); },
      talk() { S.tone(rnd(280, 420), 0.05, 'sine', 0.05, S.dlgGain); },
      talkLow() { S.tone(rnd(90, 130), 0.09, 'sawtooth', 0.06, S.dlgGain); },
      victory() { [523, 659, 784, 1046].forEach((f, i) => S.tone(f, 0.4, 'sine', 0.16, null, i * 0.16)); },
    };
    if (fx[name]) fx[name]();
  },

  // ---- MUSIC (generative sequencer) ----
  // scales: mayamalavagowla-ish festival, dark phrygian, epic
  play(name) {
    if (!this.unlocked) { this.pendingTrack = name; return; }
    if (this.trackName === name) return;
    this.stopMusic();
    this.trackName = name;
    if (name === 'none') return;
    this.step = 0;
    const bpmMap = { festival: 128, mystery: 76, tension: 96, dark: 84, epic: 120, boss: 140, finalboss: 150, sad: 60, title: 92, victory: 110 };
    const bpm = bpmMap[name] || 100;
    const interval = 60000 / bpm / 4; // 16th notes
    this.musicTimer = setInterval(() => this.tick(name), interval);
  },
  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null; this.trackName = null;
  },
  n(semis, base = 220) { return base * Math.pow(2, semis / 12); },
  tick(name) {
    if (!this.unlocked || document.hidden) return;
    const s = this.step++; const S = this; const M = this.musicGain;
    const bar = Math.floor(s / 16) % 8, beat = s % 16;
    // scales (semitone offsets)
    const fest = [0, 1, 4, 5, 7, 8, 11, 12];       // mayamalavagowla
    const dark = [0, 1, 3, 5, 7, 8, 10, 12];       // phrygian
    const epic = [0, 2, 3, 5, 7, 8, 11, 12];       // harmonic minor
    const pick = (arr, r) => arr[Math.floor(r * arr.length)];
    const rand = makeRng(s * 7919 + name.length * 131);

    if (name === 'festival' || name === 'victory') {
      // dhol pattern
      if (beat % 4 === 0) S.sfxDrum(120, 0.3, M);
      if (beat === 4 || beat === 12) S.sfxDrum(200, 0.22, M);
      if (beat % 2 === 1 && rand() < 0.5) S.noise(0.04, 0.05, 6000, 3, M);
      // melody — flute-ish sine
      if (beat % 2 === 0 && rand() < 0.75) {
        const deg = pick(fest, rand());
        S.tone(S.n(deg + (bar % 2 ? 12 : 0), 330), 0.22, 'triangle', 0.10, M);
      }
      // drone
      if (beat === 0) { S.tone(S.n(0, 110), 1.8, 'sawtooth', 0.03, M); S.tone(S.n(7, 110), 1.8, 'sawtooth', 0.02, M); }
      if (beat === 8 && bar % 4 === 3) S.sfx('bell');
    } else if (name === 'title') {
      if (beat === 0) { S.tone(S.n(0, 110), 2.4, 'sine', 0.08, M); S.tone(S.n(7, 110), 2.4, 'sine', 0.05, M); }
      if (beat % 4 === 0 && rand() < 0.6) S.tone(S.n(pick(fest, rand()), 220), 0.8, 'sine', 0.07, M);
      if (beat === 8 && bar % 2 === 0) S.tone(1560, 2.0, 'sine', 0.04, M);
    } else if (name === 'mystery') {
      if (beat === 0) { S.tone(S.n(0, 82), 3.2, 'sine', 0.09, M); S.tone(S.n(1, 82), 3.2, 'sine', 0.04, M); }
      if (beat === 8 && rand() < 0.5) S.tone(S.n(pick(dark, rand()), 164), 1.4, 'sine', 0.05, M);
      if (beat % 8 === 4 && rand() < 0.4) S.noise(0.8, 0.03, 300, 0.5, M);
      if (bar % 4 === 2 && beat === 0) S.tone(1560, 3.0, 'sine', 0.02, M);
    } else if (name === 'tension') {
      if (beat % 4 === 0) S.sfxDrum(80, 0.25, M);
      if (beat === 14) S.sfxDrum(140, 0.15, M);
      if (beat === 0) S.tone(S.n(0, 98), 2.0, 'sawtooth', 0.04, M);
      if (beat % 2 === 0 && rand() < 0.4) S.tone(S.n(pick(dark, rand()), 196), 0.3, 'triangle', 0.05, M);
    } else if (name === 'dark') {
      if (beat === 0) { S.tone(S.n(0, 65), 3.4, 'sawtooth', 0.06, M); S.tone(S.n(1, 65), 3.4, 'sawtooth', 0.035, M); }
      if (beat === 8 && bar % 2) S.sfxDrum(60, 0.3, M);
      if (beat % 8 === 0 && rand() < 0.45) S.tone(S.n(pick(dark, rand()) - 12, 196), 1.8, 'sine', 0.04, M);
    } else if (name === 'epic') {
      if (beat % 4 === 0) S.sfxDrum(100, 0.32, M);
      if (beat === 6 || beat === 10) S.sfxDrum(180, 0.2, M);
      if (beat === 0) { S.tone(S.n([0, 5, 3, 7][bar % 4], 110), 2.0, 'sawtooth', 0.05, M); S.tone(S.n([0, 5, 3, 7][bar % 4] + 7, 110), 2.0, 'sawtooth', 0.03, M); }
      if (beat % 2 === 0 && rand() < 0.7) S.tone(S.n(pick(epic, rand()) + [0, 5, 3, 7][bar % 4], 330), 0.25, 'triangle', 0.08, M);
    } else if (name === 'boss' || name === 'finalboss') {
      const fb = name === 'finalboss';
      if (beat % 2 === 0) S.sfxDrum(beat % 8 === 0 ? 90 : 150, beat % 8 === 0 ? 0.34 : 0.16, M);
      if (beat === 0) { S.tone(S.n([0, 1, 0, 5][bar % 4], 73), 1.8, 'sawtooth', 0.07, M); }
      if (beat % 4 === 2 && rand() < 0.7) S.tone(S.n(pick(dark, rand()) + (fb ? 12 : 0), 146), 0.2, 'square', 0.045, M);
      if (fb && beat === 8) S.tone(S.n(pick(epic, rand()), 440), 0.4, 'triangle', 0.06, M);
    } else if (name === 'sad') {
      if (beat === 0) S.tone(S.n([0, -4, -2, -5][bar % 4], 220), 3.6, 'sine', 0.07, M);
      if (beat === 8 && rand() < 0.6) S.tone(S.n(pick(epic, rand()), 440), 1.6, 'sine', 0.04, M);
    }
  },
  sfxDrum(f, v, dest) { this.tone(f, 0.22, 'sine', v, dest, 0, f * 0.5); this.noise(0.05, v * 0.4, 2000, 1.5, dest); },
};
