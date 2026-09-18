// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — levels.js
// 24 level definitions (3 phases x 8) + Level runtime.
// ============================================================
'use strict';

// Helper builders
function groundRow(w, y = 620) { return [{ x: 0, y, w, h: 110, ground: true }]; }
function plat(x, y, w, oneway = true) { return { x, y, w, h: 16, oneway }; }

// deterministic street props
function streetProps(width, seed, opts = {}) {
  const rng = makeRng(seed);
  const P = [];
  let x = 150;
  while (x < width - 200) {
    const r = rng();
    if (r < 0.45) P.push({ type: 'house', x, layer: 1, seed: Math.floor(rng() * 999) });
    else if (r < 0.7) P.push({ type: 'shop', x, layer: 1, seed: Math.floor(rng() * 999), label: ['SRI GANESH STORES', 'LAKSHMI SWEETS', 'RAJU TIFFINS', 'ANNAPURNA MESS', 'VINAYAKA FANCY'][Math.floor(rng() * 5)] });
    else if (r < 0.82) P.push({ type: 'tree', x, layer: 1, seed: Math.floor(rng() * 999) });
    else P.push({ type: 'stall', x, layer: 1, seed: Math.floor(rng() * 999) });
    if (rng() < 0.5) P.push({ type: 'lamp', x: x + 90, layer: 2 });
    if (rng() < 0.4 && !opts.noFestival) P.push({ type: 'lights', x: x + 60, y: 400, w: 260, layer: 1 });
    if (rng() < 0.3 && !opts.noFestival) P.push({ type: 'banner', x: x + 100, y: 380, w: 240, layer: 1 });
    if (rng() < 0.3 && !opts.noFestival) P.push({ type: 'rangoli', x: x + 40, layer: 2, s: 0.8 + rng() * 0.5 });
    if (rng() < 0.25 && !opts.noFestival) P.push({ type: 'diya', x: x + 130, layer: 2, seed: Math.floor(rng() * 10) });
    if (rng() < 0.2) P.push({ type: 'wires', x: x + 50, y: 330, w: 320, layer: 0 });
    if (rng() < 0.18) P.push({ type: 'auto', x: x + 170, layer: 2 });
    if (rng() < 0.15) P.push({ type: 'bench', x: x + 200, layer: 2 });
    if (rng() < 0.5 && !opts.noFestival) P.push({ type: 'person', x: x + 60 + rng() * 120, layer: 2, seed: Math.floor(rng() * 999) });
    if (rng() < 0.25 && !opts.noFestival) P.push({ type: 'person', x: x + 150 + rng() * 60, layer: 1, seed: Math.floor(rng() * 999), scale: 0.82 });
    x += 180 + rng() * 160;
  }
  return P;
}
function forestProps(width, seed) {
  const rng = makeRng(seed); const P = [];
  let x = 100;
  while (x < width - 100) {
    P.push({ type: 'tree', x, layer: rng() < 0.4 ? 1 : 2, seed: Math.floor(rng() * 999) });
    if (rng() < 0.5) P.push({ type: 'rock', x: x + 70, layer: 2, seed: Math.floor(rng() * 999) });
    if (rng() < 0.25) P.push({ type: 'tree', x: x + 40, layer: 3, seed: Math.floor(rng() * 999) });
    x += 120 + rng() * 140;
  }
  return P;
}
function ruinProps(width, seed, crystals) {
  const rng = makeRng(seed); const P = [];
  let x = 140;
  while (x < width - 140) {
    const r = rng();
    if (r < 0.4) P.push({ type: 'pillar', x, layer: rng() < 0.5 ? 1 : 2, seed: Math.floor(rng() * 999) });
    else if (r < 0.6) P.push({ type: 'rock', x, layer: 2, seed: Math.floor(rng() * 999) });
    else if (r < 0.75 && crystals) P.push({ type: 'crystal', x, layer: 2, seed: Math.floor(rng() * 9), s: 0.8 + rng() });
    else P.push({ type: 'shrine', x, layer: 1, seed: Math.floor(rng() * 999) });
    x += 150 + rng() * 170;
  }
  return P;
}

