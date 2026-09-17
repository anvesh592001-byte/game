// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — world.js
// Reusable environment asset library + parallax scene renderer
// + particle system. Each prop is an individual vector asset
// drawn at local origin (ground at y=0).
// ============================================================
'use strict';

const Props = {
  // ---------- BUILDINGS ----------
  house(ctx, seed, corrupted) {
    const rng = makeRng(seed);
    const w = 150 + rng() * 80, h = 130 + rng() * 70;
    const wall = corrupted ? '#3a3540' : ['#d9b98a', '#c9a06a', '#d4c39a', '#b5977a', '#cbb28f'][Math.floor(rng() * 5)];
    const wall2 = corrupted ? '#2c2833' : ['#b59668', '#a8824f', '#b3a37e', '#977a5e', '#a99070'][Math.floor(rng() * 5)];
    // wall
    ctx.fillStyle = wall; ctx.fillRect(-w / 2, -h, w, h);
    ctx.fillStyle = wall2; ctx.fillRect(-w / 2, -h, w * 0.18, h);
    // flat roof w/ parapet
    ctx.fillStyle = corrupted ? '#232030' : '#8a6a4a';
    ctx.fillRect(-w / 2 - 8, -h - 14, w + 16, 14);
    ctx.fillStyle = corrupted ? '#1a1826' : '#75593c';
    for (let i = 0; i < Math.floor(w / 26); i++) ctx.fillRect(-w / 2 - 4 + i * 26, -h - 22, 14, 8);
    // door
    ctx.fillStyle = corrupted ? '#141220' : '#6a4a2c';
    ctx.fillRect(-14, -52, 28, 52);
    ctx.strokeStyle = corrupted ? '#4a4258' : '#8a6a44'; ctx.lineWidth = 2;
    ctx.strokeRect(-14, -52, 28, 52);
    if (!corrupted) { // toran over door
      ctx.strokeStyle = '#2c7a3f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-18, -54); ctx.quadraticCurveTo(0, -46, 18, -54); ctx.stroke();
      ctx.fillStyle = '#f5a623';
      for (let i = 0; i < 5; i++) { const tx = -14 + i * 7; ctx.beginPath(); ctx.moveTo(tx, -51 + Math.abs(i - 2) * -1); ctx.lineTo(tx + 3, -44 + Math.abs(i - 2) * -1); ctx.lineTo(tx - 3, -44 + Math.abs(i - 2) * -1); ctx.fill(); }
    }
    // windows
    const wn = Math.floor(w / 60);
    for (let i = 0; i < wn; i++) {
      const wx = -w / 2 + 22 + i * (w - 44) / Math.max(1, wn - 1) - 11;
      if (Math.abs(wx + 11) < 26) continue;
      ctx.fillStyle = corrupted ? '#0d0b16' : (rng() < 0.6 ? '#ffd98a' : '#4a3a2a');
      ctx.fillRect(wx, -h + 30, 24, 30);
      ctx.strokeStyle = corrupted ? '#3a3548' : '#6a4a2c'; ctx.lineWidth = 2;
      ctx.strokeRect(wx, -h + 30, 24, 30);
      ctx.beginPath(); ctx.moveTo(wx + 12, -h + 30); ctx.lineTo(wx + 12, -h + 60); ctx.stroke();
    }
    if (corrupted) {
      ctx.strokeStyle = 'rgba(150,70,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w * 0.3, -h); ctx.lineTo(-w * 0.2, -h * 0.6); ctx.lineTo(-w * 0.34, -h * 0.3); ctx.stroke();
    }
  },
  shop(ctx, seed, corrupted, label) {
    const rng = makeRng(seed);
    const w = 120 + rng() * 40;
    ctx.fillStyle = corrupted ? '#332e3d' : '#c9a982'; ctx.fillRect(-w / 2, -95, w, 95);
    // awning
    ctx.fillStyle = corrupted ? '#252132' : ['#c0392b', '#27ae60', '#e67e22'][Math.floor(rng() * 3)];
    ctx.beginPath(); ctx.moveTo(-w / 2 - 10, -95); ctx.lineTo(w / 2 + 10, -95); ctx.lineTo(w / 2 + 4, -72); ctx.lineTo(-w / 2 - 4, -72); ctx.fill();
    if (!corrupted) {
      ctx.fillStyle = '#ffffff44';
      for (let i = 0; i < Math.floor(w / 24); i++) ctx.fillRect(-w / 2 - 4 + i * 24 + 12, -95, 12, 23);
    }
    // counter + goods
    ctx.fillStyle = corrupted ? '#1c1926' : '#8a6a44'; ctx.fillRect(-w / 2 + 8, -40, w - 16, 40);
    if (!corrupted) {
      for (let i = 0; i < Math.floor(w / 22); i++) {
        ctx.fillStyle = ['#e67e22', '#f1c40f', '#c0392b', '#8e44ad'][i % 4];
        ctx.beginPath(); ctx.arc(-w / 2 + 20 + i * 22, -46, 7, 0, TAU); ctx.fill();
      }
      // signboard
      ctx.fillStyle = '#3d2b1a'; ctx.fillRect(-w * 0.3, -118, w * 0.6, 20);
      ctx.fillStyle = '#ffd98a'; ctx.font = 'bold 11px Georgia'; ctx.textAlign = 'center';
      ctx.fillText(label || 'SRI GANESH STORES', 0, -104);
    } else {
      ctx.strokeStyle = '#4a4258'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-w * 0.3, -70); ctx.lineTo(w * 0.2, -30); ctx.moveTo(w * 0.25, -68); ctx.lineTo(-w * 0.15, -34); ctx.stroke();
    }
  },
  temple(ctx, seed, scale = 1, corrupted) {
    ctx.save(); ctx.scale(scale, scale);
    const stone = corrupted ? '#3a3245' : '#b59872';
    const stone2 = corrupted ? '#2a2435' : '#96794f';
    // base platform
    ctx.fillStyle = stone2; ctx.fillRect(-120, -28, 240, 28);
    ctx.fillStyle = stone; ctx.fillRect(-108, -48, 216, 22);
    // pillars
    for (const px of [-85, -45, 45, 85]) {
      ctx.fillStyle = px < 0 ? stone : stone2;
      ctx.fillRect(px - 8, -130, 16, 82);
      ctx.fillStyle = stone2; ctx.fillRect(px - 11, -136, 22, 8); ctx.fillRect(px - 11, -52, 22, 6);
    }
    // sanctum
    ctx.fillStyle = stone2; ctx.fillRect(-32, -128, 64, 80);
    ctx.fillStyle = corrupted ? '#0d0b16' : '#241505'; ctx.fillRect(-20, -110, 40, 62);
    if (!corrupted) {
      // deity glow
      const g = ctx.createRadialGradient(0, -80, 2, 0, -80, 30);
      g.addColorStop(0, '#ffcf7acc'); g.addColorStop(1, '#ffcf7a00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -80, 30, 0, TAU); ctx.fill();
      Props.ganeshIdolSmall(ctx, 0, -48, 0.8);
    }
    // roof beam
    ctx.fillStyle = stone; ctx.fillRect(-118, -146, 236, 18);
    ctx.fillStyle = stone2; ctx.fillRect(-118, -132, 236, 4);
    // gopuram (tiered tower)
    for (let i = 0; i < 5; i++) {
      const tw = 150 - i * 26, ty = -146 - i * 30;
      ctx.fillStyle = i % 2 ? stone2 : stone;
      ctx.beginPath(); ctx.moveTo(-tw / 2, ty); ctx.lineTo(-tw / 2 + 9, ty - 30); ctx.lineTo(tw / 2 - 9, ty - 30); ctx.lineTo(tw / 2, ty); ctx.fill();
      // carved niches
      ctx.fillStyle = corrupted ? '#1a1626' : '#7a5c34';
      for (let j = 0; j < Math.floor(tw / 30); j++) {
        ctx.fillRect(-tw / 2 + 14 + j * 30, ty - 24, 12, 18);
      }
    }
    // kalasham
    ctx.fillStyle = corrupted ? '#5c4a75' : '#e8b64c';
    ctx.beginPath(); ctx.arc(0, -302, 8, 0, TAU); ctx.fill();
    ctx.fillRect(-2.5, -318, 5, 16);
    if (corrupted) {
      ctx.strokeStyle = 'rgba(150,70,255,0.55)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-60, -140); ctx.lineTo(-45, -90); ctx.lineTo(-64, -60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, -170); ctx.lineTo(40, -120); ctx.stroke();
    }
    ctx.restore();
  },
  // ---------- FESTIVAL ----------
  ganeshIdolSmall(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // seated Ganesh silhouette — warm gold
    ctx.fillStyle = '#e8a33c';
    ctx.beginPath(); ctx.ellipse(0, -18, 17, 14, 0, 0, TAU); ctx.fill(); // body
    ctx.beginPath(); ctx.arc(0, -38, 11, 0, TAU); ctx.fill(); // head
    // ears
    ctx.beginPath(); ctx.ellipse(-12, -38, 6, 8, -0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -38, 6, 8, 0.2, 0, TAU); ctx.fill();
    // trunk
    ctx.strokeStyle = '#e8a33c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(2, -24, -5, -22); ctx.stroke();
    // crown
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(-9, -46); ctx.lineTo(0, -58); ctx.lineTo(9, -46); ctx.quadraticCurveTo(0, -50, -9, -46); ctx.fill();
    // legs crossed
    ctx.fillStyle = '#d4922e';
    ctx.beginPath(); ctx.ellipse(0, -6, 19, 6, 0, 0, TAU); ctx.fill();
    // dhoti stripe
    ctx.fillStyle = '#c0392b'; ctx.fillRect(-14, -14, 28, 4);
    ctx.restore();
  },
  ganeshIdolLarge(ctx, s = 1, glow = 1) {
    ctx.save(); ctx.scale(s, s);
    if (glow > 0) {
      const g = ctx.createRadialGradient(0, -90, 10, 0, -90, 160);
      g.addColorStop(0, `rgba(255,200,110,${0.4 * glow})`); g.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -90, 160, 0, TAU); ctx.fill();
    }
    // pedestal
    ctx.fillStyle = '#8a4a2c'; ctx.fillRect(-70, -22, 140, 22);
    ctx.fillStyle = '#a85c36'; ctx.fillRect(-62, -30, 124, 8);
    // marigold garland on pedestal
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#f5a623' : '#e67e22'; ctx.beginPath(); ctx.arc(-60 + i * 11, -20, 4.5, 0, TAU); ctx.fill(); }
    // body
    ctx.fillStyle = '#e8a33c';
    ctx.beginPath(); ctx.ellipse(0, -62, 42, 36, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d4922e';
    ctx.beginPath(); ctx.ellipse(-12, -58, 22, 28, 0.2, 0, TAU); ctx.fill();
    // belly band
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-38, -70); ctx.quadraticCurveTo(0, -48, 38, -70); ctx.stroke();
    // legs
    ctx.fillStyle = '#e8a33c';
    ctx.beginPath(); ctx.ellipse(0, -28, 46, 13, 0, 0, TAU); ctx.fill();
    // arms (4)
    ctx.strokeStyle = '#e8a33c'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-36, -78); ctx.quadraticCurveTo(-56, -92, -52, -112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(36, -78); ctx.quadraticCurveTo(56, -92, 52, -112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, -70); ctx.quadraticCurveTo(-52, -60, -60, -66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34, -70); ctx.quadraticCurveTo(50, -58, 56, -52); ctx.stroke();
    // modak in lower left hand
    ctx.fillStyle = '#f0c060'; ctx.beginPath(); ctx.moveTo(-64, -62); ctx.lineTo(-56, -62); ctx.lineTo(-60, -72); ctx.fill();
    // head
    ctx.fillStyle = '#e8a33c'; ctx.beginPath(); ctx.arc(0, -118, 26, 0, TAU); ctx.fill();
    // ears
    ctx.fillStyle = '#d4922e';
    ctx.beginPath(); ctx.ellipse(-27, -116, 13, 18, -0.25, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(27, -116, 13, 18, 0.25, 0, TAU); ctx.fill();
    // trunk
    ctx.strokeStyle = '#e8a33c'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(6, -84, -10, -78); ctx.quadraticCurveTo(-18, -76, -16, -84); ctx.stroke();
    // eyes
    ctx.fillStyle = '#3d2510';
    ctx.beginPath(); ctx.ellipse(-9, -122, 3, 4.5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, -122, 3, 4.5, 0, 0, TAU); ctx.fill();
    // tilak
    ctx.fillStyle = '#c0392b'; ctx.fillRect(-2, -140, 4, 12);
    // crown
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(-22, -134); ctx.lineTo(-12, -158); ctx.lineTo(0, -140); ctx.lineTo(12, -158); ctx.lineTo(22, -134);
    ctx.quadraticCurveTo(0, -142, -22, -134); ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath(); ctx.arc(0, -152, 4, 0, TAU); ctx.fill();
    ctx.restore();
  },
  festivalStage(ctx, t) {
    // pandal stage with idol
    ctx.fillStyle = '#7a3b28'; ctx.fillRect(-140, -30, 280, 30);
    ctx.fillStyle = '#94492f'; ctx.fillRect(-140, -34, 280, 6);
    // pillars + canopy
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-136, -180, 12, 148); ctx.fillRect(124, -180, 12, 148);
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.moveTo(-150, -180); ctx.lineTo(150, -180); ctx.lineTo(130, -208); ctx.lineTo(-130, -208); ctx.fill();
    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(-140 + i * 20, -180); ctx.lineTo(-130 + i * 20, -168); ctx.lineTo(-120 + i * 20, -180); ctx.fill(); }
    Props.ganeshIdolLarge(ctx, 0.9, 0.8 + Math.sin(t * 2) * 0.2);
    ctx.translate(0, -30);
  },
  banner(ctx, w, t, broken) {
    // string of triangular flags
    ctx.strokeStyle = broken ? '#3a3548' : '#5c4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(0, 14, w / 2, 0); ctx.stroke();
    const n = Math.floor(w / 26);
    for (let i = 0; i <= n; i++) {
      const p = i / n, fx = -w / 2 + p * w;
      const fy = 14 * (1 - Math.pow(2 * p - 1, 2)) * 0.9;
      const sway = broken ? 0 : Math.sin((t || 0) * 3 + i) * 2;
      ctx.fillStyle = broken ? ['#3a3240', '#302a38'][i % 2] : ['#e74c3c', '#f1c40f', '#2ecc71', '#e67e22', '#9b59b6'][i % 5];
      ctx.beginPath(); ctx.moveTo(fx - 8, fy); ctx.lineTo(fx + 8, fy); ctx.lineTo(fx + sway, fy + 16); ctx.fill();
      if (broken && i % 3 === 0) { ctx.beginPath(); ctx.moveTo(fx - 8, fy); ctx.lineTo(fx - 2, fy + 10); ctx.lineTo(fx - 8, fy + 7); ctx.fill(); }
    }
  },
  rangoli(ctx, s = 1) {
    ctx.save(); ctx.scale(s, s * 0.35);
    const cols = ['#e74c3c', '#f1c40f', '#2ecc71', '#e67e22', '#ffffff'];
    for (let ring = 4; ring >= 0; ring--) {
      ctx.fillStyle = cols[ring];
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * TAU, r = 8 + ring * 9 + (i % 2 ? 4 : 0);
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },
  diya(ctx, t) {
    ctx.fillStyle = '#8a4a2c';
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(0, 6, 8, 0); ctx.lineTo(5, -4); ctx.lineTo(-5, -4); ctx.fill();
    const f = Math.sin((t || 0) * 11) * 1.5;
    const g = ctx.createRadialGradient(0, -9, 1, 0, -9, 14);
    g.addColorStop(0, '#fff3c4'); g.addColorStop(0.4, '#ffb340aa'); g.addColorStop(1, '#ffb34000');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -9, 14, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath(); ctx.moveTo(0, -14 - f); ctx.quadraticCurveTo(3.5, -8, 0, -4); ctx.quadraticCurveTo(-3.5, -8, 0, -14 - f); ctx.fill();
  },
  streetLamp(ctx, on, corrupted) {
    ctx.fillStyle = corrupted ? '#2a2635' : '#3a3a42';
    ctx.fillRect(-4, -170, 8, 170);
    ctx.fillRect(-26, -174, 52, 6);
    ctx.fillStyle = on ? '#ffd98a' : '#333340';
    ctx.beginPath(); ctx.ellipse(-20, -164, 7, 9, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20, -164, 7, 9, 0, 0, TAU); ctx.fill();
    if (on) {
      const g = ctx.createRadialGradient(0, -160, 5, 0, -160, 90);
      g.addColorStop(0, 'rgba(255,217,138,0.28)'); g.addColorStop(1, 'rgba(255,217,138,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -160, 90, 0, TAU); ctx.fill();
    }
    if (corrupted) { ctx.save(); ctx.rotate(0.12); ctx.fillStyle = '#2a2635'; ctx.fillRect(-3, -172, 6, 30); ctx.restore(); }
  },
  tree(ctx, seed, dark) {
    const rng = makeRng(seed);
    const h = 120 + rng() * 90;
    ctx.strokeStyle = dark ? '#1e1a26' : '#5c4230'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(rng() * 14 - 7, -h * 0.5, rng() * 20 - 10, -h); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, -h * 0.55); ctx.quadraticCurveTo(24, -h * 0.68, 34, -h * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -h * 0.45); ctx.quadraticCurveTo(-22, -h * 0.6, -32, -h * 0.72); ctx.stroke();
    const leaf = dark ? ['#1a2418', '#141d13'] : ['#3f7a42', '#356b38', '#4a8a4e'];
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = leaf[i % leaf.length];
      const lx = (rng() - 0.5) * 90, ly = -h - rng() * 40 + 20;
      ctx.beginPath(); ctx.ellipse(lx, ly, 30 + rng() * 22, 22 + rng() * 14, rng(), 0, TAU); ctx.fill();
    }
  },
  autoRickshaw(ctx, corrupted) {
    ctx.save();
    if (corrupted) { ctx.rotate(-0.12); ctx.translate(0, -4); }
    // body
    ctx.fillStyle = corrupted ? '#2e2a38' : '#f1c40f';
    ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(-30, -44); ctx.quadraticCurveTo(-28, -52, -18, -52);
    ctx.lineTo(22, -52); ctx.quadraticCurveTo(36, -50, 38, -36); ctx.lineTo(38, -14); ctx.closePath(); ctx.fill();
    // canopy
    ctx.fillStyle = corrupted ? '#1c1926' : '#2c3e50';
    ctx.beginPath(); ctx.moveTo(-32, -44); ctx.quadraticCurveTo(-30, -56, -16, -56); ctx.lineTo(24, -56); ctx.quadraticCurveTo(34, -54, 36, -44); ctx.lineTo(22, -52); ctx.lineTo(-18, -52); ctx.closePath(); ctx.fill();
    // windshield
    ctx.fillStyle = corrupted ? '#141220' : '#aed6f1aa';
    ctx.beginPath(); ctx.moveTo(24, -50); ctx.lineTo(35, -38); ctx.lineTo(35, -30); ctx.lineTo(24, -40); ctx.closePath(); ctx.fill();
    // wheels
    for (const wx of [-22, 26]) {
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(wx, -8, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(wx, -8, 4, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
  drumSet(ctx) { // dhol on stand
    ctx.fillStyle = '#8a4a2c';
    ctx.save(); ctx.rotate(0.2);
    rr(ctx, -18, -46, 36, 26, 6); ctx.fill();
    ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.ellipse(-18, -33, 5, 13, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, -33, 5, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 9, -46); ctx.lineTo(-10 + i * 9, -20); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#5c4230'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(0, -22); ctx.lineTo(14, 0); ctx.stroke();
  },
  brokenPillar(ctx, seed) {
    const rng = makeRng(seed);
    const h = 60 + rng() * 70;
    ctx.fillStyle = '#6a6156';
    ctx.fillRect(-12, -h, 24, h);
    ctx.fillStyle = '#57504a';
    ctx.fillRect(-12, -h, 8, h);
    // broken top
    ctx.fillStyle = '#6a6156';
    ctx.beginPath(); ctx.moveTo(-12, -h); ctx.lineTo(-4, -h - 12 - rng() * 8); ctx.lineTo(4, -h - 4); ctx.lineTo(12, -h - 10); ctx.lineTo(12, -h); ctx.fill();
    ctx.strokeStyle = '#3f3a33'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-6, -h * 0.7); ctx.lineTo(2, -h * 0.5); ctx.lineTo(-4, -h * 0.3); ctx.stroke();
    ctx.fillStyle = '#4a5a3f'; ctx.beginPath(); ctx.ellipse(-8, -h * 0.2, 6, 14, 0.3, 0, TAU); ctx.fill();
  },
  ancientSeal(ctx, t, broken) {
    // glowing circular seal on floor/wall
    ctx.save();
    const pulse = 0.6 + Math.sin(t * 1.8) * 0.25;
    const col = broken ? '150,70,255' : '255,180,80';
    ctx.strokeStyle = `rgba(${col},${pulse})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 55, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.stroke();
    // inner geometry
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + t * (broken ? 0.4 : 0.08);
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 44, Math.sin(a) * 44);
      ctx.lineTo(Math.cos(a + TAU / 3) * 44, Math.sin(a + TAU / 3) * 44); ctx.stroke();
    }
    // runes
    ctx.fillStyle = `rgba(${col},${pulse})`;
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU - t * (broken ? 0.3 : 0.05);
      ctx.save(); ctx.translate(Math.cos(a) * 50, Math.sin(a) * 50); ctx.rotate(a);
      ctx.fillRect(-1.5, -4, 3, 8); ctx.restore();
    }
    if (broken) {
      ctx.strokeStyle = `rgba(255,255,255,${pulse * 0.7})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(-10, 5); ctx.lineTo(-30, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(35, -35); ctx.lineTo(10, 0); ctx.lineTo(38, 30); ctx.stroke();
    }
    ctx.restore();
  },
  shrine(ctx, seed, corrupted) {
    ctx.fillStyle = corrupted ? '#2e2838' : '#96794f';
    ctx.fillRect(-30, -60, 60, 60);
    ctx.fillStyle = corrupted ? '#221d2e' : '#7a5c34';
    ctx.beginPath(); ctx.moveTo(-38, -60); ctx.lineTo(0, -92); ctx.lineTo(38, -60); ctx.fill();
    ctx.fillStyle = corrupted ? '#0d0b16' : '#2a1808';
    ctx.beginPath(); ctx.arc(0, -34, 16, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-16, -34, 32, 12);
    if (!corrupted) {
      const g = ctx.createRadialGradient(0, -32, 2, 0, -32, 20);
      g.addColorStop(0, '#ffcf7a99'); g.addColorStop(1, '#ffcf7a00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -32, 20, 0, TAU); ctx.fill();
    }
  },
  rock(ctx, seed) {
    const rng = makeRng(seed);
    const s = 14 + rng() * 26;
    ctx.fillStyle = ['#6a6156', '#5c564e', '#736a5c'][Math.floor(rng() * 3)];
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(-s * 0.7, -s * 0.75); ctx.lineTo(-s * 0.1, -s); ctx.lineTo(s * 0.6, -s * 0.7); ctx.lineTo(s, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(-s * 0.7, -s * 0.75); ctx.lineTo(-s * 0.3, 0); ctx.fill();
  },
  corruptCrystal(ctx, t, s = 1) {
    ctx.save(); ctx.scale(s, s);
    const p = 0.6 + Math.sin((t || 0) * 3) * 0.3;
    ctx.fillStyle = `rgba(110,50,190,0.9)`;
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-6, -34); ctx.lineTo(0, -8); ctx.lineTo(6, -44); ctx.lineTo(14, 0); ctx.fill();
    ctx.fillStyle = `rgba(190,120,255,${p})`;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-2, -26); ctx.lineTo(3, 0); ctx.fill();
    const g = ctx.createRadialGradient(0, -18, 2, 0, -18, 34);
    g.addColorStop(0, `rgba(170,90,255,${p * 0.4})`); g.addColorStop(1, 'rgba(170,90,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -18, 34, 0, TAU); ctx.fill();
    ctx.restore();
  },
  gate(ctx, open, t) {
    // ancient door
    ctx.fillStyle = '#3a3245';
    ctx.fillRect(-56, -150, 112, 150);
    ctx.fillStyle = '#2a2435';
    ctx.fillRect(-44, -138, 88, 138);
    if (!open) {
      ctx.fillStyle = '#453b5c';
      ctx.fillRect(-40, -134, 38, 134); ctx.fillRect(2, -134, 38, 134);
      ctx.strokeStyle = `rgba(255,180,80,${0.5 + Math.sin((t || 0) * 2) * 0.2})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -70, 22, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -92); ctx.lineTo(0, -48); ctx.moveTo(-22, -70); ctx.lineTo(22, -70); ctx.stroke();
    } else {
      ctx.fillStyle = '#0d0b16'; ctx.fillRect(-40, -134, 80, 134);
      const g = ctx.createLinearGradient(0, -134, 0, 0);
      g.addColorStop(0, 'rgba(150,70,255,0.25)'); g.addColorStop(1, 'rgba(150,70,255,0)');
      ctx.fillStyle = g; ctx.fillRect(-40, -134, 80, 134);
    }
  },
  foodStall(ctx, seed, corrupted) {
    const rng = makeRng(seed);
    ctx.fillStyle = corrupted ? '#26222f' : '#8a5a34';
    ctx.fillRect(-40, -46, 80, 46);
    ctx.fillStyle = corrupted ? '#1a1724' : '#a06a3e'; ctx.fillRect(-44, -50, 88, 6);
    // umbrella
    ctx.fillStyle = corrupted ? '#221e2c' : ['#e74c3c', '#f1c40f', '#16a085'][Math.floor(rng() * 3)];
    ctx.beginPath(); ctx.moveTo(-52, -78); ctx.quadraticCurveTo(0, -110, 52, -78); ctx.lineTo(46, -72); ctx.quadraticCurveTo(0, -98, -46, -72); ctx.fill();
    ctx.strokeStyle = corrupted ? '#3a3548' : '#5c4230'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -96); ctx.lineTo(0, -50); ctx.stroke();
    if (!corrupted) {
      // food items
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = ['#f0c060', '#e67e22', '#fff5e0'][i % 3];
        ctx.beginPath(); ctx.arc(-28 + i * 14, -52, 5, 0, TAU); ctx.fill();
      }
      // steam
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10, -58); ctx.quadraticCurveTo(-14, -68, -10, -76); ctx.stroke();
    } else {
      ctx.save(); ctx.rotate(0.06); ctx.fillStyle = '#1c1926'; ctx.fillRect(-30, -44, 24, 8); ctx.restore();
    }
  },
  bench(ctx) {
    ctx.fillStyle = '#7a5c3a';
    ctx.fillRect(-30, -20, 60, 5); ctx.fillRect(-30, -34, 60, 4);
    ctx.fillStyle = '#5c4428';
    ctx.fillRect(-27, -16, 5, 16); ctx.fillRect(22, -16, 5, 16);
  },
  wires(ctx, w, t) {
    ctx.strokeStyle = 'rgba(20,18,20,0.75)'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath(); ctx.moveTo(-w / 2, k * 5);
      ctx.quadraticCurveTo(0, 18 + k * 6, w / 2, k * 5); ctx.stroke();
    }
  },
  fairyLights(ctx, w, t, off) {
    ctx.strokeStyle = 'rgba(40,30,20,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(0, 16, w / 2, 0); ctx.stroke();
    const n = Math.floor(w / 18);
    for (let i = 0; i <= n; i++) {
      const p = i / n, lx = -w / 2 + p * w;
      const ly = 16 * (1 - Math.pow(2 * p - 1, 2)) * 0.9 + 3;
      if (off) { ctx.fillStyle = '#33333d'; ctx.beginPath(); ctx.arc(lx, ly, 2, 0, TAU); ctx.fill(); continue; }
      const c = ['#ffd98a', '#ff8a5c', '#8affc1', '#8ac1ff', '#ff8ad0'][i % 5];
      const bl = 0.6 + Math.sin((t || 0) * 4 + i * 1.3) * 0.4;
      ctx.fillStyle = c; ctx.globalAlpha = bl;
      ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, TAU); ctx.fill();
      ctx.globalAlpha = bl * 0.35;
      ctx.beginPath(); ctx.arc(lx, ly, 6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  },
  carvingWall(ctx, seed, glow, t) {
    const rng = makeRng(seed);
    ctx.fillStyle = '#4a4238'; ctx.fillRect(-70, -110, 140, 110);
    ctx.fillStyle = '#3d362e'; ctx.fillRect(-70, -110, 140, 8);
    // carved panels telling the story
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = glow ? `rgba(255,180,80,${0.4 + Math.sin((t || 0) * 1.5 + i) * 0.2})` : '#2d2822';
      ctx.lineWidth = 2;
      const px = -50 + i * 40;
      ctx.strokeRect(px, -95, 32, 80);
      // stick figures / entity carving
      ctx.beginPath();
      if (i === 0) { // people worshipping
        ctx.arc(px + 8, -80, 4, 0, TAU); ctx.moveTo(px + 8, -76); ctx.lineTo(px + 8, -60);
        ctx.moveTo(px + 24, -78); ctx.arc(px + 22, -80, 4, 0, TAU); ctx.moveTo(px + 22, -76); ctx.lineTo(px + 22, -60);
      } else if (i === 1) { // tall entity
        ctx.moveTo(px + 16, -90); ctx.lineTo(px + 16, -50);
        ctx.moveTo(px + 6, -78); ctx.lineTo(px + 26, -78);
        ctx.arc(px + 16, -88, 5, 0, TAU);
      } else { // seal circle
        ctx.arc(px + 16, -55, 10, 0, TAU);
        ctx.moveTo(px + 16, -90); ctx.lineTo(px + 16, -65);
      }
      ctx.stroke();
    }
  },
};

// ============ PARTICLES ============
class Particles {
  constructor() { this.list = []; }
  emit(x, y, opts = {}) {
    const n = opts.n || 8;
    for (let i = 0; i < n; i++) {
      const a = opts.angle !== undefined ? opts.angle + rnd(-opts.spread || -0.5, opts.spread || 0.5) : rnd(TAU);
      const sp = rnd(opts.spMin || 1, opts.spMax || 4);
      this.list.push({
        x, y, vx: Math.cos(a) * sp + (opts.vx || 0), vy: Math.sin(a) * sp + (opts.vy || 0),
        life: 1, decay: rnd(opts.dMin || 0.02, opts.dMax || 0.05),
        size: rnd(opts.sMin || 2, opts.sMax || 5), color: opts.color || '#ffb340',
        grav: opts.grav || 0, glow: opts.glow, shape: opts.shape || 'circle',
      });
    }
  }
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.life -= p.decay;
      if (p.life <= 0) this.list.splice(i, 1);
    }
    if (this.list.length > 700) this.list.splice(0, this.list.length - 700);
  }
  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 8; }
      if (p.shape === 'petal') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.x * 0.05 + p.y * 0.03);
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, TAU); ctx.fill(); ctx.restore();
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - 1, p.size, 2);
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, TAU); ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
}

// ============ SCENE / PARALLAX RENDERER ============
// theme presets define sky, ambient, layers
const THEMES = {
  festivalDay: {
    sky: ['#8fc4e8', '#d9ebf5', '#f5e6c8'], sun: { x: 0.78, y: 0.16, c: '#fff6d8', r: 46 },
    hills: '#a8c49a', hills2: '#c4d4ae', amb: null, lampOn: false, lights: true, fog: null,
  },
  festivalEvening: {
    sky: ['#2a2a55', '#7a4a6a', '#e88a4a'], sun: { x: 0.2, y: 0.32, c: '#ffce8a', r: 40 },
    hills: '#3a3a55', hills2: '#4a4468', amb: 'rgba(255,150,60,0.06)', lampOn: true, lights: true, fog: null,
  },
  festivalNight: {
    sky: ['#0d1030', '#232048', '#3d2d55'], moon: { x: 0.75, y: 0.14 },
    hills: '#181830', hills2: '#232244', amb: 'rgba(255,170,80,0.05)', lampOn: true, lights: true, fog: null, stars: true,
  },
  stormNight: {
    sky: ['#0a0a18', '#1e1430', '#38204a'], moon: { x: 0.7, y: 0.12, dim: true },
    hills: '#100e20', hills2: '#1a1732', amb: 'rgba(120,60,200,0.06)', lampOn: true, flicker: true, lights: true, fog: 'rgba(80,50,130,0.12)', stars: false, storm: true,
  },
  corrupted: {
    sky: ['#070510', '#160e26', '#2a1440'], moon: { x: 0.72, y: 0.13, dim: true },
    hills: '#0d0a18', hills2: '#161228', amb: 'rgba(120,60,200,0.09)', lampOn: false, lights: false, fog: 'rgba(100,60,170,0.16)', corrupted: true, cracks: true,
  },
  forest: {
    sky: ['#0c1424', '#1a2c40', '#2c4258'], moon: { x: 0.6, y: 0.1 },
    hills: '#101c28', hills2: '#1a2a38', amb: 'rgba(60,120,160,0.05)', lampOn: false, fog: 'rgba(140,180,200,0.1)', forest: true, stars: true,
  },
  temple: {
    sky: ['#140f20', '#2c1e35', '#4a3048'], moon: { x: 0.8, y: 0.15 },
    hills: '#1e1626', hills2: '#2c2038', amb: 'rgba(255,170,80,0.07)', lampOn: false, templeLamps: true, fog: 'rgba(60,40,80,0.08)', stars: true,
  },
  citadel: {
    sky: ['#0a0512', '#1e0a2c', '#3d1050'], amb: 'rgba(160,60,255,0.1)',
    hills: '#120820', hills2: '#1e1030', fog: 'rgba(120,50,200,0.18)', corrupted: true, citadel: true, debris: true,
  },
  dawn: {
    sky: ['#4a5a8a', '#c98a6a', '#f5d0a0'], sun: { x: 0.5, y: 0.4, c: '#fff0d0', r: 60 },
    hills: '#6a6a8a', hills2: '#8a8aa5', amb: 'rgba(255,200,140,0.08)', lampOn: false, lights: true,
  },
};

class Scene {
  constructor(def) {
    this.def = def;
    this.theme = THEMES[def.theme] || THEMES.festivalNight;
    this.width = def.width;
    this.props = def.props || [];      // {type, x, layer(0 bg,1 mid,2 game,3 fg), seed, ...}
    this.platforms = def.platforms;    // {x,y,w,h, oneway}
    this.groundY = def.groundY || 620;
    this.t = 0;
    this.rng = makeRng(def.seed || 7);
    // pre-roll deterministic bg building strip
    this.bgStrip = [];
    let bx = -200;
    const r2 = makeRng((def.seed || 7) * 31);
    while (bx < this.width + 400) {
      this.bgStrip.push({ x: bx, w: 90 + r2() * 120, h: 90 + r2() * 160, v: r2() });
      bx += 100 + r2() * 140;
    }
  }
  update(dt) { this.t += dt; }

  drawSky(ctx, camX) {
    const th = this.theme;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars
    if (th.stars) {
      const r3 = makeRng(99);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 90; i++) {
        const sx = (r3() * W * 2 - camX * 0.05) % W, sy = r3() * H * 0.5;
        ctx.globalAlpha = 0.25 + Math.sin(this.t * 2 + i) * 0.2;
        ctx.fillRect((sx + W) % W, sy, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    }
    if (th.sun) {
      const s = th.sun;
      const gg = ctx.createRadialGradient(W * s.x, H * s.y, 4, W * s.x, H * s.y, s.r * 3);
      gg.addColorStop(0, s.c); gg.addColorStop(0.35, s.c + '66'); gg.addColorStop(1, s.c + '00');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(W * s.x, H * s.y, s.r * 3, 0, TAU); ctx.fill();
      ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(W * s.x, H * s.y, s.r, 0, TAU); ctx.fill();
    }
    if (th.moon) {
      const m = th.moon;
      ctx.fillStyle = m.dim ? '#8a86a0' : '#e8e4d8';
      ctx.beginPath(); ctx.arc(W * m.x, H * m.y, 30, 0, TAU); ctx.fill();
      ctx.fillStyle = m.dim ? '#78748c' : '#d0ccc0';
      ctx.beginPath(); ctx.arc(W * m.x - 9, H * m.y - 5, 6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(W * m.x + 8, H * m.y + 9, 4, 0, TAU); ctx.fill();
      if (!m.dim) {
        const gg = ctx.createRadialGradient(W * m.x, H * m.y, 20, W * m.x, H * m.y, 90);
        gg.addColorStop(0, 'rgba(220,220,240,0.18)'); gg.addColorStop(1, 'rgba(220,220,240,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(W * m.x, H * m.y, 90, 0, TAU); ctx.fill();
      }
    }
    if (th.storm) {
      // roiling cloud vortex over temple direction
      for (let i = 0; i < 5; i++) {
        const a = this.t * 0.3 + i * 1.3;
        ctx.fillStyle = `rgba(40,20,70,${0.3 - i * 0.04})`;
        ctx.beginPath();
        ctx.ellipse(W * 0.5 + Math.cos(a) * (40 + i * 30), H * 0.18 + Math.sin(a) * (14 + i * 8), 130 - i * 12, 34, Math.sin(a) * 0.2, 0, TAU);
        ctx.fill();
      }
      if (Math.sin(this.t * 7.3) > 0.985) { ctx.fillStyle = 'rgba(190,150,255,0.22)'; ctx.fillRect(0, 0, W, H); }
    }
    if (th.citadel) {
      // floating debris in sky
      const r4 = makeRng(55);
      for (let i = 0; i < 10; i++) {
        const dx = (r4() * this.width - camX * 0.2) % (W + 200) - 100;
        const dy = 60 + r4() * 220 + Math.sin(this.t * 0.8 + i) * 12;
        const ds = 8 + r4() * 26;
        ctx.fillStyle = '#241838';
        ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + ds, dy - ds * 0.4); ctx.lineTo(dx + ds * 1.3, dy + ds * 0.5); ctx.lineTo(dx + ds * 0.3, dy + ds * 0.7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(160,80,255,${0.25 + Math.sin(this.t + i) * 0.1})`;
        ctx.fillRect(dx + ds * 0.3, dy + ds * 0.2, ds * 0.5, 2);
      }
    }
  }

  drawHills(ctx, camX) {
    const th = this.theme;
    // far hills (parallax 0.1)
    ctx.fillStyle = th.hills2;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 40; x += 40) {
      const wx = x + camX * 0.1;
      ctx.lineTo(x, H * 0.62 - Math.sin(wx * 0.004) * 60 - Math.cos(wx * 0.011) * 24);
    }
    ctx.lineTo(W, H); ctx.fill();
    ctx.fillStyle = th.hills;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 40; x += 40) {
      const wx = x + camX * 0.22;
      ctx.lineTo(x, H * 0.72 - Math.sin(wx * 0.006 + 3) * 45 - Math.cos(wx * 0.013) * 18);
    }
    ctx.lineTo(W, H); ctx.fill();
    // distant temple silhouette on hill (story landmark)
    if (this.def.distantTemple !== false) {
      const tx = (this.def.templeX !== undefined ? this.def.templeX : this.width * 0.85) - camX * 0.22;
      if (tx > -200 && tx < W + 200) {
        ctx.save(); ctx.translate(tx, H * 0.72 - Math.sin((tx + camX * 0.22) * 0.006 + 3) * 45 + 6);
        ctx.scale(0.55, 0.55); ctx.globalAlpha = 0.85;
        Props.temple(ctx, 3, 1, th.corrupted || th.storm);
        if (th.storm || th.corrupted) {
          // energy beam
          ctx.strokeStyle = `rgba(160,80,255,${0.4 + Math.sin(this.t * 3) * 0.2})`;
          ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, -720); ctx.stroke();
        }
        ctx.restore(); ctx.globalAlpha = 1;
      }
    }
  }

  drawMidBuildings(ctx, camX) {
    const th = this.theme;
    if (this.def.noMidStrip) return;
    for (const b of this.bgStrip) {
      const sx = b.x - camX * 0.5;
      if (sx < -250 || sx > W + 250) continue;
      ctx.fillStyle = th.corrupted ? '#151021' : (th.sun ? '#b09a80' : '#2a2540');
      ctx.fillRect(sx, H * 0.86 - b.h, b.w, b.h);
      ctx.fillStyle = th.corrupted ? '#0f0b1a' : (th.sun ? '#98836b' : '#221e36');
      ctx.fillRect(sx, H * 0.86 - b.h, b.w * 0.22, b.h);
      // windows
      const r5 = makeRng(b.x);
      for (let wy = H * 0.86 - b.h + 16; wy < H * 0.86 - 20; wy += 26) {
        for (let wx = sx + 10; wx < sx + b.w - 14; wx += 22) {
          if (r5() < 0.55) {
            ctx.fillStyle = th.lights && !th.corrupted ? (r5() < 0.7 ? 'rgba(255,210,130,0.75)' : 'rgba(120,140,170,0.3)') : 'rgba(40,36,60,0.8)';
            ctx.fillRect(wx, wy, 8, 11);
          }
        }
      }
    }
  }

  drawProps(ctx, camX, camY, layer) {
    for (const p of this.props) {
      if ((p.layer || 2) !== layer) continue;
      const par = layer === 0 ? 0.5 : layer === 1 ? 0.8 : layer === 3 ? 1.25 : 1;
      const sx = p.x - camX * par;
      if (sx < -400 || sx > W + 400) continue;
      const sy = (p.y !== undefined ? p.y : this.groundY) - camY;
      ctx.save(); ctx.translate(sx, sy);
      if (p.scale) ctx.scale(p.scale, p.scale);
      if (p.flip) ctx.scale(-1, 1);
      if (layer === 0) ctx.globalAlpha = 0.85;
      const th = this.theme;
      const cor = p.corrupted !== undefined ? p.corrupted : th.corrupted;
      switch (p.type) {
        case 'house': Props.house(ctx, p.seed || 1, cor); break;
        case 'shop': Props.shop(ctx, p.seed || 1, cor, p.label); break;
        case 'temple': Props.temple(ctx, p.seed || 1, p.scale2 || 1, cor); break;
        case 'idol': Props.ganeshIdolLarge(ctx, p.s || 1, cor ? 0 : 1); break;
        case 'idolSmall': Props.ganeshIdolSmall(ctx, 0, 0, p.s || 1); break;
        case 'stage': Props.festivalStage(ctx, this.t); break;
        case 'banner': Props.banner(ctx, p.w || 220, this.t, cor); break;
        case 'rangoli': Props.rangoli(ctx, p.s || 1); break;
        case 'diya': Props.diya(ctx, this.t + (p.seed || 0)); break;
        case 'lamp': Props.streetLamp(ctx, th.lampOn && (!th.flicker || Math.sin(this.t * 13 + p.x) > -0.7), cor); break;
        case 'tree': Props.tree(ctx, p.seed || 1, cor || th.forest); break;
        case 'auto': Props.autoRickshaw(ctx, cor); break;
        case 'drums': Props.drumSet(ctx); break;
        case 'pillar': Props.brokenPillar(ctx, p.seed || 1); break;
        case 'seal': Props.ancientSeal(ctx, this.t, p.broken); break;
        case 'shrine': Props.shrine(ctx, p.seed || 1, cor); break;
        case 'rock': Props.rock(ctx, p.seed || 1); break;
        case 'crystal': Props.corruptCrystal(ctx, this.t + (p.seed || 0), p.s || 1); break;
        case 'gate': Props.gate(ctx, p.open, this.t); break;
        case 'stall': Props.foodStall(ctx, p.seed || 1, cor); break;
        case 'bench': Props.bench(ctx); break;
        case 'wires': Props.wires(ctx, p.w || 300, this.t); break;
        case 'lights': Props.fairyLights(ctx, p.w || 300, this.t, cor || !th.lights); break;
        case 'carving': Props.carvingWall(ctx, p.seed || 1, p.glow, this.t); break;
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }

  drawGround(ctx, camX, camY) {
    const th = this.theme;
    // platforms
    for (const pf of this.platforms) {
      const sx = pf.x - camX, sy = pf.y - camY;
      if (sx + pf.w < -50 || sx > W + 50) continue;
      if (pf.invisible) continue;
      if (pf.ground) {
        // road / earth
        ctx.fillStyle = th.corrupted ? '#1c1826' : th.forest ? '#2c3524' : '#4a4448';
        ctx.fillRect(sx, sy, pf.w, pf.h);
        ctx.fillStyle = th.corrupted ? '#252032' : th.forest ? '#38442c' : '#5a5458';
        ctx.fillRect(sx, sy, pf.w, 9);
        if (!th.corrupted && !th.forest) {
          // road center dashes
          ctx.fillStyle = 'rgba(230,220,190,0.35)';
          for (let dx2 = sx % 70; dx2 < pf.w; dx2 += 70) {
            if (dx2 >= 0) ctx.fillRect(sx + dx2, sy + 26, 34, 4);
          }
        }
        if (th.cracks || th.corrupted) {
          const r6 = makeRng(pf.x);
          ctx.strokeStyle = `rgba(150,70,255,${0.4 + Math.sin(this.t * 2) * 0.15})`; ctx.lineWidth = 2;
          for (let cx2 = 60; cx2 < pf.w; cx2 += 170 + r6() * 80) {
            ctx.beginPath(); ctx.moveTo(sx + cx2, sy);
            ctx.lineTo(sx + cx2 + 12, sy + 14); ctx.lineTo(sx + cx2 - 4, sy + 26); ctx.stroke();
          }
        }
      } else {
        // floating/structural platform
        ctx.fillStyle = th.corrupted ? '#2c2440' : th.forest ? '#4a3a26' : '#6a5c48';
        rr(ctx, sx, sy, pf.w, pf.h, 5); ctx.fill();
        ctx.fillStyle = th.corrupted ? '#3d3255' : th.forest ? '#5c4a30' : '#7d6e56';
        rr(ctx, sx, sy, pf.w, 6, 3); ctx.fill();
        if (th.corrupted) {
          ctx.fillStyle = `rgba(160,80,255,${0.3 + Math.sin(this.t * 2.4 + pf.x) * 0.14})`;
          ctx.fillRect(sx + 4, sy + pf.h - 3, pf.w - 8, 2);
        }
      }
    }
  }

  drawFog(ctx, camX) {
    const th = this.theme;
    if (th.fog) {
      for (let i = 0; i < 3; i++) {
        const fx = ((this.t * 12 * (i + 1) + i * 400 - camX * (0.3 + i * 0.2)) % (W + 500)) - 250;
        ctx.fillStyle = th.fog;
        ctx.beginPath(); ctx.ellipse(fx, H - 90 - i * 45, 260, 55, 0, 0, TAU); ctx.fill();
      }
    }
    if (th.amb) { ctx.fillStyle = th.amb; ctx.fillRect(0, 0, W, H); }
  }
}
