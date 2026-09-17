// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — ui.js
// Main menu, character select, settings, controls remap, HUD,
// subtitles, pause, level select/story, credits, cinematic bars.
// ============================================================
'use strict';

const UI = {
  menuIdx: 0, subIdx: 0, screen: 'title', t: 0,
  charIdx: 0, settingIdx: 0, controlIdx: 0, awaitingKey: false,
  storyScroll: 0, levelIdx: 0,
  toasts: [],

  fontTitle(s) { return `bold ${s}px Georgia, serif`; },
  font(s, bold) { return `${bold ? 'bold ' : ''}${s}px Verdana, sans-serif`; },

  drawTitleBG(ctx, t) {
    // festival night gradient + silhouette skyline + idol glow
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0f2e'); g.addColorStop(0.6, '#2a1e48'); g.addColorStop(1, '#4a2a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars
    const rng = makeRng(42);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 70; i++) {
      ctx.globalAlpha = 0.3 + Math.sin(t * 1.6 + i * 2) * 0.25;
      ctx.fillRect(rng() * W, rng() * H * 0.45, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
    // skyline
    ctx.fillStyle = '#151230';
    const r2 = makeRng(7);
    for (let x = 0; x < W; x += 60) {
      const bh = 80 + r2() * 140;
      ctx.fillRect(x, H - 160 - bh, 56, bh + 160);
    }
    // temple center silhouette
    ctx.save(); ctx.translate(W / 2, H - 130); ctx.scale(0.9, 0.9); ctx.globalAlpha = 0.9;
    Props.temple(ctx, 3, 1, false); ctx.restore(); ctx.globalAlpha = 1;
    // idol with glow
    ctx.save(); ctx.translate(W / 2, H - 40);
    Props.ganeshIdolLarge(ctx, 0.85, 0.7 + Math.sin(t * 1.5) * 0.3);
    ctx.restore();
    // fairy lights
    ctx.save(); ctx.translate(W / 2, 60); Props.fairyLights(ctx, W * 0.9, t, false); ctx.restore();
    // floating diya petals
    const r3 = makeRng(13);
    for (let i = 0; i < 14; i++) {
      const px = (r3() * W + t * (12 + r3() * 20)) % W;
      const py = H * 0.3 + Math.sin(t * 0.7 + i * 2) * 60 + r3() * H * 0.4;
      ctx.fillStyle = `rgba(245,166,35,${0.35 + Math.sin(t + i) * 0.18})`;
      ctx.beginPath(); ctx.ellipse(px, py, 4, 2.2, Math.sin(t + i), 0, TAU); ctx.fill();
    }
    // vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  },

  drawTitle(ctx, t) {
    this.drawTitleBG(ctx, t);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,180,64,0.14)';
    ctx.font = this.fontTitle(66);
    ctx.fillText('GANESH CHATURTHI', W / 2 + 3, 173);
    const grad = ctx.createLinearGradient(0, 110, 0, 190);
    grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(0.6, '#ffb340'); grad.addColorStop(1, '#e07820');
    ctx.fillStyle = grad;
    ctx.font = this.fontTitle(64);
    ctx.fillText('GANESH CHATURTHI', W / 2, 170);
    ctx.fillStyle = '#f5ead0';
    ctx.font = this.fontTitle(34);
    ctx.fillText('T H E   L A S T   N I G H T', W / 2, 224);
    ctx.strokeStyle = 'rgba(255,180,64,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 300, 245); ctx.lineTo(W / 2 + 300, 245); ctx.stroke();
    ctx.fillStyle = `rgba(245,234,208,${0.55 + Math.sin(t * 2.4) * 0.35})`;
    ctx.font = this.font(19);
    ctx.fillText('Press  ENTER / J', W / 2, H - 84);
    ctx.fillStyle = 'rgba(245,234,208,0.4)';
    ctx.font = this.font(12);
    ctx.fillText('A 2D cinematic action-adventure of four friends, one festival, and one last night.', W / 2, H - 46);
  },

  MENU: ['PLAY', 'CHARACTERS', 'STORY', 'SETTINGS', 'CONTROLS', 'CREDITS', 'QUIT'],
  drawMenu(ctx, t, game) {
    this.drawTitleBG(ctx, t);
    ctx.textAlign = 'center';
    const grad = ctx.createLinearGradient(0, 60, 0, 120);
    grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(1, '#e07820');
    ctx.fillStyle = grad; ctx.font = this.fontTitle(42);
    ctx.fillText('GANESH CHATURTHI: THE LAST NIGHT', W / 2, 100);
    const hasSave = SaveSys.data.level > 0 || SaveSys.data.character;
    this.MENU.forEach((m, i) => {
      const y = 210 + i * 58;
      const sel = i === this.menuIdx;
      let label = m;
      if (m === 'PLAY' && hasSave) label = `CONTINUE — LEVEL ${Math.min(24, SaveSys.data.level + 1)}`;
      if (sel) {
        rr(ctx, W / 2 - 240, y - 30, 480, 44, 10);
        ctx.fillStyle = 'rgba(255,180,64,0.16)'; ctx.fill();
        ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#ffb340'; ctx.font = this.font(20, true);
        ctx.fillText('❖  ' + label + '  ❖', W / 2, y);
      } else {
        ctx.fillStyle = 'rgba(245,234,208,0.7)'; ctx.font = this.font(18);
        ctx.fillText(label, W / 2, y);
      }
    });
    if (hasSave && this.menuIdx === 0) {
      ctx.fillStyle = 'rgba(245,234,208,0.45)'; ctx.font = this.font(12);
      ctx.fillText('Hold BACKSPACE on PLAY to start a NEW GAME (wipes progress)', W / 2, 210 + 7 * 58);
    }
    ctx.fillStyle = 'rgba(245,234,208,0.4)'; ctx.font = this.font(12);
    ctx.fillText('W/S — navigate    ENTER/J — select    ESC — back', W / 2, H - 28);
  },
  menuInput(game) {
    if (Input.hit('jump') || Input.pressed['ArrowUp'] || Input.pressed['KeyW']) { this.menuIdx = (this.menuIdx + this.MENU.length - 1) % this.MENU.length; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.menuIdx = (this.menuIdx + 1) % this.MENU.length; Audio2.sfx('ui'); }
    if (Input.pressed['Backspace'] && this.menuIdx === 0) { SaveSys.wipeProgress(); game.toast('New game — progress reset'); Audio2.sfx('uiBack'); }
    if (Input.hit('confirm')) {
      Audio2.sfx('uiConfirm');
      const m = this.MENU[this.menuIdx];
      if (m === 'PLAY') game.startPlayFlow();
      else if (m === 'CHARACTERS') { this.screen = 'characters'; this.charIdx = 0; }
      else if (m === 'STORY') { this.screen = 'story'; this.levelIdx = 0; }
      else if (m === 'SETTINGS') { this.screen = 'settings'; this.settingIdx = 0; }
      else if (m === 'CONTROLS') { this.screen = 'controls'; this.controlIdx = 0; }
      else if (m === 'CREDITS') this.screen = 'credits';
      else if (m === 'QUIT') this.screen = 'title';
    }
  },

  // ---------------- CHARACTER SELECT ----------------
  drawCharSelect(ctx, t, game, selectMode) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#100c22'); g.addColorStop(1, '#2c1a30');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // decorative lights
    ctx.save(); ctx.translate(W / 2, 26); Props.fairyLights(ctx, W * 0.95, t, false); ctx.restore();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb340'; ctx.font = this.fontTitle(34);
    ctx.fillText(selectMode ? 'CHOOSE YOUR HERO' : 'THE FOUR FRIENDS', W / 2, 84);
    ctx.fillStyle = 'rgba(245,234,208,0.55)'; ctx.font = this.font(13);
    ctx.fillText(selectMode ? 'Migilina muggure AI companions ga follow avutaru' : 'Character bible — locked identities', W / 2, 110);

    const cw = 250;
    HERO_IDS.forEach((id, i) => {
      const C = CHARS[id];
      const x = W / 2 + (i - 1.5) * (cw + 22);
      const sel = i === this.charIdx;
      const y0 = 140;
      rr(ctx, x - cw / 2, y0, cw, 470, 14);
      ctx.fillStyle = sel ? 'rgba(255,180,64,0.12)' : 'rgba(255,255,255,0.04)';
      ctx.fill();
      ctx.strokeStyle = sel ? '#ffb340' : 'rgba(255,255,255,0.14)';
      ctx.lineWidth = sel ? 2.5 : 1; ctx.stroke();
      // character render — idle pose, victory anim if selected
      ctx.save();
      ctx.translate(x, y0 + 320);
      ctx.scale(1.6, 1.6);
      Art.hero(ctx, id, {
        pose: sel ? (this.selAnimT > 0 ? 'victory' : 'idle') : 'idle',
        t: t + i * 1.7, facing: 1, emotion: sel ? 'happy' : 'neutral',
        powered: sel && this.selAnimT > 0, blink: Math.sin(t * 0.9 + i * 3) > 0.97,
      });
      ctx.restore();
      // name plate
      ctx.fillStyle = sel ? '#ffb340' : '#f5ead0';
      ctx.font = this.font(22, true);
      ctx.fillText(C.name, x, y0 + 375);
      ctx.fillStyle = 'rgba(245,234,208,0.75)'; ctx.font = this.font(13, true);
      ctx.fillText(C.role, x, y0 + 397);
      ctx.fillStyle = C.aura; ctx.font = this.font(12);
      ctx.fillText('✦ ' + C.power, x, y0 + 418);
      ctx.fillStyle = 'rgba(245,234,208,0.55)'; ctx.font = this.font(10);
      const lines = wrapText(ctx, C.desc, cw - 30);
      lines.forEach((ln, li) => ctx.fillText(ln, x, y0 + 438 + li * 13));
    });
    // detail strip for selected
    const C = CHARS[HERO_IDS[this.charIdx]];
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(ctx, W / 2 - 470, 622, 940, 62, 10); ctx.fill();
    ctx.fillStyle = '#ffd98a'; ctx.font = this.font(13, true);
    ctx.fillText(`ULTIMATE: ${C.ult}`, W / 2, 646);
    ctx.fillStyle = 'rgba(245,234,208,0.7)'; ctx.font = this.font(11);
    ctx.fillText('Abilities: ' + C.abilities.join('  •  '), W / 2, 668);
    ctx.fillStyle = 'rgba(245,234,208,0.4)'; ctx.font = this.font(12);
    ctx.fillText(selectMode ? 'A/D — choose    ENTER/J — confirm' : 'A/D — view    ESC — back', W / 2, H - 8);
    if (this.selAnimT > 0) this.selAnimT -= 0.016;
  },
  charSelectInput(game, selectMode) {
    if (Input.hit('left')) { this.charIdx = (this.charIdx + 3) % 4; Audio2.sfx('ui'); }
    if (Input.hit('right')) { this.charIdx = (this.charIdx + 1) % 4; Audio2.sfx('ui'); }
    if (Input.hit('confirm') && selectMode) {
      if (this.selAnimT > 0) return;
      this.selAnimT = 1.2;
      Audio2.sfx('power');
      const id = HERO_IDS[this.charIdx];
      setTimeout(() => { game.confirmHero(id); }, 900);
    }
    if (Input.hit('pause')) { Audio2.sfx('uiBack'); this.screen = 'menu'; }
  },

  // ---------------- STORY / LEVEL SELECT ----------------
  drawStory(ctx, t, game) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0a1c'); g.addColorStop(1, '#241630');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb340'; ctx.font = this.fontTitle(30);
    ctx.fillText('STORY — THREE PHASES, 24 LEVELS', W / 2, 60);
    const completed = new Set(SaveSys.data.completed);
    const cur = SaveSys.data.level;
    const phases = ['PHASE 1 — THE FESTIVAL', 'PHASE 2 — THE AWAKENING', 'PHASE 3 — THE FINAL NIGHT'];
    const phaseCol = ['#ffb340', '#a05fff', '#ff5560'];
    for (let p = 0; p < 3; p++) {
      const y0 = 108 + p * 190;
      ctx.fillStyle = phaseCol[p]; ctx.font = this.font(16, true); ctx.textAlign = 'left';
      ctx.fillText(phases[p], 90, y0);
      for (let i = 0; i < 8; i++) {
        const li = p * 8 + i;
        const x = 110 + i * 140, y = y0 + 30;
        const done = completed.includes ? completed.includes(li) : completed.has(li);
        const unlocked = li <= cur;
        const sel = li === this.levelIdx;
        rr(ctx, x, y, 120, 92, 8);
        ctx.fillStyle = sel ? 'rgba(255,180,64,0.18)' : done ? 'rgba(120,220,150,0.09)' : unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
        ctx.fill();
        ctx.strokeStyle = sel ? '#ffb340' : done ? 'rgba(120,220,150,0.5)' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = sel ? 2 : 1; ctx.stroke();
        ctx.fillStyle = unlocked ? '#f5ead0' : 'rgba(245,234,208,0.25)';
        ctx.font = this.font(20, true); ctx.textAlign = 'center';
        ctx.fillText(String(li + 1), x + 60, y + 34);
        ctx.font = this.font(8.5);
        const nm = LEVELS[li].name;
        wrapText(ctx, unlocked ? nm : '? ? ?', 106).slice(0, 2).forEach((ln, k) => ctx.fillText(ln, x + 60, y + 54 + k * 12));
        if (done) { ctx.fillStyle = '#7adc96'; ctx.font = this.font(12, true); ctx.fillText('✓', x + 106, y + 16); }
        if (!unlocked) { ctx.fillStyle = 'rgba(245,234,208,0.3)'; ctx.font = this.font(11); ctx.fillText('🔒', x + 60, y + 82); }
      }
    }
    ctx.fillStyle = 'rgba(245,234,208,0.4)'; ctx.font = this.font(12); ctx.textAlign = 'center';
    ctx.fillText('A/D/W/S — navigate    ENTER/J — replay unlocked level    ESC — back', W / 2, H - 16);
  },
  storyInput(game) {
    if (Input.hit('left')) { this.levelIdx = Math.max(0, this.levelIdx - 1); Audio2.sfx('ui'); }
    if (Input.hit('right')) { this.levelIdx = Math.min(23, this.levelIdx + 1); Audio2.sfx('ui'); }
    if (Input.hit('jump')) { this.levelIdx = Math.max(0, this.levelIdx - 8); Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.levelIdx = Math.min(23, this.levelIdx + 8); Audio2.sfx('ui'); }
    if (Input.hit('confirm') && this.levelIdx <= SaveSys.data.level) {
      Audio2.sfx('uiConfirm');
      game.playLevelIndex = this.levelIdx;
      if (!SaveSys.data.character) { game.selectingFor = 'replay'; game.state = 'charselect'; }
      else game.launchLevel(this.levelIdx);
    }
    if (Input.hit('pause')) { Audio2.sfx('uiBack'); this.screen = 'menu'; }
  },

  // ---------------- SETTINGS ----------------
  SETTINGS: [
    ['Master Volume', 'master', 'vol'], ['Music Volume', 'music', 'vol'], ['SFX Volume', 'sfx', 'vol'],
    ['Dialogue Volume', 'dialogueVol', 'vol'], ['Subtitles', 'subtitles', 'bool'], ['Subtitle Size', 'subSize', 'size'],
    ['Graphics Quality', 'quality', 'quality'], ['Screen Shake', 'shake', 'bool'], ['Camera Effects', 'camFx', 'bool'],
    ['Language', 'language', 'lang'], ['Reset Settings', null, 'reset'],
  ],
  drawSettings(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0a1c'); g.addColorStop(1, '#241630');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb340'; ctx.font = this.fontTitle(34);
    ctx.fillText('SETTINGS', W / 2, 80);
    const s = SaveSys.data.settings;
    this.SETTINGS.forEach(([label, key, type], i) => {
      const y = 140 + i * 46;
      const sel = i === this.settingIdx;
      if (sel) { rr(ctx, W / 2 - 320, y - 24, 640, 36, 8); ctx.fillStyle = 'rgba(255,180,64,0.12)'; ctx.fill(); }
      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#ffb340' : 'rgba(245,234,208,0.75)';
      ctx.font = this.font(16, sel);
      ctx.fillText(label, W / 2 - 300, y);
      ctx.textAlign = 'right';
      let val = '';
      if (type === 'vol') {
        // slider
        const v = s[key];
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        rr(ctx, W / 2 + 80, y - 10, 200, 8, 4); ctx.fill();
        ctx.fillStyle = sel ? '#ffb340' : '#c9a25c';
        rr(ctx, W / 2 + 80, y - 10, 200 * v, 8, 4); ctx.fill();
        val = Math.round(v * 100) + '%';
      } else if (type === 'bool') val = s[key] ? 'ON' : 'OFF';
      else if (type === 'size') val = ['SMALL', 'MEDIUM', 'LARGE'][s[key]];
      else if (type === 'quality') val = ['LOW', 'MEDIUM', 'HIGH'][s[key]];
      else if (type === 'lang') val = s[key] === 'tenglish' ? 'TENGLISH' : 'ENGLISH';
      else if (type === 'reset') val = sel ? '← press ENTER →' : '';
      ctx.fillStyle = sel ? '#ffe9b0' : 'rgba(245,234,208,0.6)';
      ctx.font = this.font(15, true);
      ctx.fillText(val, W / 2 + 320, y);
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,234,208,0.4)'; ctx.font = this.font(12);
    ctx.fillText('W/S — navigate    A/D — adjust    ESC — back (auto-saves)', W / 2, H - 24);
  },
  settingsInput(game) {
    const n = this.SETTINGS.length;
    if (Input.hit('jump')) { this.settingIdx = (this.settingIdx + n - 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.settingIdx = (this.settingIdx + 1) % n; Audio2.sfx('ui'); }
    const [label, key, type] = this.SETTINGS[this.settingIdx];
    const s = SaveSys.data.settings;
    const dir = Input.hit('right') ? 1 : Input.hit('left') ? -1 : 0;
    if (dir) {
      Audio2.sfx('ui');
      if (type === 'vol') s[key] = clamp(Math.round((s[key] + dir * 0.1) * 10) / 10, 0, 1);
      else if (type === 'bool') s[key] = !s[key];
      else if (type === 'size') s[key] = clamp(s[key] + dir, 0, 2);
      else if (type === 'quality') s[key] = clamp(s[key] + dir, 0, 2);
      else if (type === 'lang') s[key] = s[key] === 'tenglish' ? 'english' : 'tenglish';
      Audio2.applyVolumes();
    }
    if (Input.hit('confirm') && type === 'reset') {
      SaveSys.data.settings = SaveSys.fresh().settings;
      Audio2.applyVolumes(); Audio2.sfx('uiConfirm');
      game.toast('Settings reset');
    }
    if (Input.hit('pause')) { SaveSys.save(); Audio2.sfx('uiBack'); this.screen = 'menu'; }
  },

  // ---------------- CONTROLS ----------------
  CONTROLS: [['Move Left', 'left'], ['Move Right', 'right'], ['Jump', 'jump'], ['Down / Drop', 'down'],
  ['Basic Attack', 'attack'], ['Special Attack', 'special'], ['Ultimate', 'ultimate'], ['Dash / Dodge', 'dash'], ['Interact', 'interact']],
  drawControls(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d0a1c'); g.addColorStop(1, '#241630');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb340'; ctx.font = this.fontTitle(34);
    ctx.fillText('CONTROLS', W / 2, 80);
    this.CONTROLS.forEach(([label, action], i) => {
      const y = 150 + i * 50;
      const sel = i === this.controlIdx;
      if (sel) { rr(ctx, W / 2 - 280, y - 26, 560, 40, 8); ctx.fillStyle = 'rgba(255,180,64,0.12)'; ctx.fill(); }
      ctx.textAlign = 'left';
      ctx.fillStyle = sel ? '#ffb340' : 'rgba(245,234,208,0.75)';
      ctx.font = this.font(17, sel);
      ctx.fillText(label, W / 2 - 250, y);
      ctx.textAlign = 'right';
      rr(ctx, W / 2 + 150, y - 22, 110, 32, 6);
      ctx.fillStyle = sel && this.awaitingKey ? 'rgba(255,180,64,0.3)' : 'rgba(255,255,255,0.08)'; ctx.fill();
      ctx.strokeStyle = sel ? '#ffb340' : 'rgba(255,255,255,0.2)'; ctx.stroke();
      ctx.fillStyle = '#ffe9b0'; ctx.font = this.font(14, true); ctx.textAlign = 'center';
      ctx.fillText(sel && this.awaitingKey ? '...' : Input.keyName(action), W / 2 + 205, y);
    });
    ctx.fillStyle = 'rgba(245,234,208,0.4)'; ctx.font = this.font(12);
    ctx.fillText(this.awaitingKey ? 'Press any key to bind...' : 'W/S — navigate    ENTER/J — remap    ESC — back', W / 2, H - 24);
    ctx.fillText('ESC — Pause is fixed', W / 2, H - 46);
  },
  controlsInput(game) {
    if (this.awaitingKey) {
      if (Input.lastCode && Input.lastCode !== 'Escape') {
        Input.rebind(this.CONTROLS[this.controlIdx][1], Input.lastCode);
        this.awaitingKey = false; SaveSys.save(); Audio2.sfx('uiConfirm');
      } else if (Input.lastCode === 'Escape') this.awaitingKey = false;
      return;
    }
    const n = this.CONTROLS.length;
    if (Input.hit('jump')) { this.controlIdx = (this.controlIdx + n - 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.controlIdx = (this.controlIdx + 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('confirm')) { this.awaitingKey = true; Audio2.sfx('ui'); }
    if (Input.hit('pause')) { Audio2.sfx('uiBack'); this.screen = 'menu'; }
  },

  // ---------------- CREDITS ----------------
  drawCredits(ctx, t) {
    this.drawTitleBG(ctx, t);
    ctx.fillStyle = 'rgba(6,5,14,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    const lines = [
      ['GANESH CHATURTHI: THE LAST NIGHT', 30, '#ffb340'],
      ['', 14], ['A 2D Cinematic Action-Adventure', 16, '#f5ead0'],
      ['', 14],
      ['THE FOUR FRIENDS', 18, '#ffd98a'],
      ['Aditya — The Leader • Vighnesha Force', 14],
      ['Arjun — The Joker • Vakratunda Dash', 14],
      ['Ravi — The Brain • Modaka Pulse', 14],
      ['Kiran — The Wall • Gajashakti', 14],
      ['', 14],
      ['ANTAGONIST', 18, '#a05fff'],
      ['Vyomasura — The Forgotten Guardian', 14],
      ['', 14],
      ['Made with friendship, courage, faith and hope.', 14, '#ffd98a'],
      ['Ganapati Bappa Morya!', 20, '#ffb340'],
      ['', 14], ['ESC — back', 12, 'rgba(245,234,208,0.4)'],
    ];
    let y = 120;
    for (const [txt, sz, col] of lines) {
      ctx.fillStyle = col || 'rgba(245,234,208,0.8)';
      ctx.font = sz >= 18 ? this.fontTitle(sz) : this.font(sz);
      if (txt) ctx.fillText(txt, W / 2, y);
      y += sz * 1.7;
    }
  },

  // ---------------- HUD ----------------
  drawHUD(ctx, game) {
    const lvl = game.level, p = lvl.player;
    const C = p.C;
    // --- portrait plate ---
    ctx.save();
    rr(ctx, 16, 14, 320, 86, 12);
    ctx.fillStyle = 'rgba(10,8,20,0.62)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,180,64,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
    // portrait
    ctx.save();
    rr(ctx, 24, 22, 70, 70, 10); ctx.clip();
    ctx.fillStyle = '#241a30'; ctx.fillRect(24, 22, 70, 70);
    ctx.translate(59, 148); ctx.scale(1.15, 1.15);
    Art.hero(ctx, p.id, { pose: 'idle', t: lvl.scene.t, facing: 1, emotion: p.emotion, powered: false });
    ctx.restore();
    rr(ctx, 24, 22, 70, 70, 10); ctx.strokeStyle = C.aura; ctx.lineWidth = 2; ctx.stroke();
    // name
    ctx.fillStyle = '#ffe9b0'; ctx.font = this.font(13, true); ctx.textAlign = 'left';
    ctx.fillText(C.name, 104, 36);
    // health
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, 104, 44, 216, 13, 6); ctx.fill();
    const hpF = clamp(p.hp / p.maxHp, 0, 1);
    const hg = ctx.createLinearGradient(104, 0, 320, 0);
    hg.addColorStop(0, hpF > 0.35 ? '#5ad06a' : '#e05545'); hg.addColorStop(1, hpF > 0.35 ? '#8ae06a' : '#ff8a5c');
    ctx.fillStyle = hg; rr(ctx, 104, 44, 216 * hpF, 13, 6); ctx.fill();
    // energy
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, 104, 61, 216, 9, 4); ctx.fill();
    ctx.fillStyle = '#5cb5ff'; rr(ctx, 104, 61, 216 * clamp(p.en / p.maxEn, 0, 1), 9, 4); ctx.fill();
    // ult meter
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, 104, 74, 216, 9, 4); ctx.fill();
    const uF = p.ultCharge / 100;
    ctx.fillStyle = uF >= 1 ? `rgba(255,${180 + Math.sin(lvl.scene.t * 8) * 60},64,1)` : C.aura;
    rr(ctx, 104, 74, 216 * clamp(uF, 0, 1), 9, 4); ctx.fill();
    if (uF >= 1) { ctx.fillStyle = '#fff'; ctx.font = this.font(8, true); ctx.fillText('ULT READY — ' + Input.keyName('ultimate'), 160, 81.5); }
    ctx.restore();

    // --- companion pips ---
    lvl.companions.forEach((c, i) => {
      const x = 26 + i * 78, y = 112;
      rr(ctx, x, y, 70, 26, 8);
      ctx.fillStyle = 'rgba(10,8,20,0.55)'; ctx.fill();
      ctx.strokeStyle = c.downT > 0 ? 'rgba(255,90,90,0.7)' : 'rgba(255,255,255,0.18)'; ctx.stroke();
      ctx.fillStyle = CHARS[c.id].aura; ctx.font = this.font(9, true); ctx.textAlign = 'left';
      ctx.fillText(CHARS[c.id].name.slice(0, 5), x + 6, y + 11);
      ctx.fillStyle = 'rgba(255,255,255,0.14)'; rr(ctx, x + 6, y + 15, 58, 6, 3); ctx.fill();
      ctx.fillStyle = c.downT > 0 ? '#e05545' : '#5ad06a';
      rr(ctx, x + 6, y + 15, 58 * clamp(c.hp / c.maxHp, 0, 1), 6, 3); ctx.fill();
      if (c.downT > 0) { ctx.fillStyle = '#ff9a8a'; ctx.font = this.font(8, true); ctx.fillText(Math.ceil(c.downT) + 's', x + 52, y + 11); }
    });

    // --- objective ---
    ctx.textAlign = 'right';
    rr(ctx, W - 476, 14, 460, 54, 10);
    ctx.fillStyle = 'rgba(10,8,20,0.55)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,180,64,0.3)'; ctx.stroke();
    ctx.fillStyle = '#ffd98a'; ctx.font = this.font(10, true);
    ctx.fillText(`LEVEL ${lvl.index + 1} / 24 — ${lvl.def.name}`, W - 30, 33);
    ctx.fillStyle = 'rgba(245,234,208,0.85)'; ctx.font = this.font(11);
    ctx.fillText(lvl.objectiveText, W - 30, 52);
    // shards
    ctx.fillStyle = '#ffd98a'; ctx.font = this.font(11, true);
    ctx.fillText(`✦ ${SaveSys.data.shards}`, W - 30, 86);
    // pause hint
    ctx.fillStyle = 'rgba(245,234,208,0.35)'; ctx.font = this.font(10);
    ctx.fillText('ESC — Pause', W - 30, H - 12);

    // --- boss bar ---
    if (lvl.boss && !lvl.boss.dead && lvl.bossActive) {
      const b = lvl.boss;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd0d0'; ctx.font = this.fontTitle(17);
      ctx.fillText(b.D.name, W / 2, H - 74);
      ctx.fillStyle = 'rgba(10,8,20,0.7)'; rr(ctx, W / 2 - 300, H - 62, 600, 18, 9); ctx.fill();
      const bg = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
      bg.addColorStop(0, '#c02050'); bg.addColorStop(1, '#ff5560');
      ctx.fillStyle = bg;
      rr(ctx, W / 2 - 297, H - 59, 594 * clamp(b.hp / b.maxHp, 0, 1), 12, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,120,120,0.5)'; rr(ctx, W / 2 - 300, H - 62, 600, 18, 9); ctx.stroke();
      // phase pips
      for (let i = 0; i < b.D.phases; i++) {
        ctx.fillStyle = i < b.phase ? '#ff8a90' : 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.arc(W / 2 - 30 + i * 20, H - 32, 5, 0, TAU); ctx.fill();
      }
    }
  },

  // ---------------- SUBTITLES ----------------
  drawSubtitle(ctx, sub, t) {
    if (!sub || !SaveSys.data.settings.subtitles) return;
    const size = [15, 18, 22][SaveSys.data.settings.subSize];
    ctx.font = this.font(size);
    const maxW = W * 0.62;
    const lines = wrapText(ctx, sub.text, maxW);
    const lh = size * 1.4;
    const boxH = lines.length * lh + 44;
    const y0 = H - 60 - boxH;
    const alpha = Math.min(1, sub.age * 5) * (sub.dur - sub.age < 0.3 ? Math.max(0, (sub.dur - sub.age) / 0.3) : 1);
    ctx.globalAlpha = alpha;
    const bw = Math.max(...lines.map(l => ctx.measureText(l).width), ctx.measureText(sub.who).width) + 70;
    rr(ctx, W / 2 - bw / 2, y0, bw, boxH, 12);
    ctx.fillStyle = 'rgba(8,6,16,0.78)'; ctx.fill();
    const col = sub.who === 'VYOMASURA' ? '#c46bff' : sub.hero ? CHARS[sub.hero].aura : '#ffd98a';
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = col; ctx.font = this.font(size * 0.72, true);
    ctx.fillText(sub.who, W / 2, y0 + 22);
    ctx.fillStyle = '#f5f0e4'; ctx.font = this.font(size);
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, y0 + 44 + i * lh));
    ctx.globalAlpha = 1;
  },

  // ---------------- PAUSE ----------------
  PAUSE: ['RESUME', 'RESTART FROM CHECKPOINT', 'RESTART LEVEL', 'SETTINGS', 'MAIN MENU'],
  pauseIdx: 0,
  drawPause(ctx, t, game) {
    ctx.fillStyle = 'rgba(5,4,12,0.72)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb340'; ctx.font = this.fontTitle(40);
    ctx.fillText('PAUSED', W / 2, 180);
    ctx.fillStyle = 'rgba(245,234,208,0.5)'; ctx.font = this.font(13);
    ctx.fillText(`LEVEL ${game.level.index + 1} — ${game.level.def.name}`, W / 2, 212);
    this.PAUSE.forEach((m, i) => {
      const y = 290 + i * 54;
      const sel = i === this.pauseIdx;
      if (sel) {
        rr(ctx, W / 2 - 220, y - 28, 440, 40, 8);
        ctx.fillStyle = 'rgba(255,180,64,0.15)'; ctx.fill();
        ctx.strokeStyle = '#ffb340'; ctx.stroke();
      }
      ctx.fillStyle = sel ? '#ffb340' : 'rgba(245,234,208,0.7)';
      ctx.font = this.font(17, sel);
      ctx.fillText(m, W / 2, y);
    });
  },
  pauseInput(game) {
    const n = this.PAUSE.length;
    if (Input.hit('jump')) { this.pauseIdx = (this.pauseIdx + n - 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.pauseIdx = (this.pauseIdx + 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('pause')) { game.state = 'play'; Audio2.sfx('uiBack'); }
    if (Input.hit('confirm')) {
      Audio2.sfx('uiConfirm');
      const m = this.PAUSE[this.pauseIdx];
      if (m === 'RESUME') game.state = 'play';
      else if (m === 'RESTART FROM CHECKPOINT') game.respawnAtCheckpoint();
      else if (m === 'RESTART LEVEL') game.launchLevel(game.level.index);
      else if (m === 'SETTINGS') { this.screen = 'settings'; this.settingIdx = 0; game.state = 'pausesettings'; }
      else if (m === 'MAIN MENU') { game.state = 'menu'; this.screen = 'menu'; Audio2.play('title'); game.saveProgress(); }
    }
  },

  // ---------------- DEATH ----------------
  DEATH: ['CONTINUE (checkpoint)', 'RESTART LEVEL', 'MAIN MENU'],
  deathIdx: 0,
  drawDeath(ctx, t, game) {
    ctx.fillStyle = 'rgba(10,4,8,0.8)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5560'; ctx.font = this.fontTitle(44);
    ctx.fillText('PADIPOYARU...', W / 2, 240);
    ctx.fillStyle = 'rgba(245,234,208,0.6)'; ctx.font = this.font(14);
    ctx.fillText('Kaani okka checkpoint tho malli lechipovachu. Friends waiting.', W / 2, 278);
    this.DEATH.forEach((m, i) => {
      const y = 360 + i * 54;
      const sel = i === this.deathIdx;
      if (sel) { rr(ctx, W / 2 - 220, y - 28, 440, 40, 8); ctx.fillStyle = 'rgba(255,90,96,0.14)'; ctx.fill(); ctx.strokeStyle = '#ff5560'; ctx.stroke(); }
      ctx.fillStyle = sel ? '#ff8a90' : 'rgba(245,234,208,0.7)';
      ctx.font = this.font(17, sel);
      ctx.fillText(m, W / 2, y);
    });
  },
  deathInput(game) {
    const n = this.DEATH.length;
    if (Input.hit('jump')) { this.deathIdx = (this.deathIdx + n - 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.deathIdx = (this.deathIdx + 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('confirm')) {
      Audio2.sfx('uiConfirm');
      const m = this.DEATH[this.deathIdx];
      if (m.startsWith('CONTINUE')) game.respawnAtCheckpoint();
      else if (m === 'RESTART LEVEL') game.launchLevel(game.level.index);
      else { game.state = 'menu'; this.screen = 'menu'; Audio2.play('title'); }
    }
  },

  // ---------------- LEVEL COMPLETE / UPGRADE ----------------
  UPG: [['+25 Max Health', 'health'], ['+25 Max Energy', 'energy'], ['+20% Power Damage', 'power'], ['+Ult Charge Rate', 'ultimate'], ['+8% Move Speed', 'speed']],
  upgIdx: 0,
  drawLevelComplete(ctx, t, game) {
    ctx.fillStyle = 'rgba(6,8,14,0.82)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    const grad = ctx.createLinearGradient(0, 120, 0, 180);
    grad.addColorStop(0, '#ffe9b0'); grad.addColorStop(1, '#e07820');
    ctx.fillStyle = grad; ctx.font = this.fontTitle(40);
    ctx.fillText('LEVEL COMPLETE!', W / 2, 150);
    ctx.fillStyle = 'rgba(245,234,208,0.75)'; ctx.font = this.font(15);
    ctx.fillText(`${game.level.def.name} — cleared`, W / 2, 186);
    ctx.fillStyle = '#ffd98a'; ctx.font = this.font(14, true);
    ctx.fillText(`✦ Divine Shards: ${SaveSys.data.shards}`, W / 2, 220);
    ctx.fillStyle = 'rgba(245,234,208,0.65)'; ctx.font = this.font(13);
    ctx.fillText('Spend 3 shards on an upgrade — or continue:', W / 2, 258);
    const opts = [...this.UPG.map(u => u[0] + '  (3 ✦)'), 'CONTINUE →'];
    opts.forEach((m, i) => {
      const y = 300 + i * 48;
      const sel = i === this.upgIdx;
      const afford = i === opts.length - 1 || SaveSys.data.shards >= 3;
      if (sel) { rr(ctx, W / 2 - 240, y - 26, 480, 38, 8); ctx.fillStyle = 'rgba(255,180,64,0.14)'; ctx.fill(); ctx.strokeStyle = '#ffb340'; ctx.stroke(); }
      ctx.fillStyle = sel ? (afford ? '#ffb340' : '#886644') : afford ? 'rgba(245,234,208,0.7)' : 'rgba(245,234,208,0.3)';
      ctx.font = this.font(15, sel);
      ctx.fillText(m, W / 2, y);
      if (i < this.UPG.length) {
        ctx.fillStyle = 'rgba(140,220,160,0.7)'; ctx.font = this.font(11);
        ctx.fillText('Lv ' + SaveSys.data.upgrades[this.UPG[i][1]], W / 2 + 270, y);
      }
    });
  },
  levelCompleteInput(game) {
    const n = this.UPG.length + 1;
    if (Input.hit('jump')) { this.upgIdx = (this.upgIdx + n - 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('down')) { this.upgIdx = (this.upgIdx + 1) % n; Audio2.sfx('ui'); }
    if (Input.hit('confirm')) {
      if (this.upgIdx < this.UPG.length) {
        if (SaveSys.data.shards >= 3) {
          SaveSys.data.shards -= 3;
          SaveSys.data.upgrades[this.UPG[this.upgIdx][1]]++;
          SaveSys.save(); Audio2.sfx('power');
          game.toast('Upgrade unlocked!');
        } else Audio2.sfx('uiBack');
      } else {
        Audio2.sfx('uiConfirm');
        game.advanceAfterLevel();
      }
    }
  },

  // ---------------- TOASTS ----------------
  drawToasts(ctx, dt) {
    let y = 160;
    for (const t of this.toasts) {
      t.age += dt;
      const a = Math.min(1, t.age * 4) * (t.age > 2.2 ? Math.max(0, (2.7 - t.age) / 0.5) : 1);
      ctx.globalAlpha = a;
      ctx.font = this.font(13, true);
      const w2 = ctx.measureText(t.text).width + 40;
      rr(ctx, W / 2 - w2 / 2, y, w2, 32, 8);
      ctx.fillStyle = 'rgba(10,8,20,0.75)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,180,64,0.5)'; ctx.stroke();
      ctx.fillStyle = '#ffd98a'; ctx.textAlign = 'center';
      ctx.fillText(t.text, W / 2, y + 21);
      y += 42;
      ctx.globalAlpha = 1;
    }
    this.toasts = this.toasts.filter(t => t.age < 2.7);
  },

  // cinematic letterbox
  drawCineBars(ctx, amt) {
    const bh = 70 * amt;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, bh);
    ctx.fillRect(0, H - bh, W, bh);
  },
};