// enemy wave spec: {x, type} or trigger zones
const LEVELS = [
  // ============ PHASE 1: THE FESTIVAL ============
  { // 1 — OUR STREET (tutorial)
    name: 'OUR STREET', phase: 1, theme: 'festivalDay', width: 3400, music: 'festival',
    cineStart: 'lv1_start', cineEnd: 'lv1_end', mood: 'happy',
    platforms: [...groundRow(3400), plat(700, 500, 130), plat(940, 420, 120), plat(1180, 500, 130), plat(2100, 490, 150), plat(2350, 400, 130)],
    props: [...streetProps(3400, 11), { type: 'stage', x: 3150, layer: 1 }, { type: 'idolSmall', x: 500, layer: 2, s: 1 }],
    npcs: [{ x: 600 }, { x: 1500 }, { x: 2000, kind: 'child' }, { x: 2600 }, { x: 3000, kind: 'woman' }],
    checkpoints: [200, 1200, 2400],
    tutorial: true, enemies: [], objective: 'Street chivara pandal stage ki vellandi',
    collectibles: [{ x: 960, y: 380 }, { x: 2370, y: 360 }],
  },
  { // 2 — FESTIVAL PREPARATION
    name: 'FESTIVAL PREPARATION', phase: 1, theme: 'festivalDay', width: 3800, music: 'festival',
    cineStart: 'lv2_start', cineEnd: 'lv2_end', mood: 'happy',
    platforms: [...groundRow(3800), plat(500, 480, 120), plat(760, 400, 110), plat(1020, 480, 120),
      plat(1600, 460, 140), plat(1880, 380, 120), plat(2160, 460, 140),
      plat(2800, 480, 110), plat(3020, 400, 110), plat(3240, 480, 110)],
    props: [...streetProps(3800, 22), { type: 'stage', x: 3600, layer: 1 }],
    npcs: [{ x: 450, quest: true }, { x: 1300, kind: 'woman', quest: true }, { x: 2300, kind: 'child' }, { x: 2900, quest: true }, { x: 3400, kind: 'woman' }],
    checkpoints: [200, 1400, 2600],
    enemies: [], objective: 'Decoration items 3 collect cheyyandi (glowing boxes)',
    collectibles: [{ x: 780, y: 360, req: true }, { x: 1900, y: 340, req: true }, { x: 3040, y: 360, req: true }],
  },
  { // 3 — THE OLD LANE
    name: 'THE OLD LANE', phase: 1, theme: 'festivalEvening', width: 3400, music: 'mystery',
    cineStart: 'lv3_start', cineEnd: 'lv3_end', mood: 'worry',
    platforms: [...groundRow(3400), plat(800, 490, 120), plat(1060, 410, 110), plat(1700, 480, 130), plat(1960, 390, 120), plat(2600, 470, 140)],
    props: [...streetProps(1200, 33, { noFestival: true }), ...ruinProps(2200, 34).map(p => ({ ...p, x: p.x + 1200 })),
      { type: 'carving', x: 1600, layer: 1 }, { type: 'carving', x: 2500, layer: 1 }, { type: 'gate', x: 3250, layer: 1 }],
    npcs: [], checkpoints: [200, 1300, 2500],
    enemies: [], objective: 'Old lane chivara varaku explore cheyyandi',
    collectibles: [{ x: 1080, y: 370 }, { x: 1980, y: 350 }, { x: 2620, y: 430 }],
  },
  { // 4 — TEMPLE COURTYARD
    name: 'TEMPLE COURTYARD', phase: 1, theme: 'temple', width: 3200, music: 'mystery',
    cineStart: 'lv4_start', cineEnd: 'lv4_end', mood: 'worry', distantTemple: false,
    platforms: [...groundRow(3200), plat(600, 500, 140), plat(900, 420, 130), plat(1200, 500, 140),
      plat(1750, 480, 150, false), plat(2050, 390, 130), plat(2350, 480, 150, false)],
    props: [{ type: 'temple', x: 1600, layer: 1, scale: 1.15 }, { type: 'temple', x: 2900, layer: 0, scale: 0.8 },
      { type: 'carving', x: 700, layer: 1, glow: true }, { type: 'carving', x: 1250, layer: 1, glow: true }, { type: 'carving', x: 2450, layer: 1, glow: true },
      { type: 'pillar', x: 450, layer: 2, seed: 4 }, { type: 'pillar', x: 2700, layer: 2, seed: 5 },
      { type: 'diya', x: 1500, layer: 2 }, { type: 'diya', x: 1700, layer: 2, seed: 3 }, { type: 'shrine', x: 2200, layer: 1, seed: 8 }],
    npcs: [], checkpoints: [200, 1500, 2600],
    enemies: [], objective: 'Ancient carvings 3 examine cheyyandi (E)',
    examine: [{ x: 700, text: 'Carving 1: Janalu oka guardian ni aradhistunnaru...' }, { x: 1250, text: 'Carving 2: Guardian meeda shadow paddadi. Kallu marayi...' }, { x: 2450, text: 'Carving 3: Rushulu okka seal tho... "VYOMASURA" ni bandhincharu.' }],
    collectibles: [{ x: 920, y: 380 }, { x: 2070, y: 350 }],
  },
  { // 5 — THE HIDDEN CHAMBER (puzzle)
    name: 'THE HIDDEN CHAMBER', phase: 1, theme: 'temple', width: 2800, music: 'mystery',
    cineStart: 'lv5_start', mood: 'worry', underground: true, distantTemple: false, noMidStrip: true,
    platforms: [...groundRow(2800), plat(500, 500, 130, false), plat(800, 420, 120, false), plat(1100, 500, 130, false),
      plat(1500, 460, 300, false), plat(1900, 380, 140), plat(2200, 460, 160, false)],
    props: [{ type: 'pillar', x: 300, layer: 1, seed: 11 }, { type: 'pillar', x: 900, layer: 1, seed: 12 },
      { type: 'pillar', x: 1400, layer: 1, seed: 13 }, { type: 'pillar', x: 2000, layer: 1, seed: 14 },
      { type: 'carving', x: 1200, layer: 1, glow: true }, { type: 'diya', x: 600, layer: 2 }, { type: 'diya', x: 1650, layer: 2, seed: 5 },
      { type: 'seal', x: 2550, y: 480, layer: 1, broken: false, sealProp: true }],
    npcs: [], checkpoints: [200, 1300, 2200],
    enemies: [], objective: 'Puzzle: 3 diya switches velaginchandi (E)',
    puzzle: [{ x: 520, y: 500 }, { x: 1520, y: 460 }, { x: 1920, y: 380 }],
    cineAtEnd: 'lv5_seal',
    collectibles: [{ x: 820, y: 380 }],
  },
  { // 6 — FESTIVAL NIGHT
    name: 'FESTIVAL NIGHT', phase: 1, theme: 'festivalNight', width: 3600, music: 'festival',
    cineStart: 'lv6_start', cineAtEnd: 'lv6_end', mood: 'joy',
    platforms: [...groundRow(3600), plat(900, 490, 140), plat(1500, 470, 140), plat(2300, 490, 140)],
    props: [...streetProps(3600, 66), { type: 'stage', x: 1800, layer: 1 },
      { type: 'drums', x: 1550, layer: 2 }, { type: 'drums', x: 2050, layer: 2 },
      { type: 'idolSmall', x: 800, layer: 2, s: 1.2 }, { type: 'stall', x: 2600, layer: 1, seed: 9 },
      { type: 'lights', x: 1800, y: 360, w: 500, layer: 1 }],
    npcs: [{ x: 500 }, { x: 900, kind: 'woman' }, { x: 1300, kind: 'child' }, { x: 1700 }, { x: 1950, kind: 'woman' }, { x: 2200, kind: 'child' }, { x: 2700 }, { x: 3100, kind: 'woman' }, { x: 3300 }],
    checkpoints: [200, 1800, 3000],
    enemies: [], objective: 'Celebration enjoy cheyyandi — stage daggara aarti lo join avvandi',
    collectibles: [{ x: 920, y: 450 }, { x: 2320, y: 450 }],
  },
  { // 7 — THE STRANGE STORM (first combat)
    name: 'THE STRANGE STORM', phase: 1, theme: 'stormNight', width: 3800, music: 'tension',
    cineStart: 'lv7_start', cineEnd: 'lv7_end', mood: 'fear',
    platforms: [...groundRow(3800), plat(1000, 490, 130), plat(1700, 470, 140), plat(2500, 490, 130), plat(3000, 420, 120)],
    props: [...streetProps(3800, 77), { type: 'stage', x: 1800, layer: 1 }],
    npcs: [{ x: 600, flee: true }, { x: 1400, kind: 'woman', flee: true }, { x: 2200, kind: 'child', flee: true }, { x: 3000, flee: true }],
    checkpoints: [200, 1600, 2800],
    enemies: [{ x: 1100, type: 'shadowRunner' }, { x: 1900, type: 'shadowRunner' }, { x: 2100, type: 'shadowRunner' },
      { x: 2700, type: 'shadowRunner' }, { x: 2900, type: 'shadowRunner' }, { x: 3300, type: 'shadowRunner' }],
    objective: 'Shadow creatures ni odinchandi, street chivaraki vellandi',
    collectibles: [{ x: 1720, y: 430 }, { x: 3020, y: 380 }],
  },
  { // 8 — THE SEAL BREAKS
    name: 'THE SEAL BREAKS', phase: 1, theme: 'stormNight', width: 3000, music: 'tension',
    cineStart: 'lv8_start', mood: 'fear', underground: true, distantTemple: false, noMidStrip: true,
    platforms: [...groundRow(3000), plat(600, 500, 130, false), plat(950, 420, 120, false), plat(1300, 500, 130, false), plat(1800, 460, 200, false), plat(2200, 400, 140)],
    props: [{ type: 'pillar', x: 350, layer: 1, seed: 21 }, { type: 'pillar', x: 1100, layer: 1, seed: 22 },
      { type: 'pillar', x: 1600, layer: 1, seed: 23 }, { type: 'crystal', x: 1450, layer: 2, s: 1 },
      { type: 'seal', x: 2750, y: 470, layer: 1, broken: true, sealProp: true }],
    npcs: [], checkpoints: [200, 1400, 2300],
    enemies: [{ x: 900, type: 'shadowRunner' }, { x: 1350, type: 'shadowRunner' }, { x: 1850, type: 'shadowRunner' }, { x: 2100, type: 'shadowRunner' }, { x: 2350, type: 'ashWarrior' }],
    objective: 'Chamber loki vellandi — seal daggaraki',
    cineAtEnd: 'lv8_seal', grantPowers: true,
    collectibles: [{ x: 970, y: 380 }],
  },

  // ============ PHASE 2: THE AWAKENING ============
  { // 9 — THE ESCAPE
    name: 'THE ESCAPE', phase: 2, theme: 'stormNight', width: 4000, music: 'tension',
    cineStart: 'lv9_start', cineEnd: 'lv9_end', mood: 'determined',
    platforms: [...groundRow(4000), plat(800, 490, 130), plat(1500, 470, 140), plat(2400, 490, 130), plat(3200, 450, 140)],
    props: [...streetProps(4000, 99, { noFestival: true })],
    npcs: [{ x: 700, rescue: true }, { x: 1400, kind: 'woman', rescue: true }, { x: 2100, kind: 'child', rescue: true }, { x: 2900, rescue: true }, { x: 3500, kind: 'woman', rescue: true }],
    checkpoints: [200, 1600, 3000],
    enemies: [{ x: 1000, type: 'shadowRunner' }, { x: 1250, type: 'shadowRunner' }, { x: 1900, type: 'ashWarrior' }, { x: 2300, type: 'shadowRunner' },
      { x: 2600, type: 'ashWarrior' }, { x: 3100, type: 'shadowRunner' }, { x: 3400, type: 'shadowRunner' }, { x: 3700, type: 'ashWarrior' }],
    objective: 'Civilians 5 mandini rescue cheyyandi (daggaraki velli E)',
    collectibles: [{ x: 1520, y: 430 }, { x: 3220, y: 410 }],
  },
  { // 10 — THE CORRUPTED STREET
    name: 'THE CORRUPTED STREET', phase: 2, theme: 'corrupted', width: 4200, music: 'dark',
    cineStart: 'lv10_start', mood: 'sad',
    platforms: [...groundRow(4200), plat(900, 480, 130), plat(1200, 400, 120), plat(1900, 470, 140), plat(2600, 490, 130), plat(2900, 410, 120), plat(3500, 470, 130)],
    props: [...streetProps(4200, 111, { noFestival: true }), { type: 'crystal', x: 1000, layer: 2, s: 1.1 }, { type: 'crystal', x: 2500, layer: 2, s: 0.9, seed: 3 },
      { type: 'crystal', x: 3600, layer: 2, s: 1.3, seed: 6 }, { type: 'auto', x: 1600, layer: 2 }, { type: 'banner', x: 2000, y: 400, w: 240, layer: 1 }],
    npcs: [], checkpoints: [200, 1500, 2800, 3800],
    enemies: [{ x: 800, type: 'shadowRunner' }, { x: 1100, type: 'ashWarrior' }, { x: 1500, type: 'shadowArcher' }, { x: 2000, type: 'shadowRunner' },
      { x: 2300, type: 'ashWarrior' }, { x: 2700, type: 'shadowArcher' }, { x: 3200, type: 'ashWarrior' }, { x: 3600, type: 'shadowRunner' }, { x: 3900, type: 'ashWarrior' }],
    objective: 'Corrupted street ni daati veyandi',
    collectibles: [{ x: 1220, y: 360 }, { x: 2920, y: 370 }, { x: 3520, y: 430 }],
  },
  { // 11 — THE SHADOW ARMY
    name: 'THE SHADOW ARMY', phase: 2, theme: 'corrupted', width: 3600, music: 'tension',
    cineStart: 'lv11_start', mood: 'determined',
    platforms: [...groundRow(3600), plat(700, 480, 140), plat(1400, 460, 150), plat(2100, 480, 140), plat(2800, 440, 150)],
    props: [...streetProps(3600, 122, { noFestival: true }), { type: 'crystal', x: 1800, layer: 2, s: 1.4 }],
    npcs: [], checkpoints: [200, 1300, 2500],
    arena: [ // wave arena at x=1800
      { x: 1800, waves: [
        ['shadowRunner', 'shadowRunner', 'shadowArcher'],
        ['ashWarrior', 'shadowRunner', 'corruptedBeast'],
        ['shadowArcher', 'corruptedBeast', 'ashWarrior', 'shadowRunner'],
      ] },
    ],
    enemies: [{ x: 700, type: 'corruptedBeast' }, { x: 1200, type: 'shadowArcher' }, { x: 2600, type: 'corruptedBeast' }, { x: 3000, type: 'ashWarrior' }, { x: 3300, type: 'shadowArcher' }],
    objective: 'Shadow army waves ni survive cheyyandi',
    collectibles: [{ x: 1420, y: 420 }, { x: 2820, y: 400 }],
  },
  { // 12 — THE TEMPLE OF ASH
    name: 'THE TEMPLE OF ASH', phase: 2, theme: 'temple', width: 3400, music: 'dark',
    cineStart: 'lv12_start', cineAtEnd: 'lv12_end', mood: 'sad', distantTemple: false, corruptTheme: true,
    platforms: [...groundRow(3400), plat(600, 490, 140, false), plat(950, 410, 130), plat(1300, 490, 140, false),
      plat(1800, 460, 160, false), plat(2150, 380, 130), plat(2500, 460, 160, false)],
    props: [{ type: 'temple', x: 1500, layer: 1, corrupted: true }, { type: 'temple', x: 3000, layer: 0, corrupted: true },
      { type: 'carving', x: 800, layer: 1, glow: true }, { type: 'carving', x: 2300, layer: 1, glow: true }, { type: 'carving', x: 3100, layer: 1, glow: true },
      { type: 'pillar', x: 400, layer: 2, seed: 31 }, { type: 'pillar', x: 1900, layer: 2, seed: 32 }, { type: 'crystal', x: 1100, layer: 2, s: 1 }],
    npcs: [], checkpoints: [200, 1400, 2600],
    enemies: [{ x: 900, type: 'ashWarrior' }, { x: 1300, type: 'voidMage' }, { x: 1900, type: 'ashWarrior' }, { x: 2400, type: 'shadowArcher' }, { x: 2800, type: 'voidMage' }, { x: 3100, type: 'ashWarrior' }],
    objective: 'Temple records 3 examine cheyyandi (E)',
    examine: [{ x: 800, text: 'Record: "Vyomasura — mana raksha. Mana veerudu." — old prayer' },
      { x: 2300, text: 'Record: "Shadow storm vachindi. Guardian mammalni marchipoyaadu..."' },
      { x: 3100, text: 'Record: "Vighnesha shakti tho... memu maa guardian ne bandhincham. Kshaminchu."' }],
    collectibles: [{ x: 970, y: 370 }, { x: 2170, y: 340 }],
  },
  { // 13 — THE FOREST ROAD
    name: 'THE FOREST ROAD', phase: 2, theme: 'forest', width: 4400, music: 'mystery',
    cineStart: 'lv13_start', mood: 'worry', distantTemple: false,
    platforms: [...groundRow(4400), plat(700, 500, 110), plat(950, 420, 110), plat(1200, 340, 110), plat(1500, 420, 110),
      plat(2000, 480, 120), plat(2300, 400, 110), plat(2600, 480, 120),
      plat(3100, 460, 110), plat(3350, 380, 110), plat(3600, 300, 110), plat(3850, 400, 110)],
    props: [...forestProps(4400, 133)],
    npcs: [], checkpoints: [200, 1600, 3000, 4000],
    hazards: [{ x: 1700, w: 180, type: 'thorns' }, { x: 2750, w: 160, type: 'thorns' }, { x: 4000, w: 140, type: 'thorns' }],
    enemies: [{ x: 1000, type: 'corruptedBeast' }, { x: 1400, type: 'corruptedBeast' }, { x: 2100, type: 'shadowArcher' },
      { x: 2500, type: 'corruptedBeast' }, { x: 3200, type: 'voidMage' }, { x: 3700, type: 'corruptedBeast' }, { x: 4100, type: 'ashWarrior' }],
    objective: 'Forest daati forgotten shrine ki cherandi',
    collectibles: [{ x: 1220, y: 300 }, { x: 2320, y: 360 }, { x: 3620, y: 260 }],
  },
  { // 14 — THE FORGOTTEN SHRINE
    name: 'THE FORGOTTEN SHRINE', phase: 2, theme: 'forest', width: 2800, music: 'mystery',
    cineStart: 'lv14_start', cineAtEnd: 'lv14_end', mood: 'neutral', distantTemple: false,
    platforms: [...groundRow(2800), plat(600, 480, 130), plat(900, 400, 120), plat(1500, 460, 300, false), plat(2000, 400, 130)],
    props: [...forestProps(1200, 144), { type: 'shrine', x: 1650, layer: 1, seed: 50, corrupted: false },
      { type: 'seal', x: 1650, y: 430, layer: 1, broken: false, sealProp: true },
      { type: 'diya', x: 1550, layer: 2 }, { type: 'diya', x: 1750, layer: 2, seed: 4 },
      ...forestProps(900, 145).map(p => ({ ...p, x: p.x + 1900 }))],
    npcs: [{ x: 1500, kind: 'any', priest: true }],
    checkpoints: [200, 1300],
    enemies: [{ x: 800, type: 'corruptedBeast' }, { x: 1100, type: 'shadowRunner' }, { x: 2200, type: 'voidMage' }, { x: 2450, type: 'ashWarrior' }],
    objective: 'Shrine daggara pray cheyyandi (E)',
    examine: [{ x: 1650, text: 'The shrine hums with warm golden light... visions of the first sealing flood your minds.' }],
    collectibles: [{ x: 920, y: 360 }, { x: 2020, y: 360 }],
  },
  { // 15 — THE FALLEN GUARDIAN (boss)
    name: 'THE FALLEN GUARDIAN', phase: 2, theme: 'temple', width: 2400, music: 'dark',
    cineStart: 'lv15_start', cineEnd: 'lv15_end', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(2400), plat(400, 470, 130), plat(1900, 470, 130)],
    props: [{ type: 'temple', x: 1200, layer: 0, corrupted: true }, { type: 'pillar', x: 300, layer: 1, seed: 61 },
      { type: 'pillar', x: 2100, layer: 1, seed: 62 }, { type: 'crystal', x: 600, layer: 2, s: 1 }, { type: 'crystal', x: 1800, layer: 2, s: 1.2, seed: 8 }],
    npcs: [], checkpoints: [200],
    enemies: [], boss: { type: 'fallenGuardian', x: 1500 },
    objective: 'BOSS: Fallen Guardian ni odinchandi',
  },
  { // 16 — FIRST CONFRONTATION (scripted loss)
    name: 'FIRST CONFRONTATION', phase: 2, theme: 'stormNight', width: 2200, music: 'boss',
    cineStart: 'lv16_start', mood: 'determined',
    platforms: [...groundRow(2200)],
    props: [...streetProps(2200, 166, { noFestival: true }), { type: 'crystal', x: 500, layer: 2, s: 1 }, { type: 'crystal', x: 1700, layer: 2, s: 1.1, seed: 2 }],
    npcs: [], checkpoints: [200],
    enemies: [], boss: { type: 'vyomasura', x: 1400, scripted: true },
    scriptedLoss: true, lossAfter: 20, // seconds of survival, then cinematic
    cineAtEnd: 'lv16_defeat', removePowers: true,
    objective: 'Vyomasura tho fight cheyyandi — SURVIVE!',
  },

  // ============ PHASE 3: THE FINAL NIGHT ============
  { // 17 — THE SILENT TOWN
    name: 'THE SILENT TOWN', phase: 3, theme: 'corrupted', width: 3800, music: 'sad',
    cineStart: 'lv17_start', mood: 'sad',
    platforms: [...groundRow(3800), plat(900, 480, 130), plat(1700, 470, 140), plat(2600, 480, 130)],
    props: [...streetProps(3800, 177, { noFestival: true }), { type: 'idolSmall', x: 1200, layer: 2, s: 1 },
      { type: 'banner', x: 900, y: 420, w: 220, layer: 1 }, { type: 'banner', x: 2400, y: 410, w: 220, layer: 1 },
      { type: 'auto', x: 2000, layer: 2 }, { type: 'stall', x: 3000, layer: 1, seed: 71 }],
    npcs: [], checkpoints: [200, 1600, 3000],
    enemies: [{ x: 1400, type: 'shadowRunner' }, { x: 2200, type: 'ashWarrior' }, { x: 3200, type: 'shadowRunner' }],
    objective: 'Silent town gunda old temple paths ki nadavandi',
    examine: [{ x: 1200, text: 'A small Ganesh idol, left behind in the rush. Someone covered it gently with a cloth.' },
      { x: 3000, text: 'A half-eaten plate of pulihora. Arjun looks at it for a long moment. Nobody jokes.' }],
    collectibles: [{ x: 920, y: 440 }, { x: 2620, y: 440 }],
  },
  { // 18 — THE FOUR PATHS
    name: 'THE FOUR PATHS', phase: 3, theme: 'temple', width: 4600, music: 'mystery',
    cineStart: 'lv18_start', cineEnd: 'lv18_end', mood: 'determined', distantTemple: false, soloSections: true,
    platforms: [...groundRow(4600),
      // Aditya section: combat corridor
      plat(500, 480, 130), plat(800, 480, 130),
      // Arjun section: high platforming
      plat(1400, 500, 100), plat(1600, 420, 90), plat(1800, 340, 90), plat(2000, 260, 90), plat(2200, 340, 90), plat(2400, 430, 100),
      // Ravi section: ranged puzzle targets on high ledges
      plat(2800, 460, 110), plat(3050, 380, 100), plat(3300, 460, 110),
      // Kiran section: heavy barriers
      plat(3900, 480, 120), plat(4200, 480, 120)],
    props: [{ type: 'pillar', x: 1200, layer: 1, seed: 81 }, { type: 'pillar', x: 2650, layer: 1, seed: 82 }, { type: 'pillar', x: 3700, layer: 1, seed: 83 },
      { type: 'carving', x: 600, layer: 1 }, { type: 'carving', x: 1900, layer: 1 }, { type: 'carving', x: 3100, layer: 1 }, { type: 'carving', x: 4100, layer: 1 },
      { type: 'diya', x: 1250, layer: 2 }, { type: 'diya', x: 2700, layer: 2, seed: 2 }, { type: 'diya', x: 3750, layer: 2, seed: 4 }],
    npcs: [], checkpoints: [200, 1300, 2700, 3800],
    enemies: [{ x: 550, type: 'ashWarrior' }, { x: 750, type: 'shadowRunner' }, { x: 950, type: 'ashWarrior' },
      { x: 2900, type: 'shadowArcher' }, { x: 3150, type: 'voidMage' },
      { x: 4000, type: 'stoneGuardian' }, { x: 4300, type: 'stoneGuardian' }],
    objective: 'Four paths daati temple center lo kalavandi',
    collectibles: [{ x: 2020, y: 220 }, { x: 3070, y: 340 }, { x: 4220, y: 440 }],
  },
  { // 19 — THE RISE
    name: 'THE RISE', phase: 3, theme: 'temple', width: 2600, music: 'sad',
    cineStart: 'lv19_start', mood: 'determined', distantTemple: false, noMidStrip: true,
    platforms: [...groundRow(2600), plat(500, 480, 130), plat(800, 400, 120), plat(1500, 460, 340, false), plat(2100, 420, 130)],
    props: [{ type: 'temple', x: 1670, layer: 1 }, { type: 'seal', x: 1670, y: 430, layer: 1, broken: false, sealProp: true },
      { type: 'diya', x: 1500, layer: 2 }, { type: 'diya', x: 1840, layer: 2, seed: 3 },
      { type: 'pillar', x: 350, layer: 1, seed: 91 }, { type: 'pillar', x: 2300, layer: 1, seed: 92 }],
    npcs: [], checkpoints: [200, 1200],
    enemies: [{ x: 700, type: 'ashWarrior' }, { x: 1000, type: 'shadowRunner' }, { x: 2200, type: 'voidMage' }],
    objective: 'Altar daggara naluguru kalisi pray cheyyandi (E)',
    examine: [{ x: 1670, text: 'The altar of the first sealing. Place your hands together...' }],
    cineAtEnd: 'lv19_rise', grantPowers: true, upgradePowers: true,
  },
  { // 20 — THE DEMON CITADEL
    name: 'THE DEMON CITADEL', phase: 3, theme: 'citadel', width: 4400, music: 'epic',
    cineStart: 'lv20_start', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(4400),
      plat(600, 490, 110), plat(850, 410, 100), plat(1100, 330, 100), plat(1350, 410, 100), plat(1600, 490, 110),
      plat(2000, 460, 120, false), plat(2300, 370, 110), plat(2600, 460, 120, false),
      plat(3000, 480, 100), plat(3250, 390, 100), plat(3500, 300, 100), plat(3750, 390, 100), plat(4000, 480, 100)],
    props: [...ruinProps(4400, 200, true), { type: 'gate', x: 4300, layer: 1, open: false, finalGate: true }],
    npcs: [], checkpoints: [200, 1500, 2800, 3900],
    hazards: [{ x: 1750, w: 160, type: 'void' }, { x: 2850, w: 120, type: 'void' }],
    enemies: [{ x: 900, type: 'eliteGuardian' }, { x: 1400, type: 'voidMage' }, { x: 2100, type: 'ashWarrior' }, { x: 2400, type: 'shadowArcher' },
      { x: 2700, type: 'eliteGuardian' }, { x: 3300, type: 'voidMage' }, { x: 3600, type: 'corruptedBeast' }, { x: 4000, type: 'eliteGuardian' }],
    objective: 'Citadel platforms daati lopaliki chorabadandi',
    collectibles: [{ x: 1120, y: 290 }, { x: 2320, y: 330 }, { x: 3520, y: 260 }],
  },
  { // 21 — THE ARMY OF SHADOWS
    name: 'THE ARMY OF SHADOWS', phase: 3, theme: 'citadel', width: 3200, music: 'epic',
    cineStart: 'lv21_start', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(3200), plat(700, 470, 140), plat(1400, 450, 160), plat(2200, 470, 140)],
    props: [...ruinProps(3200, 210, true)],
    npcs: [], checkpoints: [200, 1600],
    arena: [
      { x: 1600, waves: [
        ['shadowRunner', 'shadowRunner', 'ashWarrior', 'shadowArcher'],
        ['corruptedBeast', 'corruptedBeast', 'voidMage', 'ashWarrior'],
        ['eliteGuardian', 'shadowArcher', 'shadowArcher', 'shadowRunner'],
        ['eliteGuardian', 'voidMage', 'corruptedBeast', 'ashWarrior', 'shadowRunner'],
      ] },
    ],
    enemies: [{ x: 800, type: 'ashWarrior' }, { x: 2400, type: 'shadowArcher' }, { x: 2800, type: 'ashWarrior' }],
    objective: 'Shadow army full waves ni odinchandi',
    collectibles: [{ x: 1420, y: 410 }],
  },
  { // 22 — THE FINAL GATE
    name: 'THE FINAL GATE', phase: 3, theme: 'citadel', width: 3000, music: 'dark',
    cineStart: 'lv22_start', cineAtEnd: 'lv22_end', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(3000), plat(500, 470, 120), plat(900, 390, 110), plat(1400, 470, 120), plat(1900, 390, 110), plat(2300, 470, 120)],
    props: [...ruinProps(2600, 220, true), { type: 'gate', x: 2850, layer: 1, open: false, finalGate: true }],
    npcs: [], checkpoints: [200, 1500],
    enemies: [{ x: 700, type: 'voidMage' }, { x: 1200, type: 'eliteGuardian' }, { x: 1700, type: 'shadowArcher' }, { x: 2100, type: 'ashWarrior' }, { x: 2500, type: 'voidMage' }],
    objective: 'Four divine symbols activate cheyyandi (E) — okko hero shakti tho',
    symbols: [{ x: 520, y: 470, hero: 'aditya' }, { x: 920, y: 390, hero: 'arjun' }, { x: 1420, y: 470, hero: 'ravi' }, { x: 1920, y: 390, hero: 'kiran' }],
  },
  { // 23 — THE VILLAIN'S DOMAIN
    name: "THE VILLAIN'S DOMAIN", phase: 3, theme: 'citadel', width: 3400, music: 'dark',
    cineStart: 'lv23_start', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(3400), plat(700, 480, 110), plat(1000, 400, 100), plat(1300, 480, 110),
      plat(1800, 450, 130, false), plat(2200, 380, 110), plat(2600, 460, 120)],
    props: [...ruinProps(3400, 230, true), { type: 'crystal', x: 800, layer: 2, s: 1.5 }, { type: 'crystal', x: 2000, layer: 2, s: 1.8, seed: 4 },
      { type: 'crystal', x: 3000, layer: 2, s: 1.4, seed: 7 }],
    npcs: [], checkpoints: [200, 1400, 2600],
    enemies: [{ x: 900, type: 'eliteGuardian' }, { x: 1300, type: 'voidMage' }, { x: 1700, type: 'eliteGuardian' },
      { x: 2100, type: 'voidMage' }, { x: 2500, type: 'eliteGuardian' }, { x: 2900, type: 'shadowArcher' }, { x: 3100, type: 'corruptedBeast' }],
    objective: "Vyomasura's throne ki final approach",
    collectibles: [{ x: 1020, y: 360 }, { x: 2220, y: 340 }],
  },
  { // 24 — THE LAST NIGHT (final boss)
    name: 'THE LAST NIGHT', phase: 3, theme: 'citadel', width: 2600, music: 'finalboss',
    cineStart: 'lv24_start', mood: 'determined', distantTemple: false,
    platforms: [...groundRow(2600), plat(400, 460, 130), plat(2100, 460, 130), plat(1200, 400, 200)],
    props: [{ type: 'pillar', x: 250, layer: 1, seed: 95 }, { type: 'pillar', x: 2350, layer: 1, seed: 96 },
      { type: 'crystal', x: 500, layer: 2, s: 1.6 }, { type: 'crystal', x: 2100, layer: 2, s: 1.6, seed: 3 },
      { type: 'seal', x: 1300, y: 300, layer: 0, broken: true, sealProp: true }],
    npcs: [], checkpoints: [200],
    enemies: [], boss: { type: 'vyomasuraUnbound', x: 1600 }, finalBoss: true,
    objective: 'FINAL BATTLE: Vyomasura — The Unbound',
    cineAtEnd: 'finale',
  },
];

