// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — art.js
// Character bible + vector rig renderer.
// Every hero/enemy/boss is a reusable parametric asset drawn
// in local space (feet at 0,0, facing right), animated by pose.
// ============================================================
'use strict';

// ---------------- MASTER CHARACTER BIBLE (LOCKED) ----------------
const CHARS = {
  aditya: {
    name: 'ADITYA', role: 'Balanced Fighter', power: 'Vighnesha Force', ult: "GANAPATI'S RESOLVE",
    desc: 'Leader. Confident, protective, a little impulsive. Close-range divine fighter.',
    height: 112, build: 1.0,
    skin: '#a8734e', skinShade: '#8a5c3c',
    hair: '#171310', hairStyle: 'messy',
    kurta: '#7c2230', kurtaShade: '#5e1a25', trim: '#d9a441',
    pants: '#e8dcc0', pantsShade: '#c9bda3',
    sandal: '#6b4a2c', thread: '#e05820',
    aura: '#ffb340', auraCore: '#ffe9b0',
    moustache: false, glasses: false, waistcoat: null,
    speed: 3.4, jump: 14.5, hp: 110, dmg: 12, atkRange: 62, ranged: false,
    abilities: ['Divine Punch', 'Ground Strike', 'Protective Shield', 'Divine Shockwave'],
    special: 'shockwave', ultType: 'resolve',
  },
  arjun: {
    name: 'ARJUN', role: 'Agile Fighter', power: 'Vakratunda Dash', ult: 'THUNDER DASH',
    desc: 'The joker of the group. Energetic, fearless, always hungry. Fastest of the four.',
    height: 108, build: 0.88,
    skin: '#b5825d', skinShade: '#96694a',
    hair: '#1a1512', hairStyle: 'wavy',
    kurta: '#d9a62e', kurtaShade: '#b5871f', trim: '#8a6a12',
    pants: '#ece2ca', pantsShade: '#cec4ab',
    sandal: '#6b4a2c', thread: null, bracelet: '#c98b2f',
    waistcoat: '#2d5836', waistcoatShade: '#1f3f26',
    aura: '#ffc95e', auraCore: '#fff2c8',
    moustache: false, glasses: false,
    speed: 4.3, jump: 15.5, hp: 90, dmg: 9, atkRange: 56, ranged: false, doubleJump: true,
    abilities: ['Rapid Dash', 'Double Jump', 'Aerial Strike', 'Dodge Burst'],
    special: 'spindash', ultType: 'thunderdash',
  },
  ravi: {
    name: 'RAVI', role: 'Ranged Support', power: 'Modaka Pulse', ult: 'DIVINE BARRAGE',
    desc: 'The brain. Sarcastic, observant, calm under pressure. Fights from a distance.',
    height: 110, build: 0.9,
    skin: '#a1714d', skinShade: '#845a3b',
    hair: '#14100e', hairStyle: 'neat',
    kurta: '#24457c', kurtaShade: '#1a3560', trim: '#7fa2d9',
    pants: '#eae3d2', pantsShade: '#ccc5b3',
    sandal: '#5e4126', thread: null, bracelet: '#8898b5',
    waistcoat: '#152a4d', waistcoatShade: '#0e1d36',
    aura: '#ffb85c', auraCore: '#ffedc4',
    moustache: false, glasses: true,
    speed: 3.2, jump: 14.0, hp: 85, dmg: 10, atkRange: 340, ranged: true,
    abilities: ['Energy Projectile', 'Explosive Pulse', 'Slow Field', 'Team Heal'],
    special: 'burst', ultType: 'barrage',
  },
  kiran: {
    name: 'KIRAN', role: 'Heavy Defender', power: 'Gajashakti', ult: 'ELEPHANT FORCE',
    desc: 'The calm wall. Loyal, mature, protective. Hits like a temple bell.',
    height: 118, build: 1.22,
    skin: '#8a5f3f', skinShade: '#6f4b30',
    hair: '#131009', hairStyle: 'short',
    kurta: '#2c5c34', kurtaShade: '#1e4224', trim: '#c9a24a',
    pants: '#e6dbc2', pantsShade: '#c6bca5',
    sandal: '#5c3f24', thread: '#e07a20',
    aura: '#ffab30', auraCore: '#ffe4a0',
    moustache: true, glasses: false, waistcoat: null,
    speed: 2.7, jump: 13.2, hp: 145, dmg: 16, atkRange: 70, ranged: false,
    abilities: ['Ground Smash', 'Heavy Knockback', 'Temporary Armor', 'Protective Barrier'],
    special: 'smash', ultType: 'elephant',
  },
};
const HERO_IDS = ['aditya', 'arjun', 'ravi', 'kiran'];

// Emotion presets: [browAngle, browHeight, eyeOpen, mouth]
// mouth: 0 flat, 1 smile, 2 bigsmile, 3 frown, 4 open(shock), 5 gritted, 6 small-o
const EMOTES = {
  neutral: [0, 0, 1, 0], happy: [0.12, 0.5, 1, 1], joy: [0.2, 1, 0.85, 2],
  angry: [-0.55, -1.2, 0.9, 5], fear: [0.5, 1.4, 1.25, 4], surprise: [0.3, 1.8, 1.35, 6],
  sad: [0.45, 0.3, 0.75, 3], determined: [-0.4, -0.7, 0.95, 0], relief: [0.15, 0.6, 0.6, 1],
  pain: [-0.3, -0.5, 0.25, 4], worry: [0.4, 0.7, 1.05, 3],
};

