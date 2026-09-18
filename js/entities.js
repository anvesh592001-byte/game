// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — entities.js
// Player, companion AI, enemies, bosses, projectiles, combat.
// ============================================================
'use strict';

const GRAV = 0.62;

// ---------------- BASE ----------------
class Actor {
  constructor(x, y) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.w = 30; this.h = 90; this.facing = 1; this.grounded = false;
    this.hp = 100; this.maxHp = 100; this.dead = false;
    this.t = rnd(10); this.hurtT = 0; this.blinkT = rnd(3);
  }
  physics(level) {
    this.vy += GRAV;
    if (this.vy > 18) this.vy = 18;
    this.x += this.vx;
    this.y += this.vy;
    this.grounded = false;
    for (const pf of level.scene.platforms) {
      if (this.x + this.w / 2 < pf.x || this.x - this.w / 2 > pf.x + pf.w) continue;
      // land on top
      if (this.vy >= 0 && this.y >= pf.y && this.y - this.vy <= pf.y + 12) {
        if (pf.oneway && this.dropT > 0) continue;
        this.y = pf.y; this.vy = 0; this.grounded = true;
      }
      // side walls for solid platforms
      if (!pf.oneway && !pf.ground && this.y > pf.y + 6 && this.y - this.h * 0.7 < pf.y + pf.h) {
        if (this.x > pf.x && this.x < pf.x + pf.w / 2 && this.x - this.vx <= pf.x) { this.x = pf.x - 0.1; }
        else if (this.x < pf.x + pf.w && this.x > pf.x + pf.w / 2 && this.x - this.vx >= pf.x + pf.w) { this.x = pf.x + pf.w + 0.1; }
      }
    }
    this.x = clamp(this.x, 20, level.scene.width - 20);
    if (this.y > H + 260) { this.hp = 0; this.y = H + 260; }
    if (this.dropT > 0) this.dropT--;
  }
  hitBy(dmg, kx, level) {
    if (this.dead || this.iT > 0) return false;
    this.hp -= dmg; this.hurtT = 0.28;
    this.vx += kx; this.vy -= 3;
    return true;
  }
}

// ---------------- PLAYER ----------------
class Player extends Actor {
  constructor(id, x, y) {
    super(x, y);
    this.id = id; this.C = CHARS[id];
    const up = SaveSys.data.upgrades;
    this.maxHp = this.C.hp + up.health * 25;
    this.hp = this.maxHp;
    this.maxEn = 100 + up.energy * 25;
    this.en = this.maxEn;
    this.ultCharge = 0;
    this.speed = this.C.speed * (1 + up.speed * 0.08);
    this.dmg = this.C.dmg * (1 + up.power * 0.2);
    this.pose = 'idle'; this.attackT = -1; this.attackKind = null;
    this.combo = 0; this.comboT = 0;
    this.dashT = -1; this.dashCd = 0; this.iT = 0;
    this.jumps = 0; this.emotion = 'neutral';
    this.powered = SaveSys.data.level >= 7; // powers awaken at seal break
    this.ultT = -1; this.dropT = 0; this.shieldT = 0;
    this.specialCd = 0; this.hitstop = 0;
  }
  update(level, dt) {
    this.t += dt;
    this.blinkT -= dt; if (this.blinkT < 0) this.blinkT = rnd(2, 4.5);
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.iT > 0) this.iT -= dt;
    if (this.shieldT > 0) this.shieldT -= dt;
    if (this.specialCd > 0) this.specialCd -= dt;
    if (this.dashCd > 0) this.dashCd -= dt;
    if (this.comboT > 0) { this.comboT -= dt; } else this.combo = 0;
    this.en = Math.min(this.maxEn, this.en + dt * 9);

    const locked = level.game.cine.active || level.game.state !== 'play' || this.dead;
    let mx = 0;
    if (!locked) {
      if (Input.down('left')) mx = -1;
      if (Input.down('right')) mx = 1;
    }

    // ---- ULT ----
    if (this.ultT >= 0) {
      this.ultT += dt;
      this.doUlt(level);
      if (this.ultT > this.ultDur) this.ultT = -1;
    }

    // ---- DASH ----
    if (this.dashT >= 0) {
      this.dashT += dt;
      this.vx = this.facing * 13;
      this.pose = 'dash'; this.iT = Math.max(this.iT, 0.05);
      if (this.dashT > 0.22) { this.dashT = -1; this.vx *= 0.4; }
      level.parts.emit(this.x, this.y - 40, { n: 2, color: this.powered ? this.C.aura : '#c9c2b5', dMin: 0.05, dMax: 0.1, sMin: 2, sMax: 5, glow: this.powered });
    } else if (this.attackT >= 0) {
      // ---- ATTACK STATE ----
      this.attackT += dt * (this.attackKind === 'smash' ? 2.2 : 3.4);
      this.pose = this.attackKind === 'cast' ? 'cast' : this.attackKind === 'smash' ? 'smash' : 'attack';
      this.vx *= 0.82;
      const aT = this.attackT;
      if (!this.didHit && aT > 0.38) {
        this.didHit = true;
        this.applyAttack(level);
      }
      if (aT >= 1) { this.attackT = -1; this.didHit = false; }
    } else if (!locked) {
      // ---- MOVEMENT ----
      this.vx = lerp(this.vx, mx * this.speed * (this.grounded ? 1 : 0.95), this.grounded ? 0.4 : 0.15);
      if (mx) this.facing = mx;
      if (Input.hit('jump')) {
        if (this.grounded) { this.vy = -this.C.jump; this.jumps = 1; Audio2.sfx('jump'); level.parts.emit(this.x, this.y, { n: 5, color: '#cfc8ba', vy: -1, dMin: 0.05, dMax: 0.09, sMin: 1, sMax: 3 }); }
        else if (this.C.doubleJump && this.jumps === 1) { this.vy = -this.C.jump * 0.92; this.jumps = 2; Audio2.sfx('jump'); level.parts.emit(this.x, this.y - 20, { n: 8, color: this.C.aura, glow: true, dMin: 0.04, dMax: 0.08 }); }
      }
      if (Input.down('down') && this.grounded && Input.hit('jump')) this.dropT = 10;
      if (Input.hit('down') && !this.grounded) this.vy = Math.max(this.vy, 8);
      if (Input.hit('dash') && this.dashCd <= 0) {
        this.dashT = 0; this.dashCd = 0.65; Audio2.sfx('dash');
      }
      if (Input.hit('attack')) this.startAttack(level, 'basic');
      if (Input.hit('special') && this.specialCd <= 0 && this.en >= 25 && this.powered) this.startAttack(level, 'special');
      if (Input.hit('ultimate') && this.ultCharge >= 100 && this.powered && this.ultT < 0) this.startUlt(level);

      // pose
      const wasGrounded = this.wasGrounded;
      if (!this.grounded) this.pose = 'jump';
      else if (Math.abs(this.vx) > this.speed * 0.72) this.pose = 'run';
      else if (Math.abs(this.vx) > 0.4) this.pose = 'walk';
      else this.pose = 'idle';
      if (this.grounded && !wasGrounded && this.vy >= 0) { Audio2.sfx('land'); this.jumps = 0; }
      if (this.hurtT > 0.1) this.pose = 'hurt';
    } else {
      this.vx *= 0.8;
      if (!level.game.cine.active) this.pose = this.grounded ? 'idle' : 'jump';
    }
    this.wasGrounded = this.grounded;
    this.physics(level);