// ============================================================
// LEVEL RUNTIME
// ============================================================
class Level {
  constructor(game, index) {
    this.game = game;
    this.index = index;
    this.def = LEVELS[index];
    this.scene = new Scene({ ...this.def, seed: index * 17 + 3, bgKey: (typeof levelBgKey !== 'undefined') ? levelBgKey(this.def) : null });
    this.parts = new Particles();
    this.mood = this.def.mood || 'neutral';
    this.camX = 0; this.camY = 0; this.shakeT = 0; this.shakeMag = 0;
    this.flashT = 0; this.elephantT = -1;
    this.projectiles = []; this.corruptZones = [];
    this.timeInLevel = 0;

    const startX = 120;
    const groundY = 620;
    this.player = new Player(game.heroId, startX, groundY);
    this.companions = HERO_IDS.filter(id => id !== game.heroId).map((id, i) => new Companion(id, startX - 50 - i * 45, groundY, i));

    // powers state
    if (this.def.phase === 1 && index < 7) { this.player.powered = false; this.companions.forEach(c => c.powered = false); }
    else if (index === 16) { this.player.powered = false; this.companions.forEach(c => c.powered = false); } // level 17 silent town — no powers
    else if (index === 17 || index === 18) { this.player.powered = false; this.companions.forEach(c => c.powered = false); }
    if (index >= 18) { this.player.powered = true; this.companions.forEach(c => c.powered = true); }
    if (index === 15) { this.player.powered = true; this.companions.forEach(c => c.powered = true); }
    // lv19 grants back after altar; handled via grantPowers flag on cineAtEnd

    this.enemies = (this.def.enemies || []).map(e => new Enemy(e.type, e.x, groundY));
    this.npcs = (this.def.npcs || []).map((n, i) => ({ ...n, y: groundY, seed: i + index * 7, t: rnd(9), talked: false, rescued: false, fleeing: false, kind: n.kind || 'any' }));
    this.collectibles = (this.def.collectibles || []).map(c => ({ ...c, taken: false, t: rnd(9) }));
    this.examined = new Set();
    this.puzzleLit = new Set();
    this.symbolsDone = new Set();
    this.checkpoints = this.def.checkpoints || [200];
    this.lastCheckpoint = this.checkpoints[0];
    this.checkpointHit = new Set([this.checkpoints[0]]);
    this.rescuedCount = 0;
    this.reqCollected = 0;

    // boss
    this.boss = null; this.bossActive = false; this.bossIntroDone = false;
    // arena waves
    this.arenaState = null;
    this.exitX = this.scene.width - 90;
    this.endTriggered = false;
    this.scriptTimer = 0;
    this.hitFlashes = [];
  }
  shake(m) { if (SaveSys.data.settings.shake) { this.shakeMag = Math.max(this.shakeMag, m); this.shakeT = 0.3; } }
  spawnHitFlash(x, y) { this.hitFlashes.push({ x, y, t: 0 }); }
  onEnemyKilled(e) {
    // drop shards sometimes
    if (Math.random() < 0.4) {
      this.collectibles.push({ x: e.x, y: e.y - 30, taken: false, t: 0, shard: true });
    }
    if (this.arenaState && this.arenaState.active) this.arenaState.alive--;
  }

