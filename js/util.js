// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — util.js
// Math helpers, input, RNG, save system
// ============================================================
'use strict';

const W = 1280, H = 720;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const irnd = (a, b) => Math.floor(rnd(a, b + 1));
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const sign = v => v < 0 ? -1 : 1;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const TAU = Math.PI * 2;

// Seeded RNG for deterministic decoration layouts
function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------- INPUT ----------------
const Input = {
  keys: {}, pressed: {}, // pressed = this-frame edge
  map: {
    left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    jump: ['KeyW', 'ArrowUp', 'Space'], down: ['KeyS', 'ArrowDown'],
    attack: ['KeyJ'], special: ['KeyK'], ultimate: ['KeyL'],
    dash: ['ShiftLeft', 'ShiftRight'], interact: ['KeyE'],
    pause: ['Escape'], confirm: ['Enter', 'KeyJ', 'Space'],
  },
  init() {
    addEventListener('keydown', e => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (!this.keys[e.code]) this.pressed[e.code] = true;
      this.keys[e.code] = true;
      this.lastCode = e.code;
      Audio2.unlock();
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
  },
  down(action) { return (this.map[action] || []).some(c => this.keys[c]); },
  hit(action) { return (this.map[action] || []).some(c => this.pressed[c]); },
  endFrame() { this.pressed = {}; this.lastCode = null; },
  rebind(action, code) {
    // remove code from all other actions' first slot
    for (const a in this.map) this.map[a] = this.map[a].filter(c => c !== code);
    this.map[action].unshift(code);
  },
  keyName(action) {
    const c = (this.map[action] || [''])[0] || '?';
    return c.replace('Key', '').replace('Arrow', '').replace('ShiftLeft', 'SHIFT').replace('ShiftRight', 'RSHIFT').replace('Escape', 'ESC').toUpperCase();
  }
};

// ---------------- SAVE SYSTEM ----------------
const SaveSys = {
  KEY: 'gc_lastnight_save_v1',
  data: null,
  fresh() {
    return {
      level: 0,               // next level index to play (0-based)
      completed: [],          // completed level indices
      character: null,        // selected hero id
      upgrades: { health: 0, energy: 0, power: 0, ultimate: 0, speed: 0 },
      shards: 0,              // divine shards collected (upgrade currency)
      storySeen: [],
      settings: {
        master: 0.8, music: 0.7, sfx: 0.9, dialogueVol: 1.0,
        subtitles: true, subSize: 1, quality: 2, shake: true, camFx: true, language: 'tenglish'
      },
      keymap: null,
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this.data = raw ? Object.assign(this.fresh(), JSON.parse(raw)) : this.fresh();
      this.data.settings = Object.assign(this.fresh().settings, this.data.settings || {});
      this.data.upgrades = Object.assign(this.fresh().upgrades, this.data.upgrades || {});
    } catch (e) { this.data = this.fresh(); }
    if (this.data.keymap) { try { Input.map = Object.assign(Input.map, this.data.keymap); } catch (e) { } }
    return this.data;
  },
  save() {
    this.data.keymap = Input.map;
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { }
  },
  wipeProgress() {
    const s = this.data.settings;
    this.data = this.fresh(); this.data.settings = s; this.save();
  }
};

// Text wrap helper
function wrapText(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Rounded rect path
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
