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
};