  get objectiveText() {
    const d = this.def;
    if (this.bossActive && this.boss && !this.boss.dead) return d.objective;
    if (d.name === 'FESTIVAL PREPARATION') return `Decoration items: ${this.reqCollected}/3 — stage ki vellandi`;
    if (d.examine && !this.def.symbols) {
      const total = d.examine.length;
      if (this.examined.size < total) return `${d.objective} (${this.examined.size}/${total})`;
    }
    if (d.puzzle && this.puzzleLit.size < d.puzzle.length) return `${d.objective} (${this.puzzleLit.size}/${d.puzzle.length})`;
    if (d.symbols && this.symbolsDone.size < 4) return `${d.objective} (${this.symbolsDone.size}/4)`;
    if (d.npcs && d.npcs.some(n => n.rescue)) {
      const total = d.npcs.filter(n => n.rescue).length;
      if (this.rescuedCount < total) return `Civilians rescue: ${this.rescuedCount}/${total}`;
    }
    if (this.arenaState && this.arenaState.active) return `WAVE ${this.arenaState.wave + 1}/${this.arenaState.waves.length} — survive!`;
    return d.objective + '  →';
  }

  canExit() {
    const d = this.def;
    if (d.boss && (!this.boss || !this.boss.dead) && !d.scriptedLoss) return false;
    if (d.examine && this.examined.size < d.examine.length) return false;
    if (d.puzzle && this.puzzleLit.size < d.puzzle.length) return false;
    if (d.symbols && this.symbolsDone.size < 4) return false;
    if (d.name === 'FESTIVAL PREPARATION' && this.reqCollected < 3) return false;
    if (d.npcs && d.npcs.some(n => n.rescue) && this.rescuedCount < d.npcs.filter(n => n.rescue).length) return false;
    if (this.arenaState && this.arenaState.active) return false;
    return true;
  }

