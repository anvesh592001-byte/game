// Headless QA harness — mocks DOM/canvas, loads the game, simulates play across all 24 levels.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

// ---- canvas 2d context mock ----
function makeCtx() {
  const noop = () => { };
  const grad = { addColorStop: noop };
  return new Proxy({}, {
    get(t, k) {
      if (k === 'measureText') return () => ({ width: 50 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => grad;
      if (k === 'canvas') return { width: 1280, height: 720 };
      return noop;
    },
    set() { return true; }
  });
}
const listeners = {};
const sandbox = {
  console, Math, JSON, Object, Array, setTimeout, clearTimeout, setInterval, clearInterval, Date,
  performance: { now: () => Date.now() },
  window: null,
  document: {
    hidden: false,
    getElementById: () => ({ getContext: () => makeCtx(), width: 1280, height: 720 }),
  },
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } },
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  requestAnimationFrame: () => 0, // manual stepping
  AudioContext: undefined, webkitAudioContext: undefined,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = ['util.js', 'assets.js', 'audio.js', 'art.js', 'world.js', 'entities.js', 'dialogue.js', 'levels.js', 'ui.js', 'game.js'];
for (const f of files) {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  vm.runInContext(code, sandbox, { filename: f });
}


// pull const-declared globals out of the vm context
const REF = {};
for (const n of ['LEVELS','CHARS','HERO_IDS','ENEMY_DEFS','BOSS_DEFS','CINEMATICS','EMOTES','Art','UI','SaveSys','Input','Audio2']) {
  REF[n] = vm.runInContext(n, sandbox);
  sandbox[n] = REF[n];
}

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('  ✓ ' + name); }
  catch (e) { failures++; console.log('  ✗ ' + name + ' — ' + e.message); }
}

vm.runInContext(`
  var results = [];
  SaveSys.load();
  var game = new Game();
`, sandbox);

const g = () => sandbox.game;

console.log('== STRUCTURE ==');
check('24 levels defined', () => { if (sandbox.LEVELS.length !== 24) throw new Error('got ' + sandbox.LEVELS.length); });
check('3 phases x 8', () => {
  for (let p = 1; p <= 3; p++) {
    const n = sandbox.LEVELS.filter(l => l.phase === p).length;
    if (n !== 8) throw new Error('phase ' + p + ' has ' + n);
  }
});
check('4 heroes locked', () => { if (sandbox.HERO_IDS.length !== 4) throw new Error('heroes'); });
check('Ravi has glasses, Kiran moustache', () => {
  if (!sandbox.CHARS.ravi.glasses) throw new Error('no glasses');
  if (!sandbox.CHARS.kiran.moustache) throw new Error('no moustache');
});
check('7 enemy classes', () => { if (Object.keys(sandbox.ENEMY_DEFS).length !== 7) throw new Error(Object.keys(sandbox.ENEMY_DEFS).length); });
check('5 bosses', () => { if (Object.keys(sandbox.BOSS_DEFS).length !== 5) throw new Error('bosses'); });
check('all cineStart keys exist', () => {
  for (const l of sandbox.LEVELS) {
    for (const k of [l.cineStart, l.cineEnd, l.cineAtEnd]) {
      if (k && !sandbox.CINEMATICS[k]) throw new Error('missing cinematic ' + k);
    }
  }
});
check('opening + finale cinematics exist', () => {
  if (!sandbox.CINEMATICS.opening || !sandbox.CINEMATICS.finale) throw new Error('nope');
});
check('every dialogue step has valid speaker', () => {
  for (const key in sandbox.CINEMATICS) {
    for (const s of sandbox.CINEMATICS[key]) {
      if (s.who && s.who !== 'vyomasura' && !sandbox.CHARS[s.who]) throw new Error(key + ': ' + s.who);
    }
  }
});

console.log('== LEVEL SIMULATION (all 24) ==');
const ctx = makeCtx();
for (let i = 0; i < 24; i++) {
  check('level ' + (i + 1) + ' (' + sandbox.LEVELS[i].name + ') runs 300 frames + draws', () => {
    vm.runInContext(`
      game.heroId = ['aditya','arjun','ravi','kiran'][${i} % 4];
      game.launchLevel(${i});
      game.cine.active = false; game.cine.steps = []; // skip cinematics for sim
      var lvl = game.level;
      for (let f = 0; f < 300; f++) {
        // random-ish inputs
        Input.keys['KeyD'] = f % 3 !== 0;
        if (f % 40 === 0) Input.pressed['KeyW'] = true, Input.keys['KeyW'] = true;
        if (f % 15 === 0) Input.pressed['KeyJ'] = true;
        if (f % 60 === 20) Input.pressed['KeyK'] = true;
        if (f % 50 === 10) Input.pressed['KeyE'] = true;
        if (f % 90 === 30) Input.pressed['ShiftLeft'] = true;
        lvl.update(0.016);
        Input.endFrame();
      }
    `, sandbox);
    // draw pass
    sandbox.game.level.draw(ctx);
    const lvl = sandbox.game.level;
    if (!(lvl.player.x > 0)) throw new Error('player x invalid: ' + lvl.player.x);
    if (Number.isNaN(lvl.player.y)) throw new Error('player y NaN');
  });
}