const Art = {
  // capsule limb: two segments with joint
  limb(ctx, x1, y1, x2, y2, x3, y3, w, color) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
  },
  seg(ctx, x1, y1, x2, y2, w, color) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  },

  // ============ HERO RENDERER ============
  // st: {pose, t, vx, vy, attackT, emotion, powered, auraT, blink, castT, carry}
  hero(ctx, id, st) {
    const C = CHARS[id];
    const h = C.height, bw = C.build;
    const t = st.t || 0;
    const pose = st.pose || 'idle';
    const em = EMOTES[st.emotion || 'neutral'] || EMOTES.neutral;

    // ---- pose parameters ----
    let bob = 0, lean = 0, hipY = -h * 0.44;
    let legL = { hip: 0, knee: 0 }, legR = { hip: 0, knee: 0 }; // swing angles
    let armL = { sh: 0.25, el: 0.35 }, armR = { sh: -0.25, el: 0.35 };
    let headTilt = 0, crouch = 0;

    const spd = Math.abs(st.vx || 0);
    if (pose === 'idle') {
      bob = Math.sin(t * 2.2) * 1.5;
      armL = { sh: 0.22 + Math.sin(t * 2.2) * 0.03, el: 0.3 };
      armR = { sh: -0.22 - Math.sin(t * 2.2) * 0.03, el: 0.3 };
      if (id === 'arjun') { bob = Math.sin(t * 3.5) * 2; headTilt = Math.sin(t * 1.4) * 0.05; }
      if (id === 'kiran') { bob = Math.sin(t * 1.7) * 1.1; }
      if (id === 'ravi' && Math.sin(t * 0.7) > 0.86) armR = { sh: -1.9, el: -1.2 }; // adjusts glasses
    } else if (pose === 'walk') {
      const c = Math.sin(t * 9);
      bob = Math.abs(Math.cos(t * 9)) * 2.2;
      legL = { hip: c * 0.5, knee: Math.max(0, -c) * 0.8 };
      legR = { hip: -c * 0.5, knee: Math.max(0, c) * 0.8 };
      armL = { sh: 0.2 - c * 0.35, el: 0.35 }; armR = { sh: -0.2 + c * 0.35, el: 0.35 };
      lean = 0.04;
    } else if (pose === 'run') {
      const c = Math.sin(t * 13);
      bob = Math.abs(Math.cos(t * 13)) * 3.4;
      legL = { hip: c * 0.9, knee: Math.max(0, -c) * 1.5 + 0.25 };
      legR = { hip: -c * 0.9, knee: Math.max(0, c) * 1.5 + 0.25 };
      armL = { sh: 0.3 - c * 0.8, el: 1.15 }; armR = { sh: -0.3 + c * 0.8, el: 1.15 };
      lean = id === 'kiran' ? 0.1 : 0.16;
      if (id === 'arjun') lean = 0.2;
    } else if (pose === 'jump') {
      const vy = st.vy || 0;
      if (vy < -2) { legL = { hip: 0.7, knee: 1.3 }; legR = { hip: -0.35, knee: 0.7 }; armL = { sh: -0.7, el: 0.4 }; armR = { sh: 0.6, el: 0.5 }; }
      else if (vy > 2) { legL = { hip: 0.3, knee: 0.5 }; legR = { hip: -0.5, knee: 0.9 }; armL = { sh: -1.5, el: 0.3 }; armR = { sh: 1.3, el: 0.3 }; }
      else { legL = { hip: 0.5, knee: 1.0 }; legR = { hip: -0.4, knee: 0.8 }; armL = { sh: -1.1, el: 0.4 }; armR = { sh: 1.0, el: 0.4 }; }
      lean = 0.08;
    } else if (pose === 'attack') {
      const a = st.attackT || 0; // 0..1
      if (a < 0.3) { // anticipation
        const k = a / 0.3;
        armR = { sh: -0.25 - k * 1.6, el: 1.9 * k + 0.35 }; lean = -0.06 * k; crouch = 2 * k;
      } else { // strike + follow through
        const k = Math.min(1, (a - 0.3) / 0.35);
        armR = { sh: -1.85 + k * 3.3, el: 2.25 - k * 2.2 }; lean = 0.14 * k; crouch = 2 - k;
      }
      legL = { hip: 0.35, knee: 0.3 }; legR = { hip: -0.45, knee: 0.45 };
      armL = { sh: 0.9, el: 1.1 };
    } else if (pose === 'cast') {
      const a = st.attackT || 0;
      const k = Math.min(1, a / 0.35);
      armR = { sh: -0.3 - k * 1.25, el: 0.15 }; armL = { sh: 0.35 + k * 0.3, el: 0.5 };
      lean = 0.05; legL = { hip: 0.28, knee: 0.25 }; legR = { hip: -0.3, knee: 0.3 };
    } else if (pose === 'smash') {
      const a = st.attackT || 0;
      if (a < 0.4) { const k = a / 0.4; armL = { sh: -2.6 * k, el: 0.3 }; armR = { sh: -2.6 * k, el: 0.3 }; crouch = -3 * k; }
      else { const k = Math.min(1, (a - 0.4) / 0.3); armL = { sh: -2.6 + k * 3.6, el: 0.2 }; armR = { sh: -2.6 + k * 3.6, el: 0.2 }; crouch = k * 9; lean = 0.22 * k; }
      legL = { hip: 0.4, knee: 0.5 }; legR = { hip: -0.5, knee: 0.6 };
    } else if (pose === 'hurt') {
      lean = -0.22; crouch = 4; armL = { sh: 0.9, el: 1.4 }; armR = { sh: -0.6, el: 1.5 };
      legL = { hip: 0.3, knee: 0.6 }; legR = { hip: -0.2, knee: 0.4 }; headTilt = -0.18;
    } else if (pose === 'victory') {
      const c = Math.sin(t * 3);
      armR = { sh: -2.9 + c * 0.1, el: -0.2 }; armL = { sh: 0.5, el: 0.4 };
      bob = Math.abs(c) * 2; headTilt = 0.08;
      if (id === 'arjun') { armL = { sh: 2.9 - c * 0.1, el: 0.2 }; }
    } else if (pose === 'kneel') {
      crouch = h * 0.18; lean = 0.12; legL = { hip: 1.2, knee: 2.1 }; legR = { hip: -0.3, knee: 1.6 };
      armL = { sh: 0.5, el: 0.9 }; armR = { sh: -0.4, el: 0.8 }; headTilt = -0.25;
    } else if (pose === 'dash') {
      lean = 0.35; crouch = 8;
      legL = { hip: 1.1, knee: 1.6 }; legR = { hip: -0.9, knee: 0.4 };
      armL = { sh: -1.2, el: 0.9 }; armR = { sh: 1.1, el: 0.9 };
    } else if (pose === 'sit') {
      crouch = h * 0.3; legL = { hip: 1.5, knee: 1.5 }; legR = { hip: 1.4, knee: 1.6 };
      armL = { sh: 0.6, el: 1.0 }; armR = { sh: -0.6, el: 1.0 };
    }
    hipY += crouch * 0.6;

    ctx.save();
    if (st.facing === -1) ctx.scale(-1, 1);
    ctx.rotate(lean);

    // powered aura
    if (st.powered) {
      const g = ctx.createRadialGradient(0, -h * 0.5, h * 0.1, 0, -h * 0.5, h * 0.75);
      g.addColorStop(0, C.aura + '55'); g.addColorStop(1, C.aura + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -h * 0.5, h * 0.62, h * 0.8, 0, 0, TAU); ctx.fill();
      // rising flame licks
      for (let i = 0; i < 5; i++) {
        const fx = Math.sin(t * 3 + i * 2.2) * h * 0.3;
        const fy = -((t * 40 + i * 37) % (h * 0.9));
        ctx.fillStyle = C.aura + '44';
        ctx.beginPath(); ctx.ellipse(fx, fy - h * 0.1, 3, 8, 0, 0, TAU); ctx.fill();
      }
    }

    const skin = C.skin, kurta = C.kurta;
    const legW = 9 * bw, armW = 7.5 * bw;
    const hy = hipY - bob * 0.4;

    // ---- LEGS (draw far leg darker) ----
    const drawLeg = (L, far) => {
      const hipX = far ? -3 : 3;
      const thigh = h * 0.24, shin = h * 0.22;
      const a1 = L.hip + Math.PI / 2, a2 = a1 + L.knee;
      const kx = hipX + Math.cos(a1 - L.hip * 0.0) * 0 + Math.sin(L.hip) * thigh;
      const ky = hy + Math.cos(L.hip) * thigh;
      const ax = kx + Math.sin(L.hip - L.knee) * shin;
      const ay = ky + Math.cos(L.hip - L.knee) * shin;
      const pc = far ? C.pantsShade : C.pants;
      this.limb(ctx, hipX, hy, kx, ky, ax, ay, legW, pc);
      // sandal
      ctx.fillStyle = far ? '#4a3018' : C.sandal;
      ctx.beginPath(); ctx.ellipse(ax + 3.5, ay + 2.5, 7.5, 3.2, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = far ? '#3a2512' : '#54381f'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(ax + 1, ay - 1); ctx.lineTo(ax + 5, ay + 2); ctx.stroke();
    };
    drawLeg(legR, true);

    // ---- FAR ARM ----
    const shY = hy - h * 0.30 - bob * 0.3;
    const drawArm = (A, far, holdGlow) => {
      const sx = far ? -6 * bw : 6 * bw;
      const upper = h * 0.17, fore = h * 0.16;
      const ex = sx + Math.sin(A.sh) * upper, ey = shY + Math.cos(A.sh) * upper;
      const hx = ex + Math.sin(A.sh - A.el) * fore, hyy = ey + Math.cos(A.sh - A.el) * fore;
      // sleeve
      this.seg(ctx, sx, shY, ex, ey, armW + 2, far ? C.kurtaShade : kurta);
      this.seg(ctx, ex, ey, lerp(ex, hx, 0.55), lerp(ey, hyy, 0.55), armW + 1, far ? C.kurtaShade : kurta);
      // forearm skin
      this.seg(ctx, lerp(ex, hx, 0.5), lerp(ey, hyy, 0.5), hx, hyy, armW - 1, far ? C.skinShade : skin);
      // wrist thread / bracelet
      if (!far && C.thread) { this.seg(ctx, lerp(ex, hx, 0.78), lerp(ey, hyy, 0.78), lerp(ex, hx, 0.86), lerp(ey, hyy, 0.86), armW, C.thread); }
      if (!far && C.bracelet) { this.seg(ctx, lerp(ex, hx, 0.78), lerp(ey, hyy, 0.78), lerp(ex, hx, 0.86), lerp(ey, hyy, 0.86), armW, C.bracelet); }
      // hand
      ctx.fillStyle = far ? C.skinShade : skin;
      ctx.beginPath(); ctx.arc(hx, hyy, armW * 0.62, 0, TAU); ctx.fill();
      if (holdGlow) {
        const g = ctx.createRadialGradient(hx, hyy, 1, hx, hyy, 16);
        g.addColorStop(0, C.auraCore); g.addColorStop(0.5, C.aura + 'bb'); g.addColorStop(1, C.aura + '00');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hyy, 16, 0, TAU); ctx.fill();
      }
      return [hx, hyy];
    };
    drawArm(armL, true, false);

    // ---- TORSO (kurta) ----
    const shW = 11 * bw, hipW = 9.5 * bw;
    ctx.fillStyle = kurta;
    ctx.beginPath();
    ctx.moveTo(-shW, shY - 4);
    ctx.quadraticCurveTo(-shW - 2, hy - 6, -hipW - 2, hy + 10); // kurta flares slightly at hip
    ctx.lineTo(hipW + 2, hy + 10);
    ctx.quadraticCurveTo(shW + 2, hy - 6, shW, shY - 4);
    ctx.quadraticCurveTo(0, shY - 9, -shW, shY - 4);
    ctx.fill();
    // kurta shade side
    ctx.fillStyle = C.kurtaShade + '88';
    ctx.beginPath(); ctx.moveTo(-shW, shY - 4); ctx.quadraticCurveTo(-shW - 2, hy - 6, -hipW - 2, hy + 10);
    ctx.lineTo(-hipW * 0.35, hy + 10); ctx.lineTo(-shW * 0.4, shY - 6); ctx.fill();
    // kurta hem trim + collar
    ctx.strokeStyle = C.trim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-hipW - 2, hy + 9); ctx.lineTo(hipW + 2, hy + 9); ctx.stroke();
    // collar placket
    ctx.strokeStyle = C.trim; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(0, shY - 7); ctx.lineTo(0, shY + h * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, shY - 5, 4.5, 0.2, Math.PI - 0.2); ctx.stroke();
    // waistcoat (arjun/ravi)
    if (C.waistcoat) {
      ctx.fillStyle = C.waistcoat;
      ctx.beginPath();
      ctx.moveTo(-shW + 1, shY - 3);
      ctx.lineTo(-shW * 0.42, shY + h * 0.19);
      ctx.lineTo(-shW * 0.55, hy + 4); ctx.lineTo(-hipW - 1, hy + 2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.waistcoatShade;
      ctx.beginPath();
      ctx.moveTo(shW - 1, shY - 3);
      ctx.lineTo(shW * 0.42, shY + h * 0.19);
      ctx.lineTo(shW * 0.55, hy + 4); ctx.lineTo(hipW + 1, hy + 2);
      ctx.closePath(); ctx.fill();
    }

    // near leg on top of kurta hem? No—near leg below torso hem: draw now (over far, under torso done). Actually draw near leg after torso for overlap realism.
    drawLeg(legL, false);

    // ---- HEAD ----
    const headR = 11 * (0.9 + bw * 0.12);
    const hx0 = 2 + headTilt * 8, hy0 = shY - h * 0.115 - bob * 0.2;
    ctx.save();
    ctx.translate(hx0, hy0); ctx.rotate(headTilt);
    // neck
    this.seg(ctx, 0, headR * 0.5, 0, headR * 1.1, 7 * bw, skin);
    // face
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(0, 0, headR * 0.92, headR, 0, 0, TAU); ctx.fill();
    // jaw shading
    ctx.fillStyle = C.skinShade + '55';
    ctx.beginPath(); ctx.ellipse(-headR * 0.3, headR * 0.25, headR * 0.5, headR * 0.55, 0.3, 0, TAU); ctx.fill();
    // ear
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(-headR * 0.78, 0, headR * 0.18, headR * 0.28, 0, 0, TAU); ctx.fill();

    // hair — per style, silhouette locked
    ctx.fillStyle = C.hair;
    if (C.hairStyle === 'messy') { // Aditya: thick messy spikes
      ctx.beginPath();
      ctx.moveTo(-headR * 0.95, -headR * 0.1);
      ctx.quadraticCurveTo(-headR * 1.06, -headR * 0.9, -headR * 0.4, -headR * 1.02);
      ctx.lineTo(-headR * 0.25, -headR * 1.28); ctx.lineTo(-headR * 0.02, -headR * 1.0);
      ctx.lineTo(headR * 0.22, -headR * 1.3); ctx.lineTo(headR * 0.4, -headR * 0.98);
      ctx.lineTo(headR * 0.65, -headR * 1.15); ctx.quadraticCurveTo(headR * 1.0, -headR * 0.72, headR * 0.9, -headR * 0.3);
      ctx.quadraticCurveTo(headR * 0.55, -headR * 0.55, 0, -headR * 0.62);
      ctx.quadraticCurveTo(-headR * 0.6, -headR * 0.55, -headR * 0.95, -headR * 0.1);
      ctx.fill();
    } else if (C.hairStyle === 'wavy') { // Arjun: thick waves
      ctx.beginPath();
      ctx.moveTo(-headR * 0.95, headR * 0.05);
      ctx.quadraticCurveTo(-headR * 1.2, -headR * 0.85, -headR * 0.35, -headR * 1.12);
      ctx.quadraticCurveTo(0, -headR * 1.32, headR * 0.45, -headR * 1.12);
      ctx.quadraticCurveTo(headR * 1.05, -headR * 0.8, headR * 0.88, -headR * 0.15);
      ctx.quadraticCurveTo(headR * 0.8, -headR * 0.5, headR * 0.5, -headR * 0.58);
      ctx.quadraticCurveTo(headR * 0.2, -headR * 0.72, -headR * 0.15, -headR * 0.6);
      ctx.quadraticCurveTo(-headR * 0.65, -headR * 0.52, -headR * 0.95, headR * 0.05);
      ctx.fill();
      // wave curl on forehead
      ctx.beginPath(); ctx.arc(headR * 0.35, -headR * 0.65, headR * 0.22, 0, Math.PI * 1.3); ctx.fill();
    } else if (C.hairStyle === 'neat') { // Ravi: side part
      ctx.beginPath();
      ctx.moveTo(-headR * 0.92, -headR * 0.05);
      ctx.quadraticCurveTo(-headR * 1.02, -headR * 0.95, -headR * 0.1, -headR * 1.05);
      ctx.quadraticCurveTo(headR * 0.85, -headR * 1.02, headR * 0.88, -headR * 0.35);
      ctx.quadraticCurveTo(headR * 0.6, -headR * 0.68, headR * 0.15, -headR * 0.72);
      ctx.quadraticCurveTo(-headR * 0.4, -headR * 0.78, -headR * 0.62, -headR * 0.5);
      ctx.quadraticCurveTo(-headR * 0.8, -headR * 0.3, -headR * 0.92, -headR * 0.05);
      ctx.fill();
      // part line
      ctx.strokeStyle = '#2d2620'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-headR * 0.35, -headR * 0.85); ctx.lineTo(headR * 0.3, -headR * 0.9); ctx.stroke();
    } else { // Kiran: short crop
      ctx.beginPath();
      ctx.moveTo(-headR * 0.93, -headR * 0.15);
      ctx.quadraticCurveTo(-headR * 0.98, -headR * 0.92, 0, -headR * 1.08);
      ctx.quadraticCurveTo(headR * 0.95, -headR * 0.92, headR * 0.9, -headR * 0.2);
      ctx.quadraticCurveTo(headR * 0.5, -headR * 0.6, 0, -headR * 0.64);
      ctx.quadraticCurveTo(-headR * 0.55, -headR * 0.6, -headR * 0.93, -headR * 0.15);
      ctx.fill();
    }

    // ---- FACE (emotion-driven) ----
    const [bA, bH, eO, mouth] = em;
    const blink = st.blink ? 0.1 : 1;
    const eyeO = Math.max(0.08, eO * blink);
    // eyes
    const eyeY = -headR * 0.12, eyeGap = headR * 0.34;
    for (const s of [-0.45, 1]) {
      const ex = s === 1 ? eyeGap : -eyeGap * 0.55;
      ctx.fillStyle = '#fff8f0';
      ctx.beginPath(); ctx.ellipse(ex, eyeY, headR * 0.19, headR * 0.13 * eyeO, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#241207';
      ctx.beginPath(); ctx.ellipse(ex + headR * 0.06, eyeY, headR * 0.085, headR * 0.11 * eyeO, 0, 0, TAU); ctx.fill();
    }
    // eyebrows
    ctx.strokeStyle = C.hair; ctx.lineWidth = headR * 0.14; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      const ex = s === 1 ? eyeGap : -eyeGap * 0.55;
      const by = eyeY - headR * 0.28 - bH * headR * 0.06;
      ctx.beginPath();
      ctx.moveTo(ex - headR * 0.16, by + (s === 1 ? bA : -bA * 0.6) * headR * 0.2);
      ctx.lineTo(ex + headR * 0.16, by - (s === 1 ? bA : -bA * 0.6) * headR * 0.2);
      ctx.stroke();
    }
    // nose
    ctx.strokeStyle = C.skinShade; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(headR * 0.32, eyeY + headR * 0.1); ctx.lineTo(headR * 0.38, eyeY + headR * 0.34); ctx.stroke();
    // mouth
    const mY = headR * 0.5;
    ctx.strokeStyle = '#5e3325'; ctx.lineWidth = 1.8; ctx.fillStyle = '#4a2018';
    ctx.beginPath();
    if (mouth === 0) { ctx.moveTo(headR * 0.05, mY); ctx.lineTo(headR * 0.42, mY); ctx.stroke(); }
    else if (mouth === 1) { ctx.arc(headR * 0.22, mY - headR * 0.07, headR * 0.2, 0.3, Math.PI - 0.5); ctx.stroke(); }
    else if (mouth === 2) { ctx.arc(headR * 0.22, mY - headR * 0.08, headR * 0.24, 0.15, Math.PI - 0.25); ctx.fill(); }
    else if (mouth === 3) { ctx.arc(headR * 0.22, mY + headR * 0.16, headR * 0.18, Math.PI + 0.5, TAU - 0.3); ctx.stroke(); }
    else if (mouth === 4) { ctx.ellipse(headR * 0.24, mY, headR * 0.12, headR * 0.16, 0, 0, TAU); ctx.fill(); }
    else if (mouth === 5) { ctx.rect(headR * 0.02, mY - 2, headR * 0.42, 3.4); ctx.fill(); ctx.strokeStyle = '#fff8f0'; ctx.lineWidth = 0.8; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(headR * 0.02 + i * headR * 0.105, mY - 2); ctx.lineTo(headR * 0.02 + i * headR * 0.105, mY + 1.4); ctx.stroke(); } }
    else if (mouth === 6) { ctx.arc(headR * 0.24, mY, headR * 0.08, 0, TAU); ctx.fill(); }

    // Kiran's moustache — PERMANENT
    if (C.moustache) {
      ctx.strokeStyle = C.hair; ctx.lineWidth = headR * 0.13;
      ctx.beginPath(); ctx.moveTo(headR * 0.0, mY - headR * 0.16);
      ctx.quadraticCurveTo(headR * 0.24, mY - headR * 0.3, headR * 0.48, mY - headR * 0.14);
      ctx.stroke();
    }
    // Ravi's glasses — PERMANENT
    if (C.glasses) {
      ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 1.7; ctx.fillStyle = '#bcd7ee22';
      const gw = headR * 0.42, gh = headR * 0.3;
      for (const s of [0, 1]) {
        const gx = s ? eyeGap - gw / 2 : -eyeGap * 0.55 - gw / 2;
        rr(ctx, gx, eyeY - gh / 2, gw, gh, 3); ctx.fill(); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(-eyeGap * 0.55 + gw / 2, eyeY); ctx.lineTo(eyeGap - gw / 2, eyeY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-eyeGap * 0.55 - gw / 2, eyeY); ctx.lineTo(-headR * 0.8, eyeY - 1); ctx.stroke();
    }
    ctx.restore(); // head

    // ---- NEAR ARM (over torso) ----
    const glow = st.powered && (pose === 'attack' || pose === 'cast' || pose === 'smash');
    drawArm(armR, false, glow);

    ctx.restore();
  },

  // ============ NPC (villagers) ============
  npc(ctx, kind, t, facing = 1, seed = 1) {
    const rng = makeRng(seed * 977);
    const palettes = [
      ['#c94f6d', '#e8dcc0', '#7a3348'], ['#4a7ab5', '#efe6d0', '#2d4d78'],
      ['#c9812f', '#e0d6bd', '#8a5a1e'], ['#68a06a', '#ece2ca', '#3f6b41'],
      ['#9a6fc0', '#efe0cc', '#6a4a88'], ['#d9a62e', '#f0e8d8', '#a07a1a'],
    ];
    const pal = palettes[Math.floor(rng() * palettes.length)];
    const female = kind === 'woman' || (kind === 'any' && rng() < 0.5);
    const child = kind === 'child';
    const h = child ? 62 : female ? 96 : 102;
    const skin = ['#a8734e', '#b5825d', '#8a5f3f', '#9a6a45'][Math.floor(rng() * 4)];
    ctx.save();
    if (facing === -1) ctx.scale(-1, 1);
    const bob = Math.sin(t * 2 + seed) * 1.5;
    // body
    if (female) {
      // saree silhouette
      ctx.fillStyle = pal[0];
      ctx.beginPath(); ctx.moveTo(-11, -h * 0.62); ctx.quadraticCurveTo(-16, -h * 0.2, -13, 0);
      ctx.lineTo(13, 0); ctx.quadraticCurveTo(15, -h * 0.2, 11, -h * 0.62);
      ctx.quadraticCurveTo(0, -h * 0.68, -11, -h * 0.62); ctx.fill();
      ctx.fillStyle = pal[2];
      ctx.beginPath(); ctx.moveTo(-9, -h * 0.64); ctx.lineTo(4, -h * 0.3); ctx.lineTo(-3, -h * 0.28); ctx.lineTo(-12, -h * 0.55); ctx.fill();
    } else {
      ctx.fillStyle = pal[1];
      ctx.fillRect(-8, -h * 0.42, 16, h * 0.42); // dhoti/pants
      ctx.fillStyle = pal[0];
      ctx.beginPath(); ctx.moveTo(-10, -h * 0.66); ctx.lineTo(-9, -h * 0.34); ctx.lineTo(9, -h * 0.34); ctx.lineTo(10, -h * 0.66);
      ctx.quadraticCurveTo(0, -h * 0.72, -10, -h * 0.66); ctx.fill();
    }
    // arms
    this.seg(ctx, -9, -h * 0.6, -11, -h * 0.36, 5, pal[0]);
    this.seg(ctx, 9, -h * 0.6, 11 + Math.sin(t * 2 + seed) * 2, -h * 0.36, 5, pal[0]);
    // head
    const hr = child ? 9 : 10;
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(1, -h * 0.72 - bob * 0.3, hr, 0, TAU); ctx.fill();
    // hair
    ctx.fillStyle = '#1a1410';
    if (female) {
      ctx.beginPath(); ctx.arc(0, -h * 0.72 - bob * 0.3 - 2, hr * 0.95, Math.PI * 0.9, TAU + 0.35); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-hr * 0.8, -h * 0.72 + 4, 3, 7, 0.2, 0, TAU); ctx.fill();
      // flower in hair
      ctx.fillStyle = '#f5a623'; ctx.beginPath(); ctx.arc(-hr * 0.72, -h * 0.72 - 4, 2, 0, TAU); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, -h * 0.72 - bob * 0.3 - 2.5, hr * 0.9, Math.PI * 0.95, TAU + 0.25); ctx.fill();
    }
    // face dot eyes + smile
    ctx.fillStyle = '#241207';
    ctx.beginPath(); ctx.arc(hr * 0.35, -h * 0.72 - bob * 0.3 - 1, 1.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-hr * 0.15, -h * 0.72 - bob * 0.3 - 1, 1.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5e3325'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(hr * 0.1, -h * 0.72 - bob * 0.3 + 3, 2.5, 0.3, Math.PI - 0.5); ctx.stroke();
    if (female) { ctx.fillStyle = '#c02020'; ctx.beginPath(); ctx.arc(hr * 0.1, -h * 0.72 - bob * 0.3 - 5, 1.3, 0, TAU); ctx.fill(); }
    ctx.restore();
  },

  // ============ ENEMIES ============
  // st: {pose:'idle|move|attack|hurt|die', t, attackT, dieT, facing}
  enemy(ctx, type, st) {
    const t = st.t || 0, pose = st.pose || 'idle';
    const aT = st.attackT || 0;
    ctx.save();
    if (st.facing === -1) ctx.scale(-1, 1);
    if (pose === 'die') { const d = st.dieT || 0; ctx.globalAlpha = 1 - d; ctx.translate(0, d * 10); ctx.rotate(-d * 0.5); }
    if (pose === 'hurt') { ctx.translate(-3, 0); ctx.rotate(-0.08); }

    if (type === 'shadowRunner') {
      // lean crouched wispy humanoid — fast melee
      const c = pose === 'move' ? Math.sin(t * 16) : Math.sin(t * 3) * 0.2;
      const lunge = pose === 'attack' ? easeOut(Math.min(1, aT * 2)) * 14 : 0;
      ctx.translate(lunge, 0);
      // smoke trail
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(40,20,60,${0.25 - i * 0.07})`;
        ctx.beginPath(); ctx.ellipse(-8 - i * 8, -20 + Math.sin(t * 5 + i) * 4, 9 - i * 2, 13 - i * 3, 0, 0, TAU); ctx.fill();
      }
      // legs
      this.limb(ctx, 2, -34, 8 + c * 5, -18, 4 + c * 8, 0, 6, '#241535');
      this.limb(ctx, -2, -34, -6 - c * 5, -18, -2 - c * 7, 0, 6, '#180e26');
      // body crouched
      ctx.fillStyle = '#2c1a45';
      ctx.beginPath(); ctx.ellipse(2, -44, 12, 17, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3d2660';
      ctx.beginPath(); ctx.ellipse(4, -46, 8, 12, 0.5, 0, TAU); ctx.fill();
      // claw arms
      const clawX = pose === 'attack' ? 26 : 14 + c * 3;
      this.limb(ctx, 8, -50, 16, -42, clawX, -34, 5, '#241535');
      for (let i = 0; i < 3; i++) { this.seg(ctx, clawX, -34, clawX + 7, -37 + i * 4, 2, '#8a5fd0'); }
      // head
      ctx.fillStyle = '#1c0f30'; ctx.beginPath(); ctx.ellipse(10, -60, 8, 9, 0.3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c46bff'; // glowing eyes
      ctx.beginPath(); ctx.ellipse(13, -61, 2.6, 1.4, 0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8, -62, 2.2, 1.2, 0.3, 0, TAU); ctx.fill();
    }
    else if (type === 'ashWarrior') {
      // upright warrior, ember cracks, blade arm
      const c = pose === 'move' ? Math.sin(t * 9) : 0;
      const strike = pose === 'attack' ? (aT < 0.4 ? -aT * 2 : easeOut((aT - 0.4) / 0.4)) : 0;
      this.limb(ctx, 3, -44, 7 + c * 6, -22, 5 + c * 8, 0, 8, '#3a3238');
      this.limb(ctx, -3, -44, -6 - c * 6, -22, -4 - c * 8, 0, 8, '#2a2428');
      ctx.fillStyle = '#453b42';
      ctx.beginPath(); ctx.moveTo(-13, -76); ctx.lineTo(-11, -42); ctx.lineTo(11, -42); ctx.lineTo(13, -76);
      ctx.quadraticCurveTo(0, -82, -13, -76); ctx.fill();
      // ember cracks
      ctx.strokeStyle = '#ff7b30'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-5, -70); ctx.lineTo(-2, -60); ctx.lineTo(-6, -52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -66); ctx.lineTo(4, -56); ctx.stroke();
      ctx.fillStyle = `rgba(255,123,48,${0.4 + Math.sin(t * 6) * 0.2})`;
      ctx.beginPath(); ctx.arc(0, -64, 3.2, 0, TAU); ctx.fill();
      // shoulder plates
      ctx.fillStyle = '#5c5058'; ctx.beginPath(); ctx.ellipse(-12, -74, 6, 4.4, -0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, -74, 6, 4.4, 0.3, 0, TAU); ctx.fill();
      // blade arm
      const bA2 = -0.5 + strike * 2.2;
      const bx = 12 + Math.cos(bA2) * 16, by = -70 + Math.sin(bA2) * 16;
      this.seg(ctx, 12, -72, bx, by, 6, '#3a3238');
      ctx.save(); ctx.translate(bx, by); ctx.rotate(bA2 + 0.6);
      ctx.fillStyle = '#8a8f99';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, -4); ctx.lineTo(34, 0); ctx.lineTo(30, 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ff7b30'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(30, -1); ctx.stroke();
      ctx.restore();
      // off arm
      this.seg(ctx, -12, -72, -16, -56, 6, '#2a2428');
      // head w/ cracked helm
      ctx.fillStyle = '#332b30'; ctx.beginPath(); ctx.arc(2, -88, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff9440'; ctx.fillRect(3, -90, 7, 2.6);
      ctx.strokeStyle = '#1c1719'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-3, -96); ctx.lineTo(0, -88); ctx.stroke();
    }
    else if (type === 'stoneGuardian') {
      // heavy rock golem
      const c = pose === 'move' ? Math.sin(t * 4) : 0;
      const slam = pose === 'attack' ? (aT < 0.5 ? -easeOut(aT * 2) : easeOut((aT - 0.5) * 2)) : 0;
      ctx.translate(0, Math.abs(c) * -2);
      // legs — stone pillars
      ctx.fillStyle = '#5a5751'; rr(ctx, -20 + c * 4, -30, 15, 30, 4); ctx.fill();
      ctx.fillStyle = '#6c6960'; rr(ctx, 6 - c * 4, -30, 15, 30, 4); ctx.fill();
      // body
      ctx.fillStyle = '#716d63';
      ctx.beginPath(); ctx.moveTo(-26, -78); ctx.lineTo(-22, -28); ctx.lineTo(22, -28); ctx.lineTo(26, -78);
      ctx.quadraticCurveTo(0, -92, -26, -78); ctx.fill();
      ctx.fillStyle = '#57544c';
      ctx.beginPath(); ctx.moveTo(-26, -78); ctx.lineTo(-22, -28); ctx.lineTo(-8, -28); ctx.lineTo(-10, -80); ctx.fill();
      // moss + cracks + corruption glow
      ctx.strokeStyle = '#2f2c28'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(-4, -58); ctx.lineTo(-12, -44); ctx.stroke();
      ctx.strokeStyle = `rgba(160,80,255,${0.5 + Math.sin(t * 4) * 0.25})`;
      ctx.beginPath(); ctx.moveTo(8, -66); ctx.lineTo(4, -52); ctx.lineTo(10, -40); ctx.stroke();
      // arms — massive
      const armY = slam * 34;
      ctx.fillStyle = '#67635a';
      ctx.save(); ctx.translate(24, -70); ctx.rotate(-0.5 + slam * 1.4);
      rr(ctx, 0, -6, 34, 15, 6); ctx.fill();
      ctx.fillStyle = '#7d7a70'; ctx.beginPath(); ctx.arc(38, 2, 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#3a3733'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(32, -4); ctx.lineTo(42, 6); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#4e4b44';
      ctx.save(); ctx.translate(-24, -70); ctx.rotate(0.4 - c * 0.15);
      rr(ctx, -30, -6, 30, 14, 6); ctx.fill(); ctx.restore();
      // head — small in huge shoulders
      ctx.fillStyle = '#7d7a70'; ctx.beginPath(); ctx.arc(4, -88, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(190,110,255,${0.7 + Math.sin(t * 5) * 0.3})`;
      ctx.fillRect(4, -91, 9, 3);
    }
    else if (type === 'shadowArcher') {
      const c = pose === 'move' ? Math.sin(t * 8) : 0;
      const draw = pose === 'attack' ? Math.min(1, aT * 1.6) : 0;
      this.limb(ctx, 2, -40, 6 + c * 5, -20, 4 + c * 6, 0, 6, '#2a2040');
      this.limb(ctx, -2, -40, -5 - c * 5, -20, -3 - c * 6, 0, 6, '#1e1730');
      // hooded cloak
      ctx.fillStyle = '#352a52';
      ctx.beginPath(); ctx.moveTo(-14, -78); ctx.quadraticCurveTo(-18, -50, -12, -36);
      ctx.lineTo(12, -36); ctx.quadraticCurveTo(16, -55, 12, -78);
      ctx.quadraticCurveTo(0, -86, -14, -78); ctx.fill();
      // hood
      ctx.fillStyle = '#443768';
      ctx.beginPath(); ctx.arc(4, -84, 11, Math.PI * 0.85, TAU + Math.PI * 0.15); ctx.fill();
      ctx.fillStyle = '#0f0a1c'; ctx.beginPath(); ctx.ellipse(6, -83, 7, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d46bff'; ctx.beginPath(); ctx.arc(8, -84, 1.8, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -84.5, 1.5, 0, TAU); ctx.fill();
      // bow
      ctx.strokeStyle = '#6a5a9a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(16, -62, 20, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
      // string + arrow
      ctx.strokeStyle = '#cabcf5'; ctx.lineWidth = 1;
      const pull = 16 - draw * 14;
      ctx.beginPath(); ctx.moveTo(16 + Math.cos(-Math.PI * 0.42) * 20, -62 + Math.sin(-Math.PI * 0.42) * 20);
      ctx.lineTo(pull, -62);
      ctx.lineTo(16 + Math.cos(Math.PI * 0.42) * 20, -62 + Math.sin(Math.PI * 0.42) * 20); ctx.stroke();
      if (draw > 0.1) {
        ctx.strokeStyle = '#e08bff'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(pull, -62); ctx.lineTo(pull + 28, -62); ctx.stroke();
      }
      this.seg(ctx, 8, -70, pull, -62, 5, '#2a2040');
      this.seg(ctx, 6, -70, 34, -62, 5, '#352a52');
    }
    else if (type === 'corruptedBeast') {
      // quadruped
      const c = Math.sin(t * (pose === 'move' ? 14 : 3));
      const pounce = pose === 'attack' ? easeOut(Math.min(1, aT * 2)) : 0;
      ctx.translate(pounce * 10, -pounce * 8);
      // legs
      this.limb(ctx, -18, -22, -22 + c * 6, -10, -20 + c * 9, 0, 5, '#2e1f38');
      this.limb(ctx, 16, -24, 20 - c * 6, -11, 22 - c * 9, 0, 5, '#2e1f38');
      this.limb(ctx, -12, -22, -14 - c * 5, -10, -12 - c * 8, 0, 5, '#402b50');
      this.limb(ctx, 20, -24, 24 + c * 5, -12, 27 + c * 8, 0, 5, '#402b50');
      // body
      ctx.fillStyle = '#3a2848';
      ctx.beginPath(); ctx.ellipse(0, -26, 26, 13, -0.08, 0, TAU); ctx.fill();
      // spines
      ctx.fillStyle = '#7a4fd0';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(-16 + i * 8, -36); ctx.lineTo(-12 + i * 8, -44 - Math.sin(t * 4 + i) * 2); ctx.lineTo(-8 + i * 8, -36); ctx.fill();
      }
      // head
      ctx.fillStyle = '#443055';
      ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(44, -28); ctx.lineTo(40, -18); ctx.lineTo(22, -20); ctx.closePath(); ctx.fill();
      // jaw
      const jaw = pose === 'attack' ? 6 : Math.abs(Math.sin(t * 2)) * 2;
      ctx.fillStyle = '#382745';
      ctx.beginPath(); ctx.moveTo(26, -18); ctx.lineTo(43, -14 + jaw); ctx.lineTo(26, -13 + jaw * 0.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e6d9f5';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 4, -18); ctx.lineTo(31.5 + i * 4, -14.6); ctx.lineTo(33 + i * 4, -18); ctx.fill(); }
      ctx.fillStyle = '#ff5ecf'; ctx.beginPath(); ctx.ellipse(34, -28, 3, 1.8, 0.2, 0, TAU); ctx.fill();
      // tail
      ctx.strokeStyle = '#3a2848'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-24, -28); ctx.quadraticCurveTo(-38, -32 + c * 6, -46, -22 + c * 8); ctx.stroke();
    }
    else if (type === 'voidMage') {
      // floating robed caster
      const fl = Math.sin(t * 2.4) * 6;
      ctx.translate(0, fl - 14);
      const chg = pose === 'attack' ? Math.min(1, aT * 1.4) : 0;
      // robe
      ctx.fillStyle = '#1e1440';
      ctx.beginPath(); ctx.moveTo(-16, -60); ctx.quadraticCurveTo(-22, -20, -10 + Math.sin(t * 3) * 3, 4);
      ctx.quadraticCurveTo(0, 10, 10 + Math.sin(t * 3 + 2) * 3, 4);
      ctx.quadraticCurveTo(22, -20, 16, -60); ctx.quadraticCurveTo(0, -70, -16, -60); ctx.fill();
      ctx.fillStyle = '#2c1e5c';
      ctx.beginPath(); ctx.moveTo(-8, -62); ctx.quadraticCurveTo(-10, -20, -2, 2); ctx.lineTo(4, 0); ctx.quadraticCurveTo(2, -30, 6, -62); ctx.fill();
      // rune belt
      ctx.fillStyle = '#8a5fff';
      for (let i = -2; i <= 2; i++) { ctx.fillRect(i * 7 - 1.5, -42 + Math.abs(i), 3, 4); }
      // hood + void face
      ctx.fillStyle = '#31226b'; ctx.beginPath(); ctx.arc(2, -68, 12, Math.PI * 0.8, TAU + Math.PI * 0.2); ctx.fill();
      ctx.fillStyle = '#07030f'; ctx.beginPath(); ctx.ellipse(3, -66, 8, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b18aff';
      ctx.beginPath(); ctx.arc(6, -67, 2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -67.5, 1.7, 0, TAU); ctx.fill();
      // orb between hands
      const or = 6 + chg * 8 + Math.sin(t * 8) * 1.5;
      const g = ctx.createRadialGradient(24, -48, 1, 24, -48, or + 6);
      g.addColorStop(0, '#e4d2ff'); g.addColorStop(0.5, '#8a5fff'); g.addColorStop(1, '#8a5fff00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(24, -48, or + 6, 0, TAU); ctx.fill();
      this.seg(ctx, 12, -58, 22, -52, 5, '#1e1440');
      this.seg(ctx, 10, -50, 20, -44, 5, '#2c1e5c');
    }
    else if (type === 'eliteGuardian') {
      // tall armored with glowing spear
      const c = pose === 'move' ? Math.sin(t * 7) : 0;
      const thrust = pose === 'attack' ? (aT < 0.35 ? -aT : easeOut((aT - 0.35) / 0.4) * 1.2) : 0;
      this.limb(ctx, 3, -52, 8 + c * 7, -26, 6 + c * 9, 0, 9, '#2f3444');
      this.limb(ctx, -3, -52, -7 - c * 7, -26, -5 - c * 9, 0, 9, '#232735');
      // armored torso
      ctx.fillStyle = '#3a4054';
      ctx.beginPath(); ctx.moveTo(-16, -92); ctx.lineTo(-13, -48); ctx.lineTo(13, -48); ctx.lineTo(16, -92);
      ctx.quadraticCurveTo(0, -100, -16, -92); ctx.fill();
      // chest sigil
      ctx.strokeStyle = `rgba(255,80,90,${0.6 + Math.sin(t * 3) * 0.3})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -74, 7, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -81); ctx.lineTo(0, -67); ctx.moveTo(-7, -74); ctx.lineTo(7, -74); ctx.stroke();
      // pauldrons w/ spikes
      ctx.fillStyle = '#4d5570';
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(15 * s, -90, 9, 6, s * 0.3, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(20 * s, -94); ctx.lineTo(26 * s, -102); ctx.lineTo(15 * s, -96); ctx.fill();
      }
      // spear
      const sx = 18 + thrust * 26;
      ctx.save(); ctx.translate(sx, -70); ctx.rotate(0.06);
      ctx.strokeStyle = '#5c5245'; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(-24, 18); ctx.lineTo(28, -16); ctx.stroke();
      ctx.fillStyle = '#ff5560';
      ctx.beginPath(); ctx.moveTo(28, -16); ctx.lineTo(44, -27); ctx.lineTo(33, -9); ctx.closePath(); ctx.fill();
      const g2 = ctx.createRadialGradient(36, -20, 1, 36, -20, 14);
      g2.addColorStop(0, '#ff98a066'); g2.addColorStop(1, '#ff556000');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(36, -20, 14, 0, TAU); ctx.fill();
      ctx.restore();
      this.seg(ctx, 12, -88, sx - 4, -74, 7, '#3a4054');
      this.seg(ctx, -12, -88, sx - 14, -66, 7, '#232735');
      // horned helm
      ctx.fillStyle = '#4d5570'; ctx.beginPath(); ctx.arc(3, -106, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#10121c'; ctx.fillRect(1, -109, 11, 4);
      ctx.fillStyle = '#ff5560'; ctx.fillRect(4, -108.4, 7, 2.4);
      ctx.strokeStyle = '#4d5570'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-4, -113); ctx.quadraticCurveTo(-9, -122, -4, -128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(9, -113); ctx.quadraticCurveTo(14, -122, 9, -128); ctx.stroke();
    }
    ctx.restore();
  },

  // ============ VYOMASURA (villain, both forms) ============
  // st: {t, pose:'idle|attack|cast|hurt|walk', attackT, form:1|2, scale}
  vyomasura(ctx, st) {
    const t = st.t || 0, form = st.form || 1;
    const sc = (st.scale || 1) * (form === 2 ? 1.35 : 1);
    ctx.save();
    if (st.facing === -1) ctx.scale(-1, 1);
    ctx.scale(sc, sc);
    const breathe = Math.sin(t * 1.3) * 2;
    const H = 190;

    // ambient smoke
    for (let i = 0; i < 6; i++) {
      const sx = Math.sin(t * 0.9 + i * 1.9) * 34;
      const sy = -((t * 26 + i * 53) % (H * 1.1));
      ctx.fillStyle = `rgba(30,16,50,${0.22 - (sy / -(H * 1.1)) * 0.18})`;
      ctx.beginPath(); ctx.ellipse(sx, sy - 20, 16 + i * 2, 24 + i * 3, 0, 0, TAU); ctx.fill();
    }

    const pose = st.pose || 'idle', aT = st.attackT || 0;
    let armRaise = 0, lean2 = 0;
    if (pose === 'cast') armRaise = Math.min(1, aT * 2);
    if (pose === 'attack') { armRaise = aT < 0.4 ? aT * 2.2 : (1 - (aT - 0.4) * 1.4); lean2 = aT > 0.4 ? 0.1 : -0.04; }
    if (pose === 'hurt') lean2 = -0.1;
    ctx.rotate(lean2);

    // flowing dark cloth (lower body)
    ctx.fillStyle = '#141020';
    ctx.beginPath();
    ctx.moveTo(-26, -H * 0.62);
    ctx.quadraticCurveTo(-42 + Math.sin(t * 1.6) * 6, -H * 0.3, -30 + Math.sin(t * 2.1) * 8, 2);
    ctx.quadraticCurveTo(-10, 8, 4 + Math.sin(t * 1.8) * 5, 4);
    ctx.quadraticCurveTo(22, 8, 34 + Math.sin(t * 2.3) * 8, -4);
    ctx.quadraticCurveTo(40, -H * 0.32, 26, -H * 0.62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1e1830';
    ctx.beginPath(); ctx.moveTo(-14, -H * 0.6); ctx.quadraticCurveTo(-20, -H * 0.25, -8, -6);
    ctx.lineTo(4, -8); ctx.quadraticCurveTo(-2, -H * 0.3, 6, -H * 0.6); ctx.fill();

    // torso — cracked stone body
    ctx.fillStyle = '#232030';
    ctx.beginPath();
    ctx.moveTo(-30, -H * 0.88 + breathe);
    ctx.quadraticCurveTo(-36, -H * 0.7, -24, -H * 0.58);
    ctx.lineTo(22, -H * 0.58);
    ctx.quadraticCurveTo(38, -H * 0.72, 30, -H * 0.88 + breathe);
    ctx.quadraticCurveTo(0, -H * 0.98 + breathe, -30, -H * 0.88 + breathe);
    ctx.fill();
    // glowing cracks — trapped energy
    const crackGlow = 0.5 + Math.sin(t * 2.6) * 0.3;
    ctx.strokeStyle = form === 2 ? `rgba(255,60,90,${crackGlow})` : `rgba(150,70,255,${crackGlow})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-12, -H * 0.9); ctx.lineTo(-6, -H * 0.8); ctx.lineTo(-14, -H * 0.7); ctx.lineTo(-8, -H * 0.63); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -H * 0.86); ctx.lineTo(6, -H * 0.76); ctx.lineTo(14, -H * 0.66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -H * 0.94); ctx.lineTo(2, -H * 0.84); ctx.stroke();
    // ancient armor fragments
    ctx.fillStyle = '#3f3a52';
    ctx.beginPath(); ctx.moveTo(-32, -H * 0.9); ctx.lineTo(-14, -H * 0.95); ctx.lineTo(-16, -H * 0.85); ctx.lineTo(-30, -H * 0.8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a7a4a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-29, -H * 0.88); ctx.lineTo(-18, -H * 0.915); ctx.stroke();
    ctx.fillStyle = '#38334a';
    ctx.beginPath(); ctx.moveTo(32, -H * 0.9); ctx.lineTo(16, -H * 0.94); ctx.lineTo(18, -H * 0.83); ctx.lineTo(30, -H * 0.79); ctx.closePath(); ctx.fill();
    // ceremonial chest ornament
    ctx.strokeStyle = '#8a7a4a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-16, -H * 0.88); ctx.quadraticCurveTo(0, -H * 0.76, 16, -H * 0.88); ctx.stroke();
    ctx.fillStyle = form === 2 ? '#ff3c5a' : '#9646ff';
    ctx.beginPath(); ctx.arc(0, -H * 0.78, 4, 0, TAU); ctx.fill();

    // arms — long, clawed
    const armA = -0.35 - armRaise * 1.7;
    // far arm
    ctx.save(); ctx.translate(-26, -H * 0.85);
    ctx.rotate(0.5 - armRaise * 0.4);
    this.seg(ctx, 0, 0, -12, 40, 12, '#1c1928');
    this.seg(ctx, -12, 40, -8, 78, 10, '#141220');
    for (let i = 0; i < 4; i++) this.seg(ctx, -8, 78, -14 + i * 5, 94, 2.6, '#5a4a80');
    ctx.restore();
    // near arm
    ctx.save(); ctx.translate(28, -H * 0.86);
    ctx.rotate(armA);
    this.seg(ctx, 0, 0, 10, 42, 13, '#2a2638');
    this.seg(ctx, 10, 42, 20, 80, 11, '#1e1a2c');
    for (let i = 0; i < 4; i++) this.seg(ctx, 20, 80, 12 + i * 6, 98, 3, '#6a5a95');
    // shadow orb when casting
    if (pose === 'cast' || pose === 'attack') {
      const or = 10 + armRaise * 14 + Math.sin(t * 9) * 2;
      const g = ctx.createRadialGradient(20, 92, 2, 20, 92, or + 10);
      const col = form === 2 ? '255,60,90' : '150,70,255';
      g.addColorStop(0, '#fff'); g.addColorStop(0.35, `rgba(${col},0.9)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(20, 92, or + 10, 0, TAU); ctx.fill();
    }
    ctx.restore();

    // head — intimidating silhouette w/ crown fragments
    const hdY = -H * 0.98 + breathe;
    ctx.fillStyle = '#26222f';
    ctx.beginPath(); ctx.ellipse(4, hdY, 15, 18, 0, 0, TAU); ctx.fill();
    // face plate shadow
    ctx.fillStyle = '#141118';
    ctx.beginPath(); ctx.ellipse(9, hdY + 2, 9, 13, 0.1, 0, TAU); ctx.fill();
    // glowing eyes
    const eg = 0.75 + Math.sin(t * 3.2) * 0.25;
    const ecol = form === 2 ? `rgba(255,70,100,${eg})` : `rgba(170,90,255,${eg})`;
    ctx.fillStyle = ecol;
    ctx.beginPath(); ctx.ellipse(13, hdY - 2, 3.6, 1.8, 0.12, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, hdY - 2.5, 3.2, 1.6, 0.12, 0, TAU); ctx.fill();
    // eye trails
    ctx.fillStyle = ecol.replace(/[\d.]+\)$/, '0.2)');
    ctx.beginPath(); ctx.ellipse(8, hdY - 2, 12, 4, 0.1, 0, TAU); ctx.fill();
    // broken crown
    ctx.fillStyle = '#4a4260';
    ctx.beginPath(); ctx.moveTo(-10, hdY - 12); ctx.lineTo(-8, hdY - 26); ctx.lineTo(-3, hdY - 14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, hdY - 15); ctx.lineTo(4, hdY - 32); ctx.lineTo(9, hdY - 15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(11, hdY - 13); ctx.lineTo(16, hdY - 24); ctx.lineTo(17, hdY - 11); ctx.fill();
    ctx.strokeStyle = '#8a7a4a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-11, hdY - 12); ctx.lineTo(18, hdY - 11); ctx.stroke();

    if (form === 2) {
      // Unbound: extra shadow wings / tendrils
      for (const s of [-1, 1]) {
        ctx.fillStyle = 'rgba(24,12,40,0.75)';
        ctx.beginPath();
        ctx.moveTo(s * 20, -H * 0.85);
        ctx.quadraticCurveTo(s * (70 + Math.sin(t * 1.5) * 10), -H * 1.05, s * (95 + Math.sin(t * 1.2) * 14), -H * 0.7);
        ctx.quadraticCurveTo(s * 60, -H * 0.72, s * 30, -H * 0.62);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(255,60,90,${0.35 + Math.sin(t * 2 + s) * 0.15})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s * 24, -H * 0.83);
        ctx.quadraticCurveTo(s * 66, -H * 0.98, s * 88, -H * 0.72); ctx.stroke();
      }
    }
    ctx.restore();
  },

  // ============ BOSSES ============
  boss(ctx, type, st) {
    const t = st.t || 0;
    if (type === 'fallenGuardian') {
      ctx.save(); if (st.facing === -1) ctx.scale(-1, 1); ctx.scale(1.9, 1.9);
      this.enemy(ctx, 'stoneGuardian', { ...st, facing: 1 });
      // corrupted halo fragments
      ctx.strokeStyle = `rgba(170,80,255,${0.5 + Math.sin(t * 3) * 0.25})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(4, -102, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      ctx.restore();
    } else if (type === 'shadowBeast') {
      ctx.save(); if (st.facing === -1) ctx.scale(-1, 1); ctx.scale(2.3, 2.3);
      this.enemy(ctx, 'corruptedBeast', { ...st, facing: 1 });
      ctx.restore();
    } else if (type === 'templeGuardian') {
      // four-armed living statue
      ctx.save(); if (st.facing === -1) ctx.scale(-1, 1);
      const c = Math.sin(t * 2), aT = st.attackT || 0;
      const H = 200;
      // base robes (stone)
      ctx.fillStyle = '#6a5c48';
      ctx.beginPath(); ctx.moveTo(-46, 0); ctx.quadraticCurveTo(-40, -H * 0.5, -30, -H * 0.62);
      ctx.lineTo(30, -H * 0.62); ctx.quadraticCurveTo(44, -H * 0.5, 46, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#57493a';
      ctx.beginPath(); ctx.moveTo(-20, -4); ctx.quadraticCurveTo(-18, -H * 0.4, -10, -H * 0.6); ctx.lineTo(4, -H * 0.6); ctx.quadraticCurveTo(-4, -H * 0.35, 2, -4); ctx.closePath(); ctx.fill();
      // carved skirt lines
      ctx.strokeStyle = '#3f3527'; ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 11, -8); ctx.quadraticCurveTo(i * 9, -H * 0.3, i * 7, -H * 0.55); ctx.stroke(); }
      // torso
      ctx.fillStyle = '#7d6e56';
      ctx.beginPath(); ctx.moveTo(-32, -H * 0.92); ctx.lineTo(-28, -H * 0.6); ctx.lineTo(28, -H * 0.6); ctx.lineTo(32, -H * 0.92);
      ctx.quadraticCurveTo(0, -H * 1.0, -32, -H * 0.92); ctx.fill();
      // corruption veins
      ctx.strokeStyle = `rgba(255,120,60,${0.55 + Math.sin(t * 3.5) * 0.3})`; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(-8, -H * 0.95); ctx.lineTo(-2, -H * 0.82); ctx.lineTo(-10, -H * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -H * 0.9); ctx.lineTo(8, -H * 0.75); ctx.stroke();
      // 4 arms
      const armPos = [[-30, -H * 0.9, -0.7], [30, -H * 0.9, 0.7], [-28, -H * 0.78, -1.2], [28, -H * 0.78, 1.2]];
      armPos.forEach((ap, i) => {
        const wave = Math.sin(t * 1.6 + i * 1.7) * 0.14;
        const raise = (st.pose === 'attack' && i % 2 === 0) ? aT * 1.2 : 0;
        ctx.save(); ctx.translate(ap[0], ap[1]); ctx.rotate(ap[2] + wave - raise * sign(ap[2]));
        this.seg(ctx, 0, 0, 0, 36, 11, i < 2 ? '#7d6e56' : '#6a5c48');
        this.seg(ctx, 0, 36, 6, 66, 9, i < 2 ? '#6a5c48' : '#57493a');
        // weapon in upper arms
        if (i < 2) {
          ctx.save(); ctx.translate(6, 66); ctx.rotate(-ap[2] * 0.5);
          ctx.fillStyle = '#8a7a4a';
          ctx.beginPath(); ctx.ellipse(0, -4, 5, 16, 0, 0, TAU); ctx.fill(); // mace head
          ctx.restore();
        } else {
          ctx.fillStyle = '#57493a'; ctx.beginPath(); ctx.arc(6, 66, 6.5, 0, TAU); ctx.fill();
        }
        ctx.restore();
      });
      // head — serene carved face, corrupted eyes
      ctx.fillStyle = '#8d7d63';
      ctx.beginPath(); ctx.ellipse(2, -H * 1.02 + c, 16, 19, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6a5c48';
      ctx.beginPath(); ctx.ellipse(-4, -H * 1.0 + c, 9, 14, 0.15, 0, TAU); ctx.fill();
      // crown
      ctx.fillStyle = '#8a7a4a';
      ctx.beginPath(); ctx.moveTo(-14, -H * 1.08 + c); ctx.lineTo(0, -H * 1.24 + c); ctx.lineTo(16, -H * 1.08 + c);
      ctx.quadraticCurveTo(0, -H * 1.13 + c, -14, -H * 1.08 + c); ctx.fill();
      // eyes
      ctx.fillStyle = `rgba(255,140,60,${0.8 + Math.sin(t * 4) * 0.2})`;
      ctx.beginPath(); ctx.ellipse(9, -H * 1.03 + c, 3.4, 1.6, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-3, -H * 1.035 + c, 3, 1.5, 0, 0, TAU); ctx.fill();
      // tilak
      ctx.fillStyle = '#c05020'; ctx.fillRect(2, -H * 1.1 + c, 3, 8);
      ctx.restore();
    } else if (type === 'vyomasura') {
      this.vyomasura(ctx, { ...st, form: 1 });
    } else if (type === 'vyomasuraUnbound') {
      this.vyomasura(ctx, { ...st, form: 2 });
    }
  },
};