  update(dt) {
    this.timeInLevel += dt;
    this.scene.update(dt);
    this.parts.update();
    if (this.shakeT > 0) this.shakeT -= dt; else this.shakeMag = 0;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.elephantT >= 0) { this.elephantT += dt; if (this.elephantT > 1) this.elephantT = -1; }
    for (const f of this.hitFlashes) f.t += dt;
    this.hitFlashes = this.hitFlashes.filter(f => f.t < 0.2);

    // hitstop
    if (this.player.hitstop > 0) { this.player.hitstop -= dt; return; }

    this.player.update(this, dt);
    for (const c of this.companions) c.update(this, dt);
    for (const e of this.enemies) e.update(this, dt);
    this.enemies = this.enemies.filter(e => !e.dead || e.dieT < 1.2);
    for (const p of this.projectiles) p.update(this, dt);
    this.projectiles = this.projectiles.filter(p => !p.dead);
    if (this.boss) this.boss.update(this, dt);

    // corrupt zones
    for (const z of this.corruptZones) {
      z.life -= dt;
      if (Math.abs(this.player.x - z.x) < z.w / 2 && this.player.grounded) this.player.takeHit(6 * dt * 10, 0, this);
      if (Math.random() < 0.3) this.parts.emit(z.x + rnd(-z.w / 2, z.w / 2), 620, { n: 1, color: '#a05fff', vy: -2, glow: true, dMin: 0.03, dMax: 0.06 });
    }
    this.corruptZones = this.corruptZones.filter(z => z.life > 0);