console.log('== COMBAT ==');
check('player can kill an enemy', () => {
  vm.runInContext(`
    game.launchLevel(6); game.cine.active=false; game.cine.steps=[];
    var lvl = game.level, e = lvl.enemies[0];
    var hp0 = e.hp;
    lvl.player.x = e.x - 40; lvl.player.y = e.y; lvl.player.facing = 1;
    lvl.player.dmg = 9999; lvl.player.attackKind='basic'; lvl.player.applyAttack(lvl);
    results.push(e.dead);
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('enemy survived 9999 dmg');
});
check('boss fight: boss spawns, takes damage, dies, level completes', () => {
  vm.runInContext(`
    game.launchLevel(14); game.cine.active=false; game.cine.steps=[]; game.cine.onDone=null;
    var lvl = game.level;
    lvl.player.x = lvl.def.boss.x - 400;
    lvl.update(0.016);
    results.push(!!lvl.boss);
    lvl.boss.hitBy(999999, 0, lvl);
    lvl.update(0.016);
    results.push(lvl.boss.dead);
  `, sandbox);
  const died = sandbox.results.pop(), spawned = sandbox.results.pop();
  if (!spawned) throw new Error('boss did not spawn');
  if (!died) throw new Error('boss did not die');
});
check('scripted level 16 boss cannot die', () => {
  vm.runInContext(`
    game.launchLevel(15); game.cine.active=false; game.cine.steps=[];
    var lvl = game.level;
    lvl.player.x = lvl.def.boss.x - 400; lvl.update(0.016);
    lvl.boss.hitBy(999999, 0, lvl);
    lvl.update(0.016);
    results.push(!lvl.boss.dead && lvl.boss.hp === 1);
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('scripted boss died');
});
check('all 4 ultimates execute without error', () => {
  vm.runInContext(`
    for (const id of HERO_IDS) {
      game.heroId = id;
      game.launchLevel(19); game.cine.active=false; game.cine.steps=[];
      var lvl = game.level;
      lvl.player.powered = true; lvl.player.ultCharge = 100;
      lvl.player.startUlt(lvl);
      for (let f=0; f<120; f++) lvl.update(0.016);
    }
  `, sandbox);
});
check('enemy projectiles can hit player', () => {
  vm.runInContext(`
    game.launchLevel(10); game.cine.active=false; game.cine.steps=[];
    var lvl = game.level;
    var hp0 = lvl.player.hp;
    lvl.player.iT = 0;
    lvl.projectiles.push(new Proj(lvl.player.x - 20, lvl.player.y - 50, 5, 0, {friendly:false, dmg:10, color:'#fff', r:6}));
    for (let f=0; f<20; f++) lvl.update(0.016);
    results.push(lvl.player.hp < hp0);
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('projectile never hit');
});

console.log('== CINEMATIC ENGINE ==');
check('every cinematic plays fully to completion', () => {
  vm.runInContext(`
    game.launchLevel(0);
    for (const key in CINEMATICS) {
      let done = false;
      game.cine.play(key, () => done = true);
      let guard = 0;
      while (game.cine.active && guard++ < 5000) game.cine.update(0.1);
      if (game.cine.active) throw new Error('cinematic stuck: ' + key);
    }
  `, sandbox);
});

console.log('== SAVE SYSTEM ==');
check('save/load roundtrip', () => {
  vm.runInContext(`
    SaveSys.data.level = 12; SaveSys.data.shards = 7; SaveSys.data.character='ravi';
    SaveSys.save();
    SaveSys.data = null; SaveSys.load();
    results.push(SaveSys.data.level === 12 && SaveSys.data.shards === 7 && SaveSys.data.character === 'ravi');
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('roundtrip mismatch');
});
check('checkpoint respawn restores player', () => {
  vm.runInContext(`
    game.launchLevel(9); game.cine.active=false; game.cine.steps=[];
    var lvl = game.level;
    lvl.lastCheckpoint = 1500;
    lvl.player.hp = 0; lvl.player.dead = true;
    game.respawnAtCheckpoint();
    results.push(!lvl.player.dead && lvl.player.hp === lvl.player.maxHp && lvl.player.x === 1500);
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('respawn broken');
});

console.log('== FULL PLAYTHROUGH (fast-forward) ==');
check('completing all levels advances save to 24', () => {
  vm.runInContext(`
    SaveSys.wipeProgress(); SaveSys.data.character='aditya';
    game.heroId='aditya';
    for (let i = 0; i < 24; i++) {
      game.launchLevel(i);
      game.cine.active=false; game.cine.steps=[]; game.cine.onDone=null;
      var lvl = game.level;
      // satisfy objectives artificially
      (lvl.def.examine||[]).forEach(e => lvl.examined.add(e.x));
      (lvl.def.puzzle||[]).forEach(p => lvl.puzzleLit.add(p.x+','+p.y));
      (lvl.def.symbols||[]).forEach(s => lvl.symbolsDone.add(s.hero));
      lvl.reqCollected = 3;
      lvl.rescuedCount = (lvl.def.npcs||[]).filter(n=>n.rescue).length;
      if (lvl.arenaState) lvl.arenaState.active = false;
      if (lvl.def.boss) {
        lvl.player.x = lvl.def.boss.x - 400; lvl.update(0.016);
        if (lvl.def.scriptedLoss) { lvl.bossActive = true; lvl.scriptTimer = 999; lvl.update(0.016); }
        else { lvl.boss.hitBy(9999999, 0, lvl); }
      }
      if (!lvl.endTriggered) { lvl.player.x = lvl.exitX + 10; lvl.update(0.016); }
      // drive any end-cinematic to completion so onDone (progress record) fires
      let guard = 0;
      while (game.cine.active && guard++ < 5000) game.cine.update(0.1);
      if (!lvl.endTriggered) throw new Error('level ' + (i+1) + ' did not finish');
      // finishLevel may have queued cinematic; force resolution
    }
    results.push(SaveSys.data.level >= 24 || SaveSys.data.completed.length === 24);
  `, sandbox);
  if (!sandbox.results.pop()) throw new Error('did not reach end; level=' + JSON.parse(sandbox.localStorage._d['gc_lastnight_save_v1'] || '{}').level);
});

console.log('== UI DRAW PASSES ==');
check('all UI screens draw without error', () => {
  vm.runInContext(`
    var c = null;
  `, sandbox);
  const c = makeCtx();
  const S = sandbox;
  S.UI.drawTitle(c, 1);
  S.UI.drawMenu(c, 1, g());
  S.UI.drawCharSelect(c, 1, g(), true);
  S.UI.drawStory(c, 1, g());
  S.UI.drawSettings(c, 1);
  S.UI.drawControls(c, 1);
  S.UI.drawCredits(c, 1);
  vm.runInContext('game.launchLevel(3); game.cine.active=false;', sandbox);
  S.UI.drawHUD(c, g());
  S.UI.drawPause(c, 1, g());
  S.UI.drawDeath(c, 1, g());
  S.UI.drawLevelComplete(c, 1, g());
  S.UI.drawSubtitle(c, { who: 'ADITYA', text: 'Test subtitle line ra', dur: 3, age: 1, hero: 'aditya' }, 1);
});
check('all hero poses/emotions render', () => {
  const c = makeCtx();
  const poses = ['idle', 'walk', 'run', 'jump', 'attack', 'cast', 'smash', 'hurt', 'victory', 'kneel', 'dash', 'sit'];
  for (const id of sandbox.HERO_IDS)
    for (const pose of poses)
      for (const emo of Object.keys(sandbox.EMOTES))
        sandbox.Art.hero(c, id, { pose, t: 1, facing: -1, attackT: 0.5, emotion: emo, powered: true, blink: true });
});
check('all enemies + bosses render all poses', () => {
  const c = makeCtx();
  for (const t of Object.keys(sandbox.ENEMY_DEFS))
    for (const pose of ['idle', 'move', 'attack', 'hurt', 'die'])
      sandbox.Art.enemy(c, t, { pose, t: 1, facing: -1, attackT: 0.5, dieT: 0.5 });
  for (const b of Object.keys(sandbox.BOSS_DEFS))
    for (const pose of ['idle', 'move', 'attack', 'cast', 'hurt'])
      sandbox.Art.boss(c, b, { pose, t: 1, facing: -1, attackT: 0.5 });
});

console.log('');
if (failures) { console.log('FAILURES: ' + failures); process.exit(1); }
console.log('ALL QA CHECKS PASSED ✔');
