// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — game.js
// Main controller: state machine, cinematic engine, game loop.
// ============================================================
'use strict';

class CinematicEngine {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.steps = []; this.idx = -1;
    this.stepT = 0; this.barT = 0;
    this.titleCard = null; this.narr = null;
    this.fade = 0; this.fadeDir = 0;
    this.flash = null; this.onDone = null;
  }
  play(key, onDone) {
    const steps = CINEMATICS[key];
    if (!steps) { if (onDone) onDone(); return; }
    this.active = true; this.steps = steps; this.idx = -1;
    this.stepT = 0; this.onDone = onDone || null;
    this.titleCard = null; this.narr = null;
    this.advance();
  }
  advance() {
    this.idx++;
    this.stepT = 0;
    if (this.idx >= this.steps.length) { this.end(); return; }
    const s = this.steps[this.idx];
    const lvl = this.game.level;
    if (s.who && s.text !== undefined) {
      // dialogue line
      const dur = Math.max(2.2, s.text.length * 0.052);
      const who = s.who === VYO ? 'VYOMASURA' : CHARS[s.who] ? CHARS[s.who].name : s.who;
      this.game.subtitle(who, s.text, dur, CHARS[s.who] ? s.who : null);
      this.wait = dur + 0.35;
      // set emotion & face speaker
      if (lvl) {
        const actor = this.findActor(s.who);
        if (actor && s.emo) actor.emotion = s.emo;
        if (actor && actor !== lvl.player) {
          // others look at the speaker
          for (const a of [lvl.player, ...lvl.companions]) {
            if (a !== actor && Math.abs(a.x - actor.x) > 20) a.facing = sign(actor.x - a.x);
          }
        }
        // talk blips
        const n = Math.min(14, Math.floor(s.text.length / 5));
        for (let i = 0; i < n; i++) setTimeout(() => Audio2.sfx(s.who === VYO ? 'talkLow' : 'talk'), i * 130);
      }
    } else if (s.narrator) {
      this.narr = { text: s.narrator, age: 0 };
      this.wait = Math.max(2.6, s.narrator.length * 0.055);
    } else if (s.action === 'img') {
      // IMAGE-BASED CINEMATIC STORYBOARD BEAT — sharp art, slow camera drift
      this.board = {
        key: s.img, age: 0, dur: s.t || 3.6,
        zoomFrom: s.zoomFrom || 1.0, zoomTo: s.zoomTo || 1.08,
        panFrom: s.panFrom !== undefined ? s.panFrom : 0.42,
        panTo: s.panTo !== undefined ? s.panTo : 0.58,
      };
      this.wait = s.t || 3.6;
    } else if (s.action === 'imgClear') {
      this.board = null;
      this.wait = 0.05;
    } else if (s.action === 'wait') {
      this.wait = s.t;
    } else if (s.action === 'title') {
      this.titleCard = { text: s.text, age: 0 };
      Audio2.sfx('stinger');
      this.wait = 3.4;
    } else if (s.action === 'emote') {
      const a = this.findActor(s.who);
      if (a) a.emotion = s.emo;
      this.wait = 0.05;
    } else if (s.action === 'face') {
      const a = this.findActor(s.who);
      if (a) a.facing = s.dir;
      this.wait = 0.05;
    } else if (s.action === 'camera') {
      this.camMove = { x: s.x, zoom: s.zoom || 1, t: 0, dur: s.t || 2 };
      this.wait = s.t || 2;
    } else if (s.action === 'fx') {
      this.doFx(s.fx);
    } else {
      this.wait = 0.1;
    }
  }
  doFx(fx) {
    const g = this.game, lvl = g.level;
    this.wait = 0.3;
    switch (fx) {
      case 'fadein': this.fade = 1; this.fadeDir = -1; this.wait = 1; break;
      case 'fadeout': this.fadeDir = 1; this.wait = 1; break;
      case 'flashPurple': this.flash = { c: '150,70,255', a: 0.7 }; Audio2.sfx('corrupt'); this.wait = 0.8; break;
      case 'shake': if (lvl) lvl.shake(12); Audio2.sfx('rumble'); this.wait = 0.7; break;
      case 'windSound': Audio2.sfx('wind'); this.wait = 0.6; break;
      case 'templeSound': Audio2.sfx('bell'); Audio2.sfx('rumble'); this.wait = 1.2; break;
      case 'shadowFlicker': this.flash = { c: '40,20,70', a: 0.55 }; Audio2.sfx('corrupt'); if (lvl) lvl.shake(4); this.wait = 1; break;
      case 'lowRumble': Audio2.sfx('rumble'); if (lvl) lvl.shake(6); this.wait = 1.2; break;
      case 'storm': Audio2.sfx('wind'); Audio2.sfx('rumble'); if (lvl) lvl.shake(5); this.wait = 1; break;
      case 'shadowSpawn': Audio2.sfx('teleport'); this.flash = { c: '80,40,140', a: 0.4 }; this.wait = 0.8; break;
      case 'sealBreak': Audio2.sfx('seal'); Audio2.sfx('explode'); if (lvl) { lvl.shake(18); lvl.flashT = 0.6; } this.flash = { c: '150,70,255', a: 0.9 }; this.wait = 2; break;
      case 'vyoRise': Audio2.sfx('bossRoar'); if (lvl) { lvl.shake(10); lvl.cineVyo = { x: lvl.player.x + 420, t: 0, rise: true }; } this.wait = 2; break;
      case 'vyoAppear': Audio2.sfx('teleport'); if (lvl) lvl.cineVyo = { x: lvl.player.x + 460, t: 0 }; this.wait = 1; break;
      case 'vyoVanish': Audio2.sfx('teleport'); if (lvl) lvl.cineVyo = null; this.flash = { c: '100,50,180', a: 0.5 }; this.wait = 1; break;
      case 'vyoFade': Audio2.sfx('heal'); if (lvl) lvl.cineVyo = null; this.flash = { c: '255,220,150', a: 0.5 }; this.wait = 1.4; break;
      case 'divineSpark': Audio2.sfx('power'); Audio2.sfx('bell'); this.flash = { c: '255,200,100', a: 0.55 };
        if (lvl) for (const a of [lvl.player, ...lvl.companions]) lvl.parts.emit(a.x, a.y - 50, { n: 22, color: '#ffcf6a', glow: true, spMax: 4, dMin: 0.01, dMax: 0.03 });
        this.wait = 1.6; break;
      case 'powerShatter': Audio2.sfx('explode'); this.flash = { c: '120,60,200', a: 0.8 };
        if (lvl) { lvl.player.powered = false; lvl.companions.forEach(c => c.powered = false); lvl.shake(10); }
        this.wait = 1.4; break;
      case 'powerRestore': Audio2.sfx('ult'); Audio2.sfx('bell'); this.flash = { c: '255,210,120', a: 0.85 };
        if (lvl) { lvl.player.powered = true; lvl.companions.forEach(c => c.powered = true); lvl.shake(8); lvl.flashT = 0.5; for (const a of [lvl.player, ...lvl.companions]) lvl.parts.emit(a.x, a.y - 50, { n: 34, color: CHARS[a.id].aura, glow: true, spMax: 6, dMin: 0.008, dMax: 0.02 }); }
        this.wait = 2.2; break;
      case 'combinePower': Audio2.sfx('ult'); this.flash = { c: '255,220,140', a: 0.9 }; if (lvl) lvl.shake(14); this.wait = 2; break;
      case 'sealRestore': Audio2.sfx('seal'); Audio2.sfx('bell'); this.flash = { c: '255,220,150', a: 0.7 }; this.wait = 2.2; break;
      case 'gateOpen': Audio2.sfx('door'); Audio2.sfx('seal'); if (lvl) { lvl.shake(8); for (const pr of lvl.scene.props) if (pr.finalGate) pr.open = true; } this.wait = 1.6; break;
      case 'bossIntro': Audio2.sfx('bossRoar'); if (lvl) lvl.shake(10); this.flash = { c: '255,80,90', a: 0.4 }; this.wait = 1.4; break;
      case 'silence': Audio2.play('none'); this.wait = 1.2; break;
      case 'dawnBreak': Audio2.play('victory'); this.flash = { c: '255,230,180', a: 0.6 }; this.wait = 2; break;
      case 'sunrise': this.flash = { c: '255,240,200', a: 0.9 }; Audio2.sfx('victory'); this.wait = 2.4; break;
      default: this.wait = 0.3;
    }
  }
  findActor(who) {
    const lvl = this.game.level;
    if (!lvl) return null;
    if (who === this.game.heroId) return lvl.player;
    return lvl.companions.find(c => c.id === who) || (lvl.player.id === who ? lvl.player : null);
  }
  update(dt) {
    if (!this.active) { this.barT = Math.max(0, this.barT - dt * 2); return; }
    this.barT = Math.min(1, this.barT + dt * 2);
    this.stepT += dt;
    if (this.narr) this.narr.age += dt;
    if (this.titleCard) this.titleCard.age += dt;
    if (this.flash) { this.flash.a -= dt * 0.8; if (this.flash.a <= 0) this.flash = null; }
    if (this.fadeDir) { this.fade = clamp(this.fade + this.fadeDir * dt, 0, 1); if (this.fade === 0 || this.fade === 1) this.fadeDir = 0; }
    // allow skip of individual line
    if (Input.hit('confirm') && this.stepT > 0.4) { this.stepT = this.wait; }
    if (this.board) this.board.age += dt;
    if (this.stepT >= this.wait) {
      if (this.narr) this.narr = null;
      if (this.titleCard) this.titleCard = null;
      this.advance();
    }
  }
  end() {
    this.active = false;
    this.narr = null; this.titleCard = null; this.board = null; this.boardHold = false;
    const cb = this.onDone; this.onDone = null;
    if (cb) cb();
  }
  draw(ctx) {
    // storyboard image beat — full-screen SHARP artwork with slow drift
    if (this.board && typeof IMG !== 'undefined' && IMG.has(this.board.key)) {
      const b = this.board;
      const p = clamp(b.age / b.dur, 0, 1);
      const z = lerp(b.zoomFrom, b.zoomTo, ease(p));
      const pan = lerp(b.panFrom, b.panTo, ease(p));
      const dw = W * z, dh = H * z;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const drew = IMG.drawCover(ctx, b.key, (W - dw) / 2, (H - dh) / 2, dw, dh, pan, 0.45);
      if (drew) {
        // gentle edge vignette only — image itself stays sharp
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        // fade in/out at beat boundaries
        const fadeIn = Math.min(1, b.age * 2.5);
        if (fadeIn < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fadeIn})`; ctx.fillRect(0, 0, W, H); }
      }
    }
    if (this.flash) {
      ctx.fillStyle = `rgba(${this.flash.c},${Math.max(0, this.flash.a)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.narr && this.active) {
      const a = Math.min(1, this.narr.age * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(5,4,10,0.55)';
      ctx.fillRect(0, H * 0.38, W, 90);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8dfc8'; ctx.font = 'italic 21px Georgia';
      const lines = wrapText(ctx, this.narr.text, W * 0.7);
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, H * 0.38 + 40 + i * 28));
      ctx.globalAlpha = 1;
    }
    if (this.titleCard) {
      const a = Math.min(1, this.titleCard.age * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.88 * a})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      const lines = this.titleCard.text.split('\n');
      const grad = ctx.createLinearGradient(0, H / 2 - 70, 0, H / 2 + 70);
      grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(1, '#e07820');
      ctx.fillStyle = grad;
      lines.forEach((ln, i) => {
        ctx.font = `bold ${i === 0 ? 52 : 40}px Georgia`;
        ctx.fillText(ln, W / 2, H / 2 - 20 + i * 60);
      });
      ctx.globalAlpha = 1;
    }
    if (this.active && Input.down('confirm')) { }
    if (this.active) {
      ctx.fillStyle = 'rgba(245,234,208,0.35)';
      ctx.font = '11px Verdana'; ctx.textAlign = 'right';
      ctx.fillText('ENTER/J — next', W - 84, H - 12);
    }
  }
}