    // hazards
    for (const hz of (this.def.hazards || [])) {
      if (this.player.x > hz.x && this.player.x < hz.x + hz.w && this.player.y >= 618 && this.player.iT <= 0) {
        this.player.takeHit(hz.type === 'void' ? 20 : 10, this.player.facing * -6, this);
      }
      if (Math.random() < 0.12) this.parts.emit(hz.x + rnd(hz.w), 622, { n: 1, color: hz.type === 'void' ? '#a05fff' : '#5c8a4a', vy: -1.5, dMin: 0.02, dMax: 0.05, glow: hz.type === 'void' });
    }

    // checkpoints
    for (const cp of this.checkpoints) {
      if (!this.checkpointHit.has(cp) && this.player.x >= cp) {
        this.checkpointHit.add(cp); this.lastCheckpoint = cp;
        Audio2.sfx('checkpoint');
        this.game.toast('CHECKPOINT');
        this.game.saveProgress();
      }
    }

    // collectibles
    for (const c of this.collectibles) {
      if (c.taken) continue;
      c.t += dt;
      if (dist(this.player.x, this.player.y - 40, c.x, c.y) < 46) {
        c.taken = true; Audio2.sfx('pickup');
        this.parts.emit(c.x, c.y, { n: 10, color: '#ffd98a', glow: true });
        if (c.req) { this.reqCollected++; this.game.toast('Decoration item dorikindi!'); }
        else { SaveSys.data.shards++; this.game.toast('+1 Divine Shard'); }
      }
    }

    // NPC interactions
    this.handleNPCs(dt);
    // interact: examine / puzzle / symbols
    this.handleInteract();
    // arena waves
    this.handleArena(dt);
    // boss trigger
    this.handleBoss(dt);
    // scripted loss (level 16)
    if (this.def.scriptedLoss && this.bossActive && !this.endTriggered) {
      this.scriptTimer += dt;
      if (this.scriptTimer > this.def.lossAfter || this.player.hp < this.player.maxHp * 0.35) {
        this.endTriggered = true;
        this.game.finishLevel();
      }
    }