    // emotion from context
    if (this.hurtT > 0) this.emotion = 'pain';
    else if (level.bossActive) this.emotion = 'determined';
    else if (level.enemies.some(e => !e.dead && Math.abs(e.x - this.x) < 400)) this.emotion = 'determined';
    else this.emotion = level.mood || 'neutral';

    if (this.hp <= 0 && !this.dead) {
      this.dead = true; this.pose = 'kneel'; Audio2.sfx('hurt');
      level.game.onPlayerDeath();
    }
  }
  startAttack(level, kind) {
    this.attackT = 0; this.didHit = false;
    if (kind === 'special') {
      this.en -= 25; this.specialCd = 1.1;
      this.attackKind = this.id === 'kiran' ? 'smash' : this.id === 'ravi' ? 'cast' : this.id === 'arjun' ? 'basic' : 'smash';
      if (this.id === 'arjun') { this.dashT = 0; this.attackT = -1; this.spinHit = true; Audio2.sfx('dash'); return; }
      Audio2.sfx('power');
    } else {
      this.attackKind = this.C.ranged ? 'cast' : 'basic';
      this.combo = (this.combo + 1) % 3; this.comboT = 0.9;
      Audio2.sfx('attack');
    }
  }
  applyAttack(level) {
    const special = this.attackKind === 'smash' || (this.attackKind === 'cast' && this.specialCd > 0.9);
    if (this.C.ranged) {
      // Ravi: projectile
      const explosive = this.attackKind === 'cast' && this.specialCd > 0;
      level.projectiles.push(new Proj(this.x + this.facing * 24, this.y - 58, this.facing * 9.5, 0,
        { friendly: true, dmg: this.dmg * (explosive && this.specialCd > 0.9 ? 2.2 : 1), color: this.C.aura, explosive: explosive && this.specialCd > 0.9, r: 7 }));
      Audio2.sfx('projectile');
      return;
    }
    // melee arc
    const range = this.C.atkRange * (special ? 1.5 : 1);
    const dmg = this.dmg * (special ? 2.4 : 1 + this.combo * 0.15);
    let hitAny = false;
    for (const e of level.enemies) {
      if (e.dead) continue;
      const dx = e.x - this.x;
      if (Math.abs(e.y - this.y) < 110 && ((special && this.id === 'kiran') ? Math.abs(dx) < range : (dx * this.facing > -14 && Math.abs(dx) < range))) {
        e.hitBy(dmg, this.facing * (special ? 9 : 4), level);
        hitAny = true;
        this.onDealHit(e, level);
      }
    }
    if (level.boss && !level.boss.dead) {
      const dx = level.boss.x - this.x;
      if (Math.abs(level.boss.y - this.y) < 170 && Math.abs(dx) < range + level.boss.w / 2 && (special || dx * this.facing > -20)) {
        level.boss.hitBy(dmg, this.facing * 2, level);
        hitAny = true; this.onDealHit(level.boss, level);
      }
    }
    if (special) {
      Audio2.sfx('explode');
      level.shake(this.id === 'kiran' ? 9 : 6);
      level.parts.emit(this.x + this.facing * 40, this.y - 10, { n: 22, color: this.C.aura, glow: true, spMax: 6, dMin: 0.03, dMax: 0.06, grav: 0.1 });
      if (this.id === 'aditya') {
        // shockwave projectile
        level.projectiles.push(new Proj(this.x + this.facing * 30, this.y - 30, this.facing * 7, 0, { friendly: true, dmg: this.dmg * 1.5, color: this.C.aura, r: 16, wave: true }));
      }
    }
    if (hitAny) {
      this.hitstop = 0.05; level.shake(special ? 7 : 3);
    }
  }
  onDealHit(e, level) {
    Audio2.sfx('hit');
    this.ultCharge = Math.min(100, this.ultCharge + (5 + SaveSys.data.upgrades.ultimate * 2));
    level.parts.emit(e.x, e.y - 50, { n: 9, color: this.C.aura, glow: true, spMax: 5, dMin: 0.04, dMax: 0.09 });
    level.spawnHitFlash(e.x, e.y - 50);
  }
  startUlt(level) {
    this.ultCharge = 0; this.ultT = 0;
    this.ultDur = this.id === 'arjun' ? 0.9 : 1.6;
    Audio2.sfx('ult');
    level.shake(10);
    level.flashT = 0.35;
    level.game.subtitle(this.C.name, {
      aditya: 'GANAPATI... NANNU NADIPINCHU!', arjun: 'THUNDER DASH raa!!',
      ravi: 'Divine Barrage. Calculated.', kiran: 'GAJA... SHAKTI!!'
    }[this.id], 1.6);
  }
  doUlt(level) {
    const T = this.ultT;
    if (this.id === 'aditya') {
      // expanding shockwave, shields allies
      if (!this.ultDone && T > 0.3) {
        this.ultDone = true;
        for (const e of level.enemies) if (!e.dead && Math.abs(e.x - this.x) < 420) { e.hitBy(this.dmg * 3.2, sign(e.x - this.x) * 12, level); this.onDealHit(e, level); }
        if (level.boss && !level.boss.dead && Math.abs(level.boss.x - this.x) < 420) { level.boss.hitBy(this.dmg * 3, 0, level); }
        for (const c of level.companions) c.shieldT = 5;
        this.shieldT = 5;
        level.shake(14);
      }
      this.pose = 'smash';
      level.parts.emit(this.x, this.y - 50, { n: 6, color: this.C.aura, glow: true, spMax: 8 });
    } else if (this.id === 'arjun') {
      this.vx = this.facing * 22; this.iT = 0.2; this.pose = 'dash';
      for (const e of level.enemies) {
        if (!e.dead && Math.abs(e.x - this.x) < 70 && Math.abs(e.y - this.y) < 110 && !e._tdHit) {
          e._tdHit = true; e.hitBy(this.dmg * 2.6, this.facing * 10, level); this.onDealHit(e, level);
          setTimeout(() => e._tdHit = false, 900);
        }
      }
      if (level.boss && !level.boss.dead && Math.abs(level.boss.x - this.x) < 110 && !level.boss._tdHit) {
        level.boss._tdHit = true; level.boss.hitBy(this.dmg * 2.2, 0, level);
        setTimeout(() => { if (level.boss) level.boss._tdHit = false; }, 500);
      }
      level.parts.emit(this.x, this.y - 50, { n: 8, color: this.C.aura, glow: true, dMin: 0.02, dMax: 0.05, sMin: 3, sMax: 7 });
    } else if (this.id === 'ravi') {
      // barrage rains down
      this.pose = 'cast';
      if (Math.floor(T * 10) !== Math.floor((T - 0.016) * 10)) {
        const tx = this.x + this.facing * rnd(60, 380);
        level.projectiles.push(new Proj(tx, this.y - 330, rnd(-1, 1), 10, { friendly: true, dmg: this.dmg * 1.4, color: this.C.aura, explosive: true, r: 8 }));
      }
    } else { // kiran — elephant force
      this.pose = 'smash';
      if (!this.ultDone && T > 0.5) {
        this.ultDone = true;
        level.elephantT = 0; level.elephantX = this.x; level.elephantF = this.facing;
        for (const e of level.enemies) if (!e.dead && (e.x - this.x) * this.facing > -50 && Math.abs(e.x - this.x) < 500 && Math.abs(e.y - this.y) < 200) { e.hitBy(this.dmg * 3.6, this.facing * 15, level); this.onDealHit(e, level); }
        if (level.boss && !level.boss.dead && (level.boss.x - this.x) * this.facing > -50 && Math.abs(level.boss.x - this.x) < 520) level.boss.hitBy(this.dmg * 3.4, 0, level);
        level.shake(16);
      }
    }
    if (this.ultT > this.ultDur - 0.05) this.ultDone = false;
  }
  takeHit(dmg, kx, level) {
    if (this.iT > 0 || this.dead || this.dashT >= 0) return;
    if (this.shieldT > 0) dmg *= 0.35;
    this.hp -= dmg; this.hurtT = 0.32; this.iT = 0.8;
    this.vx = kx; this.vy = -4;
    Audio2.sfx('hurt');
    level.shake(5);
    level.parts.emit(this.x, this.y - 50, { n: 8, color: '#ff6a5c', dMin: 0.04, dMax: 0.08 });
  }
  draw(ctx, camX, camY) {
    ctx.save();
    ctx.translate(this.x - camX, this.y - camY);
    if (this.iT > 0 && Math.sin(this.t * 40) > 0) ctx.globalAlpha = 0.45;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, TAU); ctx.fill();
    if (this.shieldT > 0) {
      ctx.strokeStyle = `rgba(255,190,90,${0.4 + Math.sin(this.t * 6) * 0.2})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -55, 58, 0, TAU); ctx.stroke();
    }
    const stP = {
      pose: this.dead ? 'kneel' : this.pose, t: this.t, vx: this.vx, vy: this.vy,
      facing: this.facing, attackT: Math.max(0, this.attackT),
      emotion: this.dead ? 'pain' : this.emotion, powered: this.powered,
      blink: this.blinkT < 0.12,
    };
    if (!(typeof SpriteArt !== 'undefined' && SpriteArt.hero(ctx, this.id, stP))) Art.hero(ctx, this.id, stP);
    ctx.restore();
  }
}

// ---------------- COMPANION AI ----------------
class Companion extends Actor {
  constructor(id, x, y, slot) {
    super(x, y);
    this.id = id; this.C = CHARS[id]; this.slot = slot;
    this.maxHp = this.C.hp; this.hp = this.maxHp;
    this.pose = 'idle'; this.attackT = -1; this.atkCd = rnd(0.5, 1.5);
    this.emotion = 'neutral'; this.iT = 0; this.shieldT = 0;
    this.powered = SaveSys.data.level >= 7;
    this.speakCd = rnd(6, 14); this.downT = 0;
  }
  update(level, dt) {
    this.t += dt;
    this.blinkT -= dt; if (this.blinkT < 0) this.blinkT = rnd(2, 5);
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.iT > 0) this.iT -= dt;
    if (this.shieldT > 0) this.shieldT -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.downT > 0) {
      // revive countdown
      this.downT -= dt; this.pose = 'kneel';
      if (this.downT <= 0) { this.hp = this.maxHp * 0.5; Audio2.sfx('heal'); }
      this.vx = 0; this.physics(level); return;
    }
    const p = level.player;
    const locked = level.game.cine.active;

    // pick target
    let target = null, bestD = 330;
    for (const e of level.enemies) {
      if (e.dead) continue;
      const d = Math.abs(e.x - this.x);
      if (d < bestD) { bestD = d; target = e; }
    }
    if (level.boss && !level.boss.dead && Math.abs(level.boss.x - this.x) < 380) target = level.boss;

    const followX = p.x - (this.slot + 1) * 52 * p.facing;
    let mx = 0;

    if (this.attackT >= 0) {
      this.attackT += dt * 3.2;
      this.pose = this.C.ranged ? 'cast' : 'attack';
      this.vx *= 0.8;
      if (!this.didHit && this.attackT > 0.4 && target) {
        this.didHit = true;
        if (this.C.ranged) {
          level.projectiles.push(new Proj(this.x + this.facing * 22, this.y - 56, this.facing * 8.5, 0, { friendly: true, dmg: this.C.dmg * 0.7, color: this.C.aura, r: 6 }));
          Audio2.sfx('projectile');
        } else if (Math.abs(target.x - this.x) < this.C.atkRange + 30 && Math.abs(target.y - this.y) < 120) {
          target.hitBy(this.C.dmg * 0.7, this.facing * 4, level);
          Audio2.sfx('hit');
          level.parts.emit(target.x, target.y - 50, { n: 6, color: this.C.aura, glow: true });
        }
      }
      if (this.attackT >= 1) { this.attackT = -1; this.didHit = false; }
    } else if (!locked) {
      if (target && !this.C.ranged && Math.abs(target.x - this.x) > this.C.atkRange * 0.8) {
        mx = sign(target.x - this.x);
      } else if (target && this.C.ranged && Math.abs(target.x - this.x) < 160) {
        mx = -sign(target.x - this.x); // kite
      } else if (!target && Math.abs(followX - this.x) > 46) {
        mx = sign(followX - this.x);
      } else if (target && this.C.ranged) {
        mx = 0;
      }
      // dodge: if enemy attacking nearby, hop back sometimes
      if (target && target.attackT > 0 && target.attackT < 0.4 && Math.abs(target.x - this.x) < 100 && this.grounded && Math.random() < 0.05) {
        this.vy = -9; this.vx = -sign(target.x - this.x) * 5;
      }
      this.vx = lerp(this.vx, mx * this.C.speed * 0.95, 0.3);
      if (mx) this.facing = mx;
      else if (target) this.facing = sign(target.x - this.x);
      else if (Math.abs(p.x - this.x) > 30) this.facing = sign(p.x - this.x);
      // jump if follow target above / ledge
      if (this.grounded && (p.y < this.y - 90 && Math.abs(p.x - this.x) < 200 || (mx && Math.abs(this.vx) < 0.3))) this.vy = -this.C.jump;
      // teleport if too far behind
      if (Math.abs(p.x - this.x) > 620 || this.y > H + 150) { this.x = p.x - p.facing * 60; this.y = p.y - 10; this.vy = 0; }
      // attack
      if (target && this.atkCd <= 0) {
        const inR = this.C.ranged ? Math.abs(target.x - this.x) < 380 : Math.abs(target.x - this.x) < this.C.atkRange + 26 && Math.abs(target.y - this.y) < 110;
        if (inR) { this.attackT = 0; this.didHit = false; this.atkCd = rnd(1.1, 2.1); this.facing = sign(target.x - this.x); }
      }
      // pose
      if (!this.grounded) this.pose = 'jump';
      else if (Math.abs(this.vx) > 2.4) this.pose = 'run';
      else if (Math.abs(this.vx) > 0.4) this.pose = 'walk';
      else this.pose = 'idle';
      // gameplay barks
      this.speakCd -= dt;
      if (this.speakCd <= 0 && !level.game.cine.active) {
        this.speakCd = rnd(14, 26);
        if (target && Math.random() < 0.6) level.game.companionBark(this.id, 'combat');
        else if (!target && Math.random() < 0.35) level.game.companionBark(this.id, 'idle');
      }
    } else { this.vx *= 0.8; this.pose = 'idle'; }

    this.physics(level);
    this.emotion = target ? 'determined' : (level.mood || 'neutral');
    if (this.hurtT > 0.1) { this.pose = 'hurt'; this.emotion = 'pain'; }
    if (this.hp <= 0 && this.downT <= 0) { this.downT = 6; level.game.companionBark(this.id, 'down'); }
  }
  takeHit(dmg, kx, level) {
    if (this.iT > 0 || this.downT > 0) return;
    if (this.shieldT > 0) dmg *= 0.35;
    this.hp -= dmg; this.hurtT = 0.3; this.iT = 0.7; this.vx = kx;
    level.parts.emit(this.x, this.y - 50, { n: 5, color: '#ff6a5c' });
  }
  draw(ctx, camX, camY) {
    ctx.save();
    ctx.translate(this.x - camX, this.y - camY);
    if (this.downT > 0) ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(0, 2, 20, 5, 0, 0, TAU); ctx.fill();
    if (this.shieldT > 0) {
      ctx.strokeStyle = `rgba(255,190,90,${0.35 + Math.sin(this.t * 6) * 0.18})`; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, -52, 54, 0, TAU); ctx.stroke();
    }
    const stC = {
      pose: this.pose, t: this.t, vx: this.vx, vy: this.vy, facing: this.facing,
      attackT: Math.max(0, this.attackT), emotion: this.emotion,
      powered: this.powered, blink: this.blinkT < 0.12,
    };
    if (!(typeof SpriteArt !== 'undefined' && SpriteArt.hero(ctx, this.id, stC))) Art.hero(ctx, this.id, stC);
    ctx.restore();
  }
}

// ---------------- ENEMY ----------------
const ENEMY_DEFS = {
  shadowRunner: { hp: 26, dmg: 8, speed: 3.6, range: 46, sight: 460, atkCd: 1.2, score: 1, h: 66 },
  ashWarrior: { hp: 55, dmg: 12, speed: 2.1, range: 62, sight: 420, atkCd: 1.7, score: 2, h: 96 },
  stoneGuardian: { hp: 120, dmg: 20, speed: 1.0, range: 76, sight: 380, atkCd: 2.6, score: 3, h: 96, heavy: true },
  shadowArcher: { hp: 34, dmg: 10, speed: 1.7, range: 480, sight: 560, atkCd: 2.3, score: 2, h: 90, ranged: true, kite: 240 },
  corruptedBeast: { hp: 42, dmg: 11, speed: 4.4, range: 52, sight: 520, atkCd: 1.4, score: 2, h: 46, pounce: true },
  voidMage: { hp: 48, dmg: 14, speed: 1.4, range: 460, sight: 560, atkCd: 2.8, score: 3, h: 84, ranged: true, kite: 280, homing: true },
  eliteGuardian: { hp: 150, dmg: 18, speed: 2.4, range: 88, sight: 480, atkCd: 1.9, score: 4, h: 128, heavy: true },
};

class Enemy extends Actor {
  constructor(type, x, y) {
    super(x, y);
    this.type = type;
    this.D = ENEMY_DEFS[type];
    const lvlScale = 1 + Math.min(1.4, SaveSys.data.level * 0.05);
    this.maxHp = this.D.hp * lvlScale; this.hp = this.maxHp;
    this.dmg = this.D.dmg * (0.8 + SaveSys.data.level * 0.02);
    this.pose = 'idle'; this.attackT = -1; this.atkCd = rnd(0.4, this.D.atkCd);
    this.dieT = 0; this.homeX = x; this.stunT = 0;
  }
  update(level, dt) {
    this.t += dt;
    if (this.dead) { this.dieT += dt * 1.4; return; }
    if (level.game && level.game.cine.active) { this.pose = 'idle'; this.vx *= 0.85; this.physics(level); return; }
    if (this.hurtT > 0) { this.hurtT -= dt; this.pose = 'hurt'; this.vx *= 0.8; this.physics(level); return; }
    if (this.stunT > 0) { this.stunT -= dt; this.pose = 'hurt'; this.vx *= 0.85; this.physics(level); return; }
    if (this.atkCd > 0) this.atkCd -= dt;

    // pick nearest hero target
    let target = level.player.dead ? null : level.player;
    let bd = target ? Math.abs(target.x - this.x) : 1e9;
    for (const c of level.companions) {
      if (c.downT > 0) continue;
      const d = Math.abs(c.x - this.x);
      if (d < bd) { bd = d; target = c; }
    }

    if (this.attackT >= 0) {
      this.attackT += dt * 2.4;
      this.pose = 'attack';
      this.vx *= 0.85;
      if (!this.didHit && this.attackT > 0.45) {
        this.didHit = true;
        this.executeAttack(level, target);
      }
      if (this.attackT >= 1) { this.attackT = -1; this.didHit = false; }
    } else if (target && bd < this.D.sight && !level.game.cine.active) {
      this.facing = sign(target.x - this.x);
      let want = 0;
      if (this.D.ranged) {
        if (bd < this.D.kite) want = -this.facing;
        else if (bd > this.D.range) want = this.facing * 0.6;
      } else if (bd > this.D.range * 0.8) want = this.facing;
      this.vx = lerp(this.vx, want * this.D.speed, 0.25);
      this.pose = Math.abs(this.vx) > 0.5 ? 'move' : 'idle';
      // jump gaps/ledges
      if (this.grounded && want && Math.abs(this.vx) < 0.3 && !this.D.heavy) this.vy = -10;
      if (this.grounded && this.D.pounce && bd < 190 && this.atkCd <= 0 && Math.abs(target.y - this.y) < 60) { this.vy = -7; this.vx = this.facing * 7; }
      // start attack
      const inRange = this.D.ranged ? bd < this.D.range && Math.abs(target.y - this.y) < 220 : bd < this.D.range && Math.abs(target.y - this.y) < 110;
      if (inRange && this.atkCd <= 0) { this.attackT = 0; this.didHit = false; this.atkCd = this.D.atkCd + rnd(0, 0.6); }
    } else {
      // idle wander
      this.vx = lerp(this.vx, Math.sin(this.t * 0.7 + this.homeX) * 0.5, 0.1);
      this.pose = Math.abs(this.vx) > 0.3 ? 'move' : 'idle';
    }
    this.physics(level);
    if (this.hp <= 0 && !this.dead) this.die(level);
  }
  executeAttack(level, target) {
    if (!target) return;
    if (this.D.ranged) {
      const col = this.type === 'voidMage' ? '#a05fff' : '#c46bff';
      const ang = Math.atan2((target.y - 55) - (this.y - 60), target.x - this.x);
      const sp = this.type === 'voidMage' ? 5.5 : 8;
      level.projectiles.push(new Proj(this.x + this.facing * 26, this.y - 60, Math.cos(ang) * sp, Math.sin(ang) * sp,
        { friendly: false, dmg: this.dmg, color: col, r: this.type === 'voidMage' ? 9 : 6, homing: this.D.homing ? 0.05 : 0 }));
      Audio2.sfx('projectile');
    } else {
      const bd = Math.abs(target.x - this.x);
      if (bd < this.D.range + 26 && Math.abs(target.y - this.y) < 120) {
        target.takeHit(this.dmg, this.facing * 5, level);
        if (this.D.heavy) level.shake(6);
      }
      Audio2.sfx(this.D.heavy ? 'explode' : 'attack');
    }
  }
  hitBy(dmg, kx, level) {
    if (this.dead) return false;
    this.hp -= dmg; this.hurtT = this.D.heavy ? 0.12 : 0.22;
    if (!this.D.heavy) { this.vx = kx; this.vy = -2.5; }
    if (this.hp <= 0) this.die(level);
    return true;
  }
  die(level) {
    this.dead = true; this.pose = 'die'; this.dieT = 0;
    Audio2.sfx('enemyDie');
    level.parts.emit(this.x, this.y - 44, { n: 16, color: '#8a5fd0', glow: true, spMax: 5, dMin: 0.02, dMax: 0.05 });
    level.parts.emit(this.x, this.y - 44, { n: 6, color: '#ffd98a', glow: true, spMax: 3 });
    level.onEnemyKilled(this);
  }
  draw(ctx, camX, camY) {
    if (this.dieT >= 1) return;
    ctx.save();
    ctx.translate(this.x - camX, this.y - camY);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, TAU); ctx.fill();
    // attack telegraph
    if (this.attackT >= 0 && this.attackT < 0.45) {
      ctx.fillStyle = `rgba(255,90,90,${0.5 - this.attackT})`;
      ctx.beginPath(); ctx.arc(0, -this.D.h * 0.6, 12 + this.attackT * 26, 0, TAU); ctx.fill();
    }
    Art.enemy(ctx, this.type, {
      pose: this.dead ? 'die' : this.pose, t: this.t, facing: this.facing,
      attackT: Math.max(0, this.attackT), dieT: this.dieT,
    });
    // hp bar
    if (!this.dead && this.hp < this.maxHp) {
      ctx.fillStyle = 'rgba(10,8,16,0.7)'; ctx.fillRect(-22, -this.D.h - 18, 44, 5);
      ctx.fillStyle = '#c05cff'; ctx.fillRect(-21, -this.D.h - 17, 42 * (this.hp / this.maxHp), 3);
    }
    ctx.restore();
  }
}

// ---------------- PROJECTILE ----------------
class Proj {
  constructor(x, y, vx, vy, o) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.o = o; this.dead = false; this.t = 0;
  }
  update(level, dt) {
    this.t += dt;
    if (this.o.homing && !this.o.friendly) {
      const p = level.player;
      const ang = Math.atan2((p.y - 55) - this.y, p.x - this.x);
      const cur = Math.atan2(this.vy, this.vx);
      const sp = Math.hypot(this.vx, this.vy);
      let d = ang - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
      const na = cur + clamp(d, -this.o.homing, this.o.homing);
      this.vx = Math.cos(na) * sp; this.vy = Math.sin(na) * sp;
    }
    this.x += this.vx; this.y += this.vy;
    if (this.t > 3.2) this.dead = true;
    // collide platforms
    for (const pf of level.scene.platforms) {
      if (pf.oneway) continue;
      if (this.x > pf.x && this.x < pf.x + pf.w && this.y > pf.y && this.y < pf.y + pf.h) { this.explode(level); return; }
    }
    if (this.o.friendly) {
      for (const e of level.enemies) {
        if (e.dead) continue;
        if (Math.abs(e.x - this.x) < 30 && this.y > e.y - e.D.h - 14 && this.y < e.y + 8) {
          e.hitBy(this.o.dmg, sign(this.vx) * 3, level);
          level.player.onDealHit(e, level);
          this.explode(level); return;
        }
      }
      if (level.boss && !level.boss.dead) {
        const b = level.boss;
        if (Math.abs(b.x - this.x) < b.w / 2 + 16 && this.y > b.y - b.h && this.y < b.y + 10) {
          b.hitBy(this.o.dmg, 0, level); level.player.onDealHit(b, level);
          this.explode(level); return;
        }
      }
    } else {
      const targets = [level.player, ...level.companions];
      for (const p of targets) {
        if (p.dead || p.downT > 0) continue;
        if (Math.abs(p.x - this.x) < 26 && this.y > p.y - 96 && this.y < p.y + 6) {
          p.takeHit(this.o.dmg, sign(this.vx) * 4, level);
          this.explode(level); return;
        }
      }
    }
  }
  explode(level) {
    this.dead = true;
    if (this.o.explosive) {
      Audio2.sfx('explode'); level.shake(4);
      level.parts.emit(this.x, this.y, { n: 18, color: this.o.color, glow: true, spMax: 6 });
      if (this.o.friendly) {
        for (const e of level.enemies) if (!e.dead && dist(e.x, e.y - 40, this.x, this.y) < 110) e.hitBy(this.o.dmg * 0.7, sign(e.x - this.x) * 5, level);
      }
    } else {
      level.parts.emit(this.x, this.y, { n: 7, color: this.o.color, glow: true, spMax: 3.5 });
    }
  }
  draw(ctx, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY;
    const r = this.o.r || 6;
    const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, r * 2.4);
    g.addColorStop(0, '#fff'); g.addColorStop(0.4, this.o.color); g.addColorStop(1, this.o.color + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r * 2.4, 0, TAU); ctx.fill();
    if (this.o.wave) {
      ctx.strokeStyle = this.o.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx - this.vx * 2, sy, r * 1.6, -1.1, 1.1); ctx.stroke();
    }
    // trail
    ctx.fillStyle = this.o.color + '55';
    ctx.beginPath(); ctx.arc(sx - this.vx * 2.4, sy - this.vy * 2.4, r * 0.8, 0, TAU); ctx.fill();
  }
}

// ---------------- BOSS ----------------
const BOSS_DEFS = {
  fallenGuardian: { name: 'FALLEN GUARDIAN', hp: 700, w: 110, h: 200, phases: 2, music: 'boss' },
  shadowBeast: { name: 'SHADOW BEAST', hp: 850, w: 130, h: 120, phases: 2, music: 'boss' },
  templeGuardian: { name: 'TEMPLE GUARDIAN', hp: 1050, w: 110, h: 230, phases: 3, music: 'boss' },
  vyomasura: { name: 'VYOMASURA', hp: 1250, w: 90, h: 210, phases: 3, music: 'boss' },
  vyomasuraUnbound: { name: 'VYOMASURA — THE UNBOUND', hp: 2100, w: 120, h: 270, phases: 5, music: 'finalboss' },
};

class Boss extends Actor {
  constructor(type, x, y, opts = {}) {
    super(x, y);
    this.type = type; this.D = BOSS_DEFS[type];
    this.maxHp = this.D.hp * (opts.hpScale || 1); this.hp = this.maxHp;
    this.w = this.D.w; this.h = this.D.h;
    this.pose = 'idle'; this.attackT = -1; this.atkCd = 2.4;
    this.phase = 1; this.dieT = -1; this.pattern = 0;
    this.invulnerable = opts.invulnerable || false;
    this.scripted = opts.scripted || false; // level 16: unwinnable
    this.teleCd = 4;
  }
  get phaseNow() { return 1 + Math.floor((1 - this.hp / this.maxHp) * this.D.phases * 0.999); }
  update(level, dt) {
    this.t += dt;
    if (this.dead) { if (this.dieT >= 0) this.dieT += dt; return; }
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.atkCd > 0) this.atkCd -= dt * (1 + (this.phaseNow - 1) * 0.25);
    if (this.teleCd > 0) this.teleCd -= dt;
    const p = level.player;
    if (level.game.cine.active) { this.pose = 'idle'; return; }

    // phase transition
    if (this.phaseNow > this.phase) {
      this.phase = this.phaseNow;
      Audio2.sfx('bossRoar'); level.shake(12); level.flashT = 0.25;
      level.parts.emit(this.x, this.y - this.h / 2, { n: 30, color: this.type.startsWith('vyo') ? '#a05fff' : '#ff8a40', glow: true, spMax: 8 });
      level.game.onBossPhase(this);
    }

    const bd = p.x - this.x;
    this.facing = sign(bd);

    if (this.attackT >= 0) {
      this.attackT += dt * 1.7;
      if (!this.didHit && this.attackT > 0.45) { this.didHit = true; this.executePattern(level); }
      if (this.attackT >= 1) { this.attackT = -1; this.didHit = false; this.pose = 'idle'; }
    } else {
      // movement per boss
      const wantD = this.type === 'shadowBeast' ? 70 : this.type.startsWith('vyo') ? 200 : 110;
      const spd = this.type === 'shadowBeast' ? 3.4 : this.type === 'fallenGuardian' ? 1.2 : 1.8;
      if (Math.abs(bd) > wantD + 40) this.vx = lerp(this.vx, this.facing * spd, 0.2);
      else if (Math.abs(bd) < wantD - 40 && this.type.startsWith('vyo')) this.vx = lerp(this.vx, -this.facing * spd, 0.2);
      else this.vx *= 0.85;
      this.pose = Math.abs(this.vx) > 0.5 ? 'move' : 'idle';
      // vyomasura teleport
      if (this.type.startsWith('vyo') && this.teleCd <= 0 && (Math.abs(bd) < 90 || Math.abs(bd) > 480)) {
        Audio2.sfx('teleport');
        level.parts.emit(this.x, this.y - 90, { n: 22, color: '#a05fff', glow: true, spMax: 6 });
        this.x = p.x - this.facing * rnd(180, 300);
        this.x = clamp(this.x, 80, level.scene.width - 80);
        level.parts.emit(this.x, this.y - 90, { n: 22, color: '#a05fff', glow: true, spMax: 6 });
        this.teleCd = rnd(5, 8);
      }
      if (this.atkCd <= 0) {
        this.attackT = 0; this.didHit = false;
        this.atkCd = (this.type === 'shadowBeast' ? 1.6 : 2.6) - this.phase * 0.2;
        // choose pattern
        const pats = this.getPatterns();
        this.pattern = pats[irnd(0, pats.length - 1)];
        this.pose = this.pattern === 'cast' || this.pattern === 'summon' || this.pattern === 'barrage' ? 'cast' : 'attack';
      }
    }
    this.physics(level);
    if (this.hp <= 0 && !this.dead) {
      if (this.scripted) { this.hp = 1; return; } // can't die in scripted fight
      this.dead = true; this.dieT = 0;
      Audio2.sfx('bossRoar'); Audio2.sfx('explode');
      level.shake(18); level.flashT = 0.5;
      level.game.onBossDefeated(this);
    }
  }
  getPatterns() {
    const P = this.phase;
    switch (this.type) {
      case 'fallenGuardian': return P >= 2 ? ['slam', 'slam', 'rockthrow', 'quake'] : ['slam', 'rockthrow'];
      case 'shadowBeast': return P >= 2 ? ['pounce', 'pounce', 'howl'] : ['pounce', 'swipe'];
      case 'templeGuardian': return P >= 3 ? ['slam', 'barrage', 'quake', 'summon'] : P >= 2 ? ['slam', 'barrage', 'quake'] : ['slam', 'barrage'];
      case 'vyomasura': return P >= 3 ? ['cast', 'volley', 'quake', 'summon'] : P >= 2 ? ['cast', 'volley', 'summon'] : ['cast', 'volley'];
      case 'vyomasuraUnbound': return P >= 4 ? ['cast', 'volley', 'quake', 'summon', 'corrupt'] : P >= 2 ? ['cast', 'volley', 'quake', 'summon'] : ['cast', 'volley', 'quake'];
    }
    return ['slam'];
  }
  executePattern(level) {
    const p = level.player;
    const bd = Math.abs(p.x - this.x);
    const col = this.type.startsWith('vyo') ? '#a05fff' : this.type === 'templeGuardian' ? '#ff9a40' : '#c46bff';
    switch (this.pattern) {
      case 'slam': case 'swipe':
        Audio2.sfx('explode'); level.shake(10);
        level.parts.emit(this.x + this.facing * 70, this.y - 10, { n: 16, color: '#c9b89a', spMax: 5, grav: 0.2 });
        if (bd < 170 && Math.abs(p.y - this.y) < 130) p.takeHit(18 + this.phase * 3, this.facing * 8, level);
        for (const c of level.companions) if (Math.abs(c.x - this.x) < 170) c.takeHit(14, sign(c.x - this.x) * 7, level);
        break;
      case 'pounce':
        this.vx = this.facing * 12; this.vy = -8;
        Audio2.sfx('attack');
        if (bd < 130 && Math.abs(p.y - this.y) < 100) p.takeHit(15 + this.phase * 3, this.facing * 9, level);
        break;
      case 'howl':
        Audio2.sfx('bossRoar'); level.shake(8);
        for (let i = 0; i < 3; i++) {
          const a = -0.5 - i * 0.35;
          level.projectiles.push(new Proj(this.x, this.y - 60, Math.cos(a) * 6 * this.facing, Math.sin(a) * 6, { friendly: false, dmg: 10, color: col, r: 7 }));
        }
        break;
      case 'rockthrow': {
        Audio2.sfx('attack');
        const ang = Math.atan2((p.y - 40) - (this.y - 140), p.x - this.x);
        level.projectiles.push(new Proj(this.x, this.y - 140, Math.cos(ang) * 7, Math.sin(ang) * 7 - 2, { friendly: false, dmg: 16, color: '#9a8f7a', r: 12, explosive: true }));
        break;
      }
      case 'quake': {
        Audio2.sfx('rumble'); level.shake(14);
        // ground shockwaves both directions
        for (const dir of [-1, 1]) {
          level.projectiles.push(new Proj(this.x + dir * 60, this.y - 14, dir * 6.5, 0, { friendly: false, dmg: 14, color: col, r: 10, wave: true }));
        }
        break;
      }
      case 'cast': { // triple shadow projectiles
        Audio2.sfx('projectile');
        for (let i = -1; i <= 1; i++) {
          const ang = Math.atan2((p.y - 55) - (this.y - 120), p.x - this.x) + i * 0.22;
          level.projectiles.push(new Proj(this.x + this.facing * 30, this.y - 120, Math.cos(ang) * 7, Math.sin(ang) * 7, { friendly: false, dmg: 13 + this.phase * 2, color: col, r: 8 }));
        }
        break;
      }
      case 'volley': { // rain from above
        Audio2.sfx('corrupt');
        for (let i = 0; i < 4 + this.phase; i++) {
          const tx = p.x + rnd(-220, 220);
          setTimeout(() => {
            if (level.game.level === level) level.projectiles.push(new Proj(tx, this.y - 400, 0, 8, { friendly: false, dmg: 12, color: col, r: 8 }));
          }, i * 160);
        }
        break;
      }
      case 'summon': {
        Audio2.sfx('teleport');
        const types = this.type === 'templeGuardian' ? ['ashWarrior'] : ['shadowRunner', 'shadowRunner', 'shadowArcher'];
        if (level.enemies.filter(e => !e.dead).length < 4) {
          for (let i = 0; i < 2; i++) {
            const e = new Enemy(types[irnd(0, types.length - 1)], this.x + rnd(-200, 200), this.y - 60);
            level.enemies.push(e);
            level.parts.emit(e.x, e.y - 40, { n: 14, color: col, glow: true });
          }
        }
        break;
      }
      case 'corrupt': { // arena corruption — damaging zones
        Audio2.sfx('corrupt'); level.shake(8);
        level.corruptZones = [];
        for (let i = 0; i < 3; i++) {
          level.corruptZones.push({ x: p.x + rnd(-300, 300), w: 90, life: 4 });
        }
        break;
      }
    }
  }
  hitBy(dmg, kx, level) {
    if (this.dead || this.invulnerable) return false;
    this.hp -= dmg; this.hurtT = 0.15;
    return true;
  }
  draw(ctx, camX, camY, level) {
    ctx.save();
    ctx.translate(this.x - camX, this.y - camY);
    if (this.dieT >= 0) { ctx.globalAlpha = Math.max(0, 1 - this.dieT * 0.5); ctx.translate(0, this.dieT * 12); }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 2, this.w * 0.55, 8, 0, 0, TAU); ctx.fill();
    // telegraph
    if (this.attackT >= 0 && this.attackT < 0.45) {
      ctx.fillStyle = `rgba(255,80,80,${0.45 - this.attackT * 0.8})`;
      ctx.beginPath(); ctx.arc(0, -this.h * 0.55, 22 + this.attackT * 44, 0, TAU); ctx.fill();
    }
    const st = {
      t: this.t, facing: this.facing, attackT: Math.max(0, this.attackT),
      pose: this.dead ? 'die' : this.hurtT > 0 ? 'hurt' : this.attackT >= 0 ? (this.pose === 'cast' ? 'cast' : 'attack') : this.pose,
      h: this.h,
    };
    // Vyomasura fights use generated keyframe art (image-first), others vector
    let drewKf = false;
    if (typeof SpriteArt !== 'undefined' && SpriteArt.vyo) {
      if (this.type === 'vyomasura') drewKf = SpriteArt.vyo(ctx, 1, st);
      else if (this.type === 'vyomasuraUnbound') drewKf = SpriteArt.vyo(ctx, 2, st);
    }
    if (!drewKf) Art.boss(ctx, this.type, st);
    ctx.restore();
  }
}
