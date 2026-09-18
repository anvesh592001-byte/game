// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — sprite.js
// Image-sprite character animation. Uses the generated 8-pose
// sprite sheets (chroma-keyed to alpha) and animates them with
// real motion principles: stride swapping, bob, lean, squash &
// stretch, anticipation lunge, landing recovery.
// Cells: 0 idle | 1 walkL | 2 walkR | 3 run | 4 jump | 5 attack
//        6 hurt | 7 victory
// Falls back silently to the vector rig while sheets load.
// ============================================================
'use strict';

const SpriteArt = {
  // draw hero sprite in local space (feet at 0,0, facing right default)
  // st: {pose, t, vx, vy, facing, attackT, powered, hurtT}
  hero(ctx, id, st) {
    if (typeof IMG === 'undefined' || typeof SPRITE_META === 'undefined') return false;
    const img = IMG.get('sprites_' + id);
    const meta = SPRITE_META[id];
    if (!img || !meta) return false;

    const C = CHARS[id];
    const t = st.t || 0;
    const pose = st.pose || 'idle';
    const spd = Math.abs(st.vx || 0);

    // ---- choose cell + motion params ----
    let cell = 0, rot = 0, bob = 0, sqx = 1, sqy = 1, dx = 0;
    switch (pose) {
      case 'idle': {
        cell = 0;
        const br = Math.sin(t * 2.1);
        sqy = 1 + br * 0.012; sqx = 1 - br * 0.008;         // breathing
        if (id === 'arjun') { bob = Math.sin(t * 3.4) * 1.4; } // restless energy
        break;
      }
      case 'walk': {
        const phase = Math.sin(t * 9);
        cell = phase >= 0 ? 1 : 2;                            // stride swap
        bob = Math.abs(Math.cos(t * 9)) * 2.4;                // weight shift
        rot = phase * 0.022;
        break;
      }
      case 'run': {
        cell = 3;
        const c = Math.sin(t * 13);
        bob = Math.abs(Math.cos(t * 13)) * 3.6;
        rot = 0.05 + c * 0.03;                                // forward lean + cycle
        sqy = 1 + Math.abs(c) * 0.02;
        break;
      }
      case 'jump': {
        cell = 4;
        const vy = st.vy || 0;
        rot = clamp(vy * 0.012, -0.16, 0.22);                 // tilt by arc
        if (vy < -2) { sqy = 1.05; sqx = 0.96; }              // stretch going up
        else if (vy > 4) { sqy = 1.07; sqx = 0.95; }          // stretch falling
        break;
      }
      case 'attack': case 'smash': case 'cast': {
        cell = 5;
        const a = clamp(st.attackT || 0, 0, 1);
        if (a < 0.3) {                                        // anticipation: coil back
          const k = a / 0.3;
          dx = -6 * k; rot = -0.05 * k; sqx = 1 - 0.05 * k; sqy = 1 + 0.03 * k;
        } else {                                              // strike: lunge + follow-through
          const k = Math.min(1, (a - 0.3) / 0.4);
          dx = -6 + easeOut(k) * (pose === 'smash' ? 10 : 16);
          rot = -0.05 + easeOut(k) * 0.1;
          sqx = 0.95 + easeOut(k) * 0.13; sqy = 1.03 - easeOut(k) * 0.06;
        }
        break;
      }
      case 'dash': {
        cell = 3;
        rot = 0.16; sqx = 1.18; sqy = 0.9;                    // speed stretch
        break;
      }
      case 'hurt': {
        cell = 6; rot = -0.06; dx = -3;
        break;
      }
      case 'victory': {
        cell = 7;
        bob = Math.abs(Math.sin(t * 3)) * 3;
        sqy = 1 + Math.sin(t * 3) * 0.02;
        break;
      }
      case 'kneel': case 'sit': {
        cell = 6; sqy = 0.72; sqx = 1.08; rot = pose === 'kneel' ? 0.08 : 0;
        break;
      }
      default: cell = 0;
    }

    const cd = meta.cells[cell];
    // target on-screen height, scaled to character bible heights
    const targetH = C.height * 1.32;
    const s = targetH / cd.h;
    const dw = cd.w * s * sqx, dh = cd.h * s * sqy;

    ctx.save();
    if (st.facing === -1) ctx.scale(-1, 1);
    ctx.rotate(rot);

    // powered divine aura behind the art
    if (st.powered) {
      const g = ctx.createRadialGradient(0, -dh * 0.5, dh * 0.1, 0, -dh * 0.5, dh * 0.72);
      g.addColorStop(0, C.aura + '4d'); g.addColorStop(1, C.aura + '00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, -dh * 0.5, dw * 0.85, dh * 0.68, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const fx = Math.sin(t * 3 + i * 2.4) * dw * 0.42;
        const fy = -((t * 44 + i * 41) % (dh * 0.92));
        ctx.fillStyle = C.aura + '3d';
        ctx.beginPath(); ctx.ellipse(fx, fy - dh * 0.06, 3, 8, 0, 0, TAU); ctx.fill();
      }
    }
    // hurt flash tint
    if (pose === 'hurt') {
      ctx.filter = 'brightness(1.35) saturate(1.2)';
    }
    ctx.drawImage(img, cd.x, cd.y, cd.w, cd.h, -dw / 2 + dx, -dh - bob, dw, dh);
    ctx.filter = 'none';

    // glow on striking hand during powered attacks
    if (st.powered && cell === 5 && (st.attackT || 0) > 0.3) {
      const k = Math.min(1, ((st.attackT || 0) - 0.3) / 0.4);
      const hx = dw * 0.42 + dx, hy = -dh * 0.55;
      const g2 = ctx.createRadialGradient(hx, hy, 2, hx, hy, 20 + k * 10);
      g2.addColorStop(0, C.auraCore); g2.addColorStop(0.5, C.aura + 'bb'); g2.addColorStop(1, C.aura + '00');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(hx, hy, 20 + k * 10, 0, TAU); ctx.fill();
    }
    ctx.restore();
    return true;
  },
  // ---- villain keyframe animation ----
  // Cells: 0 idle | 1 strideL | 2 strideR | 3 hover | 4 charge | 5 blast | 6 hurt | 7 defeat
  // Sheets face LEFT (toward the player's usual approach).
  vyo(ctx, form, st) {
    if (typeof IMG === 'undefined' || typeof SPRITE_META === 'undefined') return false;
    const key = form === 2 ? 'kf_vyomasuraUnbound' : 'kf_vyomasura';
    const metaKey = form === 2 ? 'vyomasuraUnbound' : 'vyomasura';
    const img = IMG.get(key);
    const meta = SPRITE_META[metaKey];
    if (!img || !meta) return false;

    const t = st.t || 0;
    const pose = st.pose || 'idle';
    let cell = 0, rot = 0, bob = 0, sqx = 1, sqy = 1, dx = 0;
    switch (pose) {
      case 'idle': {
        cell = form === 2 ? 3 : 0;
        bob = Math.sin(t * 1.7) * (form === 2 ? 7 : 3);       // slow menacing float
        sqy = 1 + Math.sin(t * 1.7) * 0.008;
        break;
      }
      case 'move': case 'walk': {
        if (form === 2) { cell = 1; bob = Math.sin(t * 4) * 6; rot = 0.03; }
        else {
          const ph = Math.sin(t * 5.2);
          cell = ph >= 0 ? 1 : 2;                              // stride swap
          bob = Math.abs(Math.cos(t * 5.2)) * 3;
          rot = ph * 0.015;
        }
        break;
      }
      case 'cast': case 'summon': case 'barrage': {
        const a = clamp(st.attackT || 0, 0, 1);
        if (a < 0.45) {                                        // charge up
          cell = 4;
          bob = a * -8;                                        // lifts while charging
          sqy = 1 + a * 0.04;
        } else {                                               // release
          cell = 5;
          const k = Math.min(1, (a - 0.45) / 0.3);
          dx = easeOut(k) * -14;                               // recoil into blast (faces left)
          rot = -easeOut(k) * 0.04;
          sqx = 1 + easeOut(k) * 0.08;
        }
        break;
      }
      case 'attack': case 'smash': {
        const a = clamp(st.attackT || 0, 0, 1);
        if (a < 0.35) { cell = 4; dx = 6 * (a / 0.35); rot = 0.05 * (a / 0.35); }
        else {
          cell = 5;
          const k = Math.min(1, (a - 0.35) / 0.35);
          dx = 6 - easeOut(k) * 22; rot = 0.05 - easeOut(k) * 0.1;
          sqx = 1 + easeOut(k) * 0.1; sqy = 1 - easeOut(k) * 0.05;
        }
        break;
      }
      case 'hurt': { cell = 6; rot = 0.05; dx = 6; break; }
      case 'die': case 'kneel': case 'defeat': { cell = 7; bob = 0; break; }
      case 'rise': {
        cell = form === 2 ? 2 : 3;                             // rising pose
        bob = Math.sin(t * 2.2) * 4;
        break;
      }
      default: cell = 0;
    }

    const cd = meta.cells[cell];
    const targetH = (st.h || 210) * 1.18 * (form === 2 ? 1.12 : 1);
    const s = targetH / cd.h;
    const dw = cd.w * s * sqx, dh = cd.h * s * sqy;

    ctx.save();
    // sheets face LEFT; game facing=-1 means facing left => no flip. facing=1 => flip.
    if ((st.facing || -1) === 1) ctx.scale(-1, 1);
    ctx.rotate(rot);

    // dark aura + ground shadow mist
    const auraC = form === 2 ? '#ff3050' : '#a05fff';
    const g = ctx.createRadialGradient(0, -dh * 0.5, dh * 0.1, 0, -dh * 0.5, dh * 0.75);
    g.addColorStop(0, auraC + '26'); g.addColorStop(1, auraC + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, -dh * 0.5, dw * 0.95, dh * 0.7, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const fx = Math.sin(t * 2.2 + i * 2.1) * dw * 0.5;
      const fy = -((t * 30 + i * 47) % (dh * 0.95));
      ctx.fillStyle = auraC + '30';
      ctx.beginPath(); ctx.ellipse(fx, fy - dh * 0.04, 3.5, 9, 0, 0, TAU); ctx.fill();
    }
    if (pose === 'hurt') ctx.filter = 'brightness(1.4)';
    ctx.drawImage(img, cd.x, cd.y, cd.w, cd.h, -dw / 2 + dx, -dh - bob, dw, dh);
    ctx.filter = 'none';

    // charge orb glow enhancement
    if ((pose === 'cast' || pose === 'summon' || pose === 'barrage') && (st.attackT || 0) < 0.45) {
      const a = (st.attackT || 0) / 0.45;
      const ox = -dw * 0.22, oy = -dh * 0.92 - bob;
      const g2 = ctx.createRadialGradient(ox, oy, 2, ox, oy, 14 + a * 26);
      g2.addColorStop(0, '#efe0ff'); g2.addColorStop(0.4, auraC + 'cc'); g2.addColorStop(1, auraC + '00');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(ox, oy, 14 + a * 26, 0, TAU); ctx.fill();
    }
    ctx.restore();
    return true;
  },
};