    // exit
    if (!this.endTriggered && this.canExit() && this.player.x > this.exitX) {
      this.endTriggered = true;
      this.game.finishLevel();
    }

    // camera
    const targetX = clamp(this.player.x - W * 0.44, 0, this.scene.width - W);
    this.camX = lerp(this.camX, targetX, 0.09);
    const targetY = clamp(this.player.y - H * 0.72, -140, 0);
    this.camY = lerp(this.camY, targetY, 0.06);
  }

  handleNPCs(dt) {
    for (const n of this.npcs) {
      n.t += dt;
      const d = Math.abs(this.player.x - n.x);
      if (n.rescue && !n.rescued) {
        // frightened crouch until rescued
        if (d < 60 && Input.hit('interact')) {
          n.rescued = true; this.rescuedCount++;
          Audio2.sfx('heal');
          this.game.subtitle(['Uncle', 'Aunty', 'Pillodu'][n.seed % 3], ['Thank you babu! Deeviinchandi!', 'Meeru... meeru heroes!', 'Anna nuvvu super!'][n.seed % 3], 2);
          this.game.toast(`Rescued ${this.rescuedCount}/${this.npcs.filter(x => x.rescue).length}`);
        }
        if (n.rescued) { n.x += 3.4; } // run to safety
        continue;
      }
      if (n.flee && this.enemies.some(e => !e.dead && Math.abs(e.x - n.x) < 350)) n.fleeing = true;
      if (n.fleeing) { n.x -= 2.8; continue; }
      if (!n.talked && d < 70 && Input.hit('interact')) {
        n.talked = true;
        const pool = n.priest ? NPC_LINES.phase3 : NPC_LINES['phase' + this.def.phase] || NPC_LINES.phase1;
        const line = pool[n.seed % pool.length];
        this.game.subtitle(line[0], line[1], 3);
        Audio2.sfx('talk');
      }
    }
  }
  handleInteract() {
    const d = this.def;
    if (Input.hit('interact')) {
      // examine points
      for (const ex of (d.examine || [])) {
        if (!this.examined.has(ex.x) && Math.abs(this.player.x - ex.x) < 80) {
          this.examined.add(ex.x);
          this.game.subtitle(CHARS[this.game.heroId].name, ex.text, 4.5);
          Audio2.sfx('uiConfirm');
          this.parts.emit(ex.x, 540, { n: 12, color: '#ffd98a', glow: true });
        }
      }
      // puzzle diyas
      for (const pz of (d.puzzle || [])) {
        const key = pz.x + ',' + pz.y;
        if (!this.puzzleLit.has(key) && Math.abs(this.player.x - pz.x) < 70 && Math.abs((this.player.y) - pz.y) < 90) {
          this.puzzleLit.add(key);
          Audio2.sfx('bell');
          this.parts.emit(pz.x, pz.y - 20, { n: 16, color: '#ffb340', glow: true });
          this.game.toast(`Diya velegindi (${this.puzzleLit.size}/${d.puzzle.length})`);
          if (this.puzzleLit.size >= d.puzzle.length) this.game.toast('Chamber door open ayindi!');
        }
      }
      // divine symbols (level 22) — each needs its hero nearby
      for (const sy of (d.symbols || [])) {
        if (this.symbolsDone.has(sy.hero)) continue;
        if (Math.abs(this.player.x - sy.x) < 80 && Math.abs(this.player.y - sy.y) < 90) {
          const heroHere = sy.hero === this.game.heroId ? this.player : this.companions.find(c => c.id === sy.hero);
          if (heroHere && Math.abs(heroHere.x - sy.x) < 220) {
            this.symbolsDone.add(sy.hero);
            Audio2.sfx('seal');
            this.parts.emit(sy.x, sy.y - 30, { n: 24, color: CHARS[sy.hero].aura, glow: true, spMax: 6 });
            this.game.subtitle(CHARS[sy.hero].name, ['Vighnesha symbol — activated!', 'Vakratunda symbol — done ra!', 'Modaka symbol — calculated.', 'Gajashakti symbol — ayyindi.'][HERO_IDS.indexOf(sy.hero)], 2.4);
          } else {
            this.game.toast(`${CHARS[sy.hero].name} daggara undali ee symbol ki`);
          }
        }
      }
    }
  }
  handleArena(dt) {
    const arenas = this.def.arena || [];
    for (const a of arenas) {
      if (!this.arenaState && Math.abs(this.player.x - a.x) < 200) {
        this.arenaState = { active: true, waves: a.waves, wave: -1, alive: 0, x: a.x, delay: 1 };
        Audio2.sfx('bossRoar');
        this.game.toast('SHADOW WAVES INCOMING!');
      }
    }
    const s = this.arenaState;
    if (s && s.active) {
      if (s.alive <= 0) {
        s.delay -= dt;
        if (s.delay <= 0) {
          s.wave++;
          if (s.wave >= s.waves.length) {
            s.active = false;
            this.game.toast('WAVES CLEARED!');
            Audio2.sfx('victory');
          } else {
            const wave = s.waves[s.wave];
            s.alive = wave.length; s.delay = 2;
            this.game.toast(`WAVE ${s.wave + 1}/${s.waves.length}`);
            wave.forEach((type, i) => {
              const e = new Enemy(type, s.x + (i % 2 ? 1 : -1) * (240 + i * 60), 560);
              this.enemies.push(e);
              this.parts.emit(e.x, e.y - 40, { n: 12, color: '#a05fff', glow: true });
            });
          }
        }
      }
    }
  }
  handleBoss(dt) {
    const bd = this.def.boss;
    if (!bd) return;
    if (!this.boss && this.player.x > bd.x - 700) {
      this.boss = new Boss(bd.type, bd.x, 620, { scripted: bd.scripted });
      this.bossActive = true;
      Audio2.sfx('bossRoar');
      Audio2.play(BOSS_DEFS[bd.type].music);
      this.shake(10);
      this.game.onBossIntro(this.boss);
    }
  }

  // ---------- RENDER ----------
  draw(ctx) {
    const shX = this.shakeMag ? rnd(-this.shakeMag, this.shakeMag) : 0;
    const shY = this.shakeMag ? rnd(-this.shakeMag, this.shakeMag) * 0.6 : 0;
    const camX = this.camX + shX, camY = this.camY + shY;

    this.scene.drawSky(ctx, camX);
    this.scene.drawHills(ctx, camX);
    this.scene.drawMidBuildings(ctx, camX);
    this.scene.drawProps(ctx, camX, camY, 0);
    this.scene.drawProps(ctx, camX, camY, 1);
    this.scene.drawGround(ctx, camX, camY);

    // hazards visual
    for (const hz of (this.def.hazards || [])) {
      const sx = hz.x - camX;
      if (sx > -300 && sx < W + 300) {
        ctx.fillStyle = hz.type === 'void' ? 'rgba(90,40,160,0.5)' : 'rgba(60,90,40,0.6)';
        ctx.fillRect(sx, 618 - camY, hz.w, 16);
        if (hz.type === 'thorns') {
          ctx.fillStyle = '#3f5a30';
          for (let i = 0; i < hz.w; i += 14) {
            ctx.beginPath(); ctx.moveTo(sx + i, 620 - camY); ctx.lineTo(sx + i + 7, 596 - camY); ctx.lineTo(sx + i + 14, 620 - camY); ctx.fill();
          }
        }
      }
    }
    // corrupt zones
    for (const z of this.corruptZones) {
      const sx = z.x - camX;
      ctx.fillStyle = `rgba(140,60,240,${0.3 + Math.sin(this.scene.t * 6) * 0.12})`;
      ctx.fillRect(sx - z.w / 2, 600 - camY, z.w, 22);
    }

    // puzzle diyas / symbols / examine markers
    this.drawInteractives(ctx, camX, camY);

    // collectibles
    for (const c of this.collectibles) {
      if (c.taken) continue;
      const sx = c.x - camX, sy = c.y - camY + Math.sin(c.t * 3) * 6;
      if (sx < -50 || sx > W + 50) continue;
      const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 20);
      const col = c.req ? '#7ac1ff' : '#ffd98a';
      g.addColorStop(0, '#fff'); g.addColorStop(0.4, col); g.addColorStop(1, col + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.t * 2);
      ctx.fillStyle = c.req ? '#cfe8ff' : '#ffedc4';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
    }

    // NPCs
    for (const n of this.npcs) {
      const sx = n.x - camX;
      if (sx < -80 || sx > W + 80) continue;
      ctx.save(); ctx.translate(sx, n.y - camY);
      if (!(typeof SpriteArt !== 'undefined' && SpriteArt.npc && SpriteArt.npc(ctx, n.seed, n.t, this.player.x > n.x ? 1 : -1)))
        Art.npc(ctx, n.kind, n.t, this.player.x > n.x ? 1 : -1, n.seed + 1);
      if ((n.rescue && !n.rescued) || (!n.talked && !n.flee && !n.rescue && Math.abs(this.player.x - n.x) < 120)) {
        ctx.fillStyle = n.rescue ? '#ffd98a' : '#8affc1';
        ctx.font = 'bold 15px Georgia'; ctx.textAlign = 'center';
        ctx.fillText(n.rescue ? '!' : 'E', 0, -118 + Math.sin(n.t * 4) * 4);
      }
      ctx.restore();
    }

    // entities
    for (const e of this.enemies) e.draw(ctx, camX, camY);
    if (this.boss) this.boss.draw(ctx, camX, camY, this);
    for (const c of this.companions) c.draw(ctx, camX, camY);
    this.player.draw(ctx, camX, camY);
    for (const p of this.projectiles) p.draw(ctx, camX, camY);

    // Kiran's elephant force manifestation
    if (this.elephantT >= 0) {
      const t = this.elephantT;
      ctx.save();
      ctx.translate(this.elephantX - camX, 620 - camY);
      ctx.scale(this.elephantF, 1);
      ctx.globalAlpha = Math.min(1, t * 4) * (1 - Math.max(0, t - 0.6) * 2.5);
      const g = ctx.createRadialGradient(60, -140, 20, 60, -140, 240);
      g.addColorStop(0, 'rgba(255,200,100,0.55)'); g.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(60, -140, 240, 0, TAU); ctx.fill();
      // giant elephant head silhouette in energy
      ctx.strokeStyle = 'rgba(255,220,140,0.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      const fw = t * 140;
      ctx.beginPath(); ctx.arc(30 + fw, -170, 70, Math.PI * 0.5, Math.PI * 1.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(70 + fw, -200); ctx.quadraticCurveTo(130 + fw, -160, 120 + fw, -80); ctx.stroke(); // trunk
      ctx.beginPath(); ctx.arc(10 + fw, -180, 34, Math.PI * 0.3, Math.PI * 1.4); ctx.stroke(); // ear
      ctx.beginPath(); ctx.moveTo(80 + fw, -150); ctx.lineTo(120 + fw, -140); ctx.stroke(); // tusk
      ctx.restore();
    }

    this.parts.draw(ctx);

    // hit flashes
    for (const f of this.hitFlashes) {
      const a = 1 - f.t / 0.2;
      ctx.save(); ctx.translate(f.x - camX, f.y - camY); ctx.rotate(f.t * 8);
      ctx.strokeStyle = `rgba(255,240,200,${a})`; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const ang = i * Math.PI / 2 + 0.4;
        ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 8, Math.sin(ang) * 8);
        ctx.lineTo(Math.cos(ang) * (16 + f.t * 90), Math.sin(ang) * (16 + f.t * 90)); ctx.stroke();
      }
      ctx.restore();
    }

    this.scene.drawProps(ctx, camX, camY, 3);
    this.scene.drawFog(ctx, camX);

    // exit indicator
    if (this.canExit() && !this.def.boss) {
      const sx = this.exitX - camX;
      if (sx > -100 && sx < W + 100) {
        ctx.fillStyle = `rgba(140,255,193,${0.5 + Math.sin(this.scene.t * 3) * 0.25})`;
        ctx.font = 'bold 26px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('→', sx, 400 - camY);
        const g = ctx.createLinearGradient(sx, 300, sx, 620);
        g.addColorStop(0, 'rgba(140,255,193,0)'); g.addColorStop(1, 'rgba(140,255,193,0.16)');
        ctx.fillStyle = g; ctx.fillRect(sx - 30, 300 - camY, 60, 320);
      }
    }

    if (this.flashT > 0) {
      ctx.fillStyle = `rgba(255,240,210,${Math.min(0.8, this.flashT * 2)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  drawInteractives(ctx, camX, camY) {
    const d = this.def;
    for (const pz of (d.puzzle || [])) {
      const key = pz.x + ',' + pz.y, lit = this.puzzleLit.has(key);
      const sx = pz.x - camX, sy = pz.y - camY;
      ctx.save(); ctx.translate(sx, sy);
      Props.diya(ctx, lit ? this.scene.t : -100);
      if (!lit) {
        ctx.fillStyle = '#8affc1'; ctx.font = 'bold 14px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('E', 0, -34 + Math.sin(this.scene.t * 4) * 3);
      }
      ctx.restore();
    }
    for (const ex of (d.examine || [])) {
      if (this.examined.has(ex.x)) continue;
      const sx = ex.x - camX;
      if (sx < -60 || sx > W + 60) continue;
      ctx.fillStyle = `rgba(255,217,138,${0.6 + Math.sin(this.scene.t * 3.5) * 0.3})`;
      ctx.font = 'bold 17px Georgia'; ctx.textAlign = 'center';
      ctx.fillText('E', sx, 470 - camY + Math.sin(this.scene.t * 4) * 4);
      ctx.beginPath(); ctx.arc(sx, 500 - camY, 5, 0, TAU); ctx.fill();
    }
    for (const sy of (d.symbols || [])) {
      const done = this.symbolsDone.has(sy.hero);
      const sx = sy.x - camX, syy = sy.y - camY;
      ctx.save(); ctx.translate(sx, syy);
      const col = CHARS[sy.hero].aura;
      ctx.strokeStyle = done ? col : 'rgba(120,110,140,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -26, 20, 0, TAU); ctx.stroke();
      ctx.beginPath();
      const idx = HERO_IDS.indexOf(sy.hero);
      if (idx === 0) { ctx.moveTo(0, -42); ctx.lineTo(0, -10); ctx.moveTo(-12, -26); ctx.lineTo(12, -26); }
      else if (idx === 1) { ctx.moveTo(-10, -36); ctx.lineTo(10, -26); ctx.lineTo(-10, -16); }
      else if (idx === 2) { ctx.arc(0, -26, 9, 0, TAU); }
      else { ctx.moveTo(-10, -16); ctx.lineTo(0, -38); ctx.lineTo(10, -16); ctx.closePath(); }
      ctx.stroke();
      if (done) {
        const g = ctx.createRadialGradient(0, -26, 2, 0, -26, 40);
        g.addColorStop(0, col + '66'); g.addColorStop(1, col + '00');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -26, 40, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = '#8affc1'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText(CHARS[sy.hero].name, 0, -54);
      }
      ctx.restore();
    }
  }
}