// ============================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    SaveSys.load();
    Input.init();
    if (typeof IMG !== 'undefined') IMG.preloadAll();
    this.state = 'title'; // title, menu, charselect, opening, play, pause, death, levelcomplete, gamedone
    this.cine = new CinematicEngine(this);
    this.level = null;
    this.heroId = SaveSys.data.character || 'aditya';
    this.subs = []; // subtitle queue (single active)
    this.t = 0; this.lastTime = 0;
    this.playLevelIndex = null;
    this.selectingFor = null;
    requestAnimationFrame(ts => this.loop(ts));
  }
  toast(text) { UI.toasts.push({ text, age: 0 }); }
  subtitle(who, text, dur, hero) {
    this.subs = [{ who, text, dur: dur || 3, age: 0, hero: hero || (Object.keys(CHARS).find(k => CHARS[k].name === who) || null) }];
  }
  companionBark(id, kind) {
    const pool = BARKS[kind] && BARKS[kind][id];
    if (!pool || this.subs.length) return;
    this.subtitle(CHARS[id].name, pool[irnd(0, pool.length - 1)], 2.6, id);
    Audio2.sfx('talk');
  }

  // ---------- FLOW ----------
  startPlayFlow() {
    if (SaveSys.data.character && SaveSys.data.level > 0) {
      this.heroId = SaveSys.data.character;
      this.launchLevel(Math.min(23, SaveSys.data.level));
    } else {
      // new game → opening cinematic → char select
      this.state = 'opening';
      this.openingLevel = new Level(this, 0); // use level 1 street as opening backdrop
      this.level = this.openingLevel;
      Audio2.play('festival');
      this.cine.play('opening', () => {
        this.level = null;
        this.state = 'charselect';
        this.selectingFor = 'newgame';
        UI.charIdx = 0; UI.selAnimT = 0;
        Audio2.play('title');
      });
    }
  }
  confirmHero(id) {
    this.heroId = id;
    SaveSys.data.character = id;
    SaveSys.save();
    if (this.selectingFor === 'replay' && this.playLevelIndex !== null) {
      this.launchLevel(this.playLevelIndex);
    } else {
      this.launchLevel(SaveSys.data.level || 0);
    }
  }
  launchLevel(idx) {
    idx = clamp(idx, 0, 23);
    this.level = new Level(this, idx);
    this.state = 'play';
    UI.screen = 'game';
    Audio2.play(this.level.def.music);
    this.subs = [];
    // LEVEL TITLE CARD — level's own environment artwork + tip
    this.introCard = { t: 0, dur: 3.2, idx };
    const cs = this.level.def.cineStart;
    if (cs) this.cine.play(cs);
    this.saveProgress();
  }
  drawIntroCard(ctx, dt) {
    const ic = this.introCard;
    if (!ic) return;
    ic.t += dt;
    const p = ic.t / ic.dur;
    if (p >= 1) { this.introCard = null; return; }
    const a = p < 0.15 ? p / 0.15 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    const def = LEVELS[ic.idx];
    ctx.save();
    ctx.globalAlpha = a;
    const hasArt = typeof IMG !== 'undefined' && IMG.has(levelBgKey(def));
    ctx.fillStyle = hasArt ? '#000' : 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, W, H);
    // level environment artwork, slow zoom, SHARP
    if (hasArt) {
      const z = 1 + p * 0.06;
      IMG.drawCover(ctx, levelBgKey(def), (W - W * z) / 2, (H - H * z) / 2, W * z, H * z, 0.5, 0.4);
      const vg = ctx.createLinearGradient(0, H * 0.5, 0, H);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd98a'; ctx.font = 'bold 20px Georgia';
    ctx.fillText(`LEVEL ${String(ic.idx + 1).padStart(2, '0')} — PHASE ${def.phase}`, W / 2, H - 170);
    const grad = ctx.createLinearGradient(0, H - 150, 0, H - 100);
    grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(1, '#e07820');
    ctx.fillStyle = grad; ctx.font = 'bold 46px Georgia';
    ctx.fillText(def.name, W / 2, H - 116);
    ctx.fillStyle = 'rgba(245,234,208,0.7)'; ctx.font = 'italic 14px Georgia';
    ctx.fillText('TIP: ' + LEVEL_TIPS[ic.idx % LEVEL_TIPS.length], W / 2, H - 74);
    ctx.restore();
  }
  saveProgress() {
    SaveSys.data.character = this.heroId;
    SaveSys.save();
  }
  respawnAtCheckpoint() {
    const lvl = this.level;
    const cp = lvl.lastCheckpoint;
    lvl.player.dead = false;
    lvl.player.hp = lvl.player.maxHp;
    lvl.player.x = cp; lvl.player.y = 560; lvl.player.vy = 0; lvl.player.iT = 2;
    lvl.companions.forEach((c, i) => { c.hp = c.maxHp; c.downT = 0; c.x = cp - 50 - i * 45; c.y = 560; c.vy = 0; });
    // clear nearby enemies a bit
    for (const e of lvl.enemies) if (Math.abs(e.x - cp) < 300 && !e.dead) e.x += 400;
    lvl.projectiles = [];
    this.state = 'play';
    Audio2.play(lvl.def.music);
  }
  onPlayerDeath() {
    setTimeout(() => { if (this.level && this.level.player.dead) { this.state = 'death'; UI.deathIdx = 0; Audio2.play('sad'); } }, 1200);
  }
  onBossIntro(boss) {
    this.toast(boss.D.name + ' — AWAKENED');
    if (boss.type === 'vyomasuraUnbound') this.bossSplash = { t: 0, dur: 3.4, key: 'boss_unbound', name: boss.D.name };
  }
  drawBossSplash(ctx, dt) {
    const bs = this.bossSplash;
    if (!bs) return;
    bs.t += dt;
    const p = bs.t / bs.dur;
    if (p >= 1) { this.bossSplash = null; return; }
    if (typeof IMG === 'undefined' || !IMG.has(bs.key)) return;
    const a = p < 0.12 ? p / 0.12 : p > 0.8 ? Math.max(0, (1 - p) / 0.2) : 1;
    ctx.save();
    ctx.globalAlpha = a;
    const z = 1 + p * 0.07;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    IMG.drawCover(ctx, bs.key, (W - W * z) / 2, (H - H * z) / 2, W * z, H * z, 0.5, 0.4);
    const vg = ctx.createLinearGradient(0, H * 0.6, 0, H);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5560'; ctx.font = 'bold 20px Georgia';
    ctx.fillText('FINAL BATTLE', W / 2, H - 130);
    const grad = ctx.createLinearGradient(0, H - 116, 0, H - 66);
    grad.addColorStop(0, '#ffb0b8'); grad.addColorStop(1, '#c02050');
    ctx.fillStyle = grad; ctx.font = 'bold 44px Georgia';
    ctx.fillText(bs.name, W / 2, H - 78);
    ctx.restore();
  }
  onBossPhase(boss) {
    this.toast(`${boss.D.name} — PHASE ${boss.phase}`);
    if (boss.type === 'vyomasuraUnbound' && boss.phase === 4) {
      this.cine.play('lv24_stage4');
      // combined power buff
      const lvl = this.level;
      lvl.player.dmg *= 1.5; lvl.player.hp = Math.min(lvl.player.maxHp, lvl.player.hp + 50);
      lvl.player.ultCharge = 100;
      lvl.companions.forEach(c => { c.hp = Math.min(c.maxHp, c.hp + 50); c.downT = 0; });
    }
  }
  onBossDefeated(boss) {
    this.toast(boss.D.name + ' — DEFEATED!');
    Audio2.play(this.level.def.finalBoss ? 'none' : this.level.def.music);
    if (!this.level.def.finalBoss) Audio2.sfx('victory');
  }
  finishLevel() {
    const lvl = this.level;
    const idx = lvl.index;
    const after = () => {
      // record completion
      if (!SaveSys.data.completed.includes(idx)) SaveSys.data.completed.push(idx);
      if (idx + 1 > SaveSys.data.level) SaveSys.data.level = idx + 1;
      SaveSys.save();
      if (idx === 23) {
        this.state = 'gamedone'; this.gameDoneT = 0;
        Audio2.play('victory');
      } else {
        this.state = 'levelcomplete';
        UI.upgIdx = UI.UPG.length; // default on continue
        Audio2.sfx('victory');
      }
    };
    const endCine = lvl.def.cineAtEnd || lvl.def.cineEnd;
    if (endCine) {
      this.cine.play(endCine, after);
    } else after();
  }
  advanceAfterLevel() {
    const next = this.level.index + 1;
    if (next <= 23) this.launchLevel(next);
    else { this.state = 'menu'; UI.screen = 'menu'; Audio2.play('title'); }
  }

  // ---------- LOOP ----------
  loop(ts) {
    const dt = Math.min(0.033, (ts - this.lastTime) / 1000) || 0.016;
    this.lastTime = ts;
    this.t += dt;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // update subtitle
    if (this.subs.length) {
      const s = this.subs[0];
      s.age += dt;
      if (s.age > s.dur) this.subs.shift();
    }

    switch (this.state) {
      case 'title':
        UI.drawTitle(ctx, this.t);
        if (Input.hit('confirm')) {
          Audio2.unlock(); Audio2.sfx('uiConfirm'); Audio2.play('title');
          this.state = 'menu'; UI.screen = 'menu'; UI.menuIdx = 0;
        }
        break;
      case 'menu':
        if (UI.screen === 'menu') { UI.drawMenu(ctx, this.t, this); UI.menuInput(this); }
        else if (UI.screen === 'characters') { UI.drawCharSelect(ctx, this.t, this, false); UI.charSelectInput(this, false); }
        else if (UI.screen === 'story') { UI.drawStory(ctx, this.t, this); UI.storyInput(this); }
        else if (UI.screen === 'settings') { UI.drawSettings(ctx, this.t); UI.settingsInput(this); }
        else if (UI.screen === 'controls') { UI.drawControls(ctx, this.t); UI.controlsInput(this); }
        else if (UI.screen === 'credits') { UI.drawCredits(ctx, this.t); if (Input.hit('pause') || Input.hit('confirm')) { UI.screen = 'menu'; Audio2.sfx('uiBack'); } }
        else if (UI.screen === 'title') { this.state = 'title'; UI.screen = 'menu'; }
        break;
      case 'charselect':
        UI.drawCharSelect(ctx, this.t, this, true);
        UI.charSelectInput(this, true);
        break;
      case 'opening': {
        // opening cinematic over the street backdrop
        const lvl = this.openingLevel;
        lvl.scene.update(dt);
        lvl.parts.update();
        // slow camera drift
        this.cine.update(dt);
        if (this.cine.camMove) {
          const cm = this.cine.camMove;
          cm.t += dt;
          lvl.camX = lerp(lvl.camX, clamp(cm.x - W / 2, 0, lvl.scene.width - W), 0.02);
        }
        // actors idle in scene
        for (const a of [lvl.player, ...lvl.companions]) { a.t += dt; a.pose = 'idle'; }
        lvl.player.x = 560; lvl.companions.forEach((c, i) => c.x = 460 - i * 70);
        lvl.draw(ctx);
        UI.drawCineBars(ctx, this.cine.barT);
        this.cine.draw(ctx);
        UI.drawSubtitle(ctx, this.subs[0], this.t);
        break;
      }
      case 'play': {
        const lvl = this.level;
        this.cine.update(dt);
        lvl.update(dt);
        lvl.draw(ctx);
        this.drawCineActors(ctx);
        if (!this.cine.active) UI.drawHUD(ctx, this);
        UI.drawCineBars(ctx, this.cine.barT);
        this.cine.draw(ctx);
        UI.drawSubtitle(ctx, this.subs[0], this.t);
        UI.drawToasts(ctx, dt);
        this.drawIntroCard(ctx, dt);
        this.drawBossSplash(ctx, dt);
        if (Input.hit('pause') && !this.cine.active) {
          this.state = 'pause'; UI.pauseIdx = 0; Audio2.sfx('pause');
        }
        break;
      }
      case 'pause':
        this.level.draw(this.ctx);
        UI.drawHUD(ctx, this);
        UI.drawPause(ctx, this.t, this);
        UI.pauseInput(this);
        break;
      case 'pausesettings':
        this.level.draw(this.ctx);
        UI.drawSettings(ctx, this.t);
        UI.settingsInput(this);
        if (UI.screen === 'menu') { UI.screen = 'game'; this.state = 'pause'; }
        break;
      case 'death':
        this.level.update(dt * 0.2);
        this.level.draw(ctx);
        UI.drawDeath(ctx, this.t, this);
        UI.deathInput(this);
        break;
      case 'levelcomplete':
        if (this.level) this.level.draw(ctx);
        UI.drawLevelComplete(ctx, this.t, this);
        UI.levelCompleteInput(this);
        break;
      case 'gamedone': {
        // final celebration screen → credits roll
        this.gameDoneT += dt;
        if (!(typeof IMG !== 'undefined' && IMG.drawCover(ctx, 'cine_finale', 0, 0, W, H, 0.5, 0.4))) UI.drawTitleBG(ctx, this.t);
        ctx.fillStyle = 'rgba(4,3,10,0.45)'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        const grad = ctx.createLinearGradient(0, 160, 0, 260);
        grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(1, '#e07820');
        ctx.fillStyle = grad; ctx.font = 'bold 54px Georgia';
        ctx.fillText('GANAPATI BAPPA MORYA!', W / 2, 200);
        ctx.fillStyle = '#f5ead0'; ctx.font = '22px Georgia';
        ctx.fillText('The town is safe. The festival continues. The four friends stood together.', W / 2, 260);
        // four heroes lineup
        HERO_IDS.forEach((id, i) => {
          ctx.save();
          ctx.translate(W / 2 + (i - 1.5) * 160, 560);
          ctx.scale(1.45, 1.45);
          Art.hero(ctx, id, { pose: 'victory', t: this.t + i, facing: 1, emotion: 'joy', powered: true });
          ctx.restore();
        });
        ctx.fillStyle = `rgba(245,234,208,${0.5 + Math.sin(this.t * 2) * 0.3})`;
        ctx.font = '15px Verdana';
        ctx.fillText('ENTER — Credits', W / 2, H - 30);
        if (Input.hit('confirm') && this.gameDoneT > 2) {
          this.state = 'menu'; UI.screen = 'credits'; Audio2.sfx('uiConfirm');
        }
        break;
      }
    }

    Input.endFrame();
    requestAnimationFrame(ts2 => this.loop(ts2));
  }

  // draw cinematic-only Vyomasura when scripted into scene
  drawCineActors(ctx) {
    const lvl = this.level;
    if (lvl && lvl.cineVyo) {
      const v = lvl.cineVyo;
      v.t = (v.t || 0) + 0.016;
      ctx.save();
      const rise = v.rise ? Math.min(1, v.t / 2) : 1;
      ctx.translate(v.x - lvl.camX, 620 - lvl.camY + (1 - ease(rise)) * 220);
      ctx.globalAlpha = ease(rise);
      Art.vyomasura(ctx, { t: v.t, pose: 'idle', facing: lvl.player.x < v.x ? -1 : 1, form: 1 });
      ctx.restore();
    }
  }
}

// boot
window.addEventListener('load', () => { window.game = new Game(); });
