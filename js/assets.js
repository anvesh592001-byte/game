// ============================================================
// GANESH CHATURTHI: THE LAST NIGHT — assets.js
// Image asset manifest + loader. Every image is an individual
// generated art asset. Loader degrades gracefully: if an image
// is missing or still loading, callers fall back to vector art.
// ============================================================
'use strict';

const IMG = {
  M: {
    // --- master character references (locked identities) ---
    hero_aditya: 'assets/characters/aditya/master_fullbody.jpg',
    hero_arjun: 'assets/characters/arjun/master_fullbody.jpg',
    hero_ravi: 'assets/characters/ravi/master_fullbody.jpg',
    hero_kiran: 'assets/characters/kiran/master_fullbody.jpg',
    vyomasura: 'assets/villain/vyomasura/master_fullbody.jpg',
    // --- environment backgrounds (one per major location) ---
    bg_festival_day: 'assets/backgrounds/bg_festival_day.jpg',
    bg_festival_evening: 'assets/backgrounds/bg_festival_evening.jpg',
    bg_festival_night: 'assets/backgrounds/bg_festival_night.jpg',
    bg_storm_night: 'assets/backgrounds/bg_storm_night.jpg',
    bg_corrupted: 'assets/backgrounds/bg_corrupted.jpg',
    bg_forest: 'assets/backgrounds/bg_forest.jpg',
    bg_temple: 'assets/backgrounds/bg_temple.jpg',
    bg_chamber: 'assets/backgrounds/bg_chamber.jpg',
    bg_citadel: 'assets/backgrounds/bg_citadel.jpg',
    bg_dawn: 'assets/backgrounds/bg_dawn.jpg',
    // --- gameplay sprite sheets (chroma-keyed, 8 poses each) ---
    sprites_aditya: 'assets/characters/aditya/sprites.png',
    sprites_arjun: 'assets/characters/arjun/sprites.png',
    sprites_ravi: 'assets/characters/ravi/sprites.png',
    sprites_kiran: 'assets/characters/kiran/sprites.png',
    // --- boss splash art ---
    boss_unbound: 'assets/bosses/vyomasura_unbound_splash.jpg',
    boss_fallen: 'assets/bosses/fallen_guardian_splash.jpg',
    boss_shadowbeast: 'assets/bosses/shadow_beast_splash.jpg',
    boss_templeguardian: 'assets/bosses/temple_guardian_splash.jpg',
    // --- enemy class artwork (encounter intros / bestiary) ---
    enemy_shadowRunner: 'assets/enemies/shadow_runner/art.jpg',
    enemy_ashWarrior: 'assets/enemies/ash_warrior/art.jpg',
    enemy_stoneGuardian: 'assets/enemies/stone_guardian/art.jpg',
    enemy_shadowArcher: 'assets/enemies/shadow_archer/art.jpg',
    enemy_corruptedBeast: 'assets/enemies/corrupted_beast/art.jpg',
    enemy_voidMage: 'assets/enemies/void_mage/art.jpg',
    enemy_eliteGuardian: 'assets/enemies/elite_guardian/art.jpg',
    // --- cinematics (extra) ---
    cine_storm: 'assets/cinematics/storm_arrival.jpg',
    cine_confront: 'assets/cinematics/first_confrontation.jpg',
    // --- festival props (transparent PNG, bottom-anchored) ---
    prop_pandal: 'assets/props/pandal_stage.png',
    prop_stall: 'assets/props/food_stall.png',
    prop_idol_small: 'assets/props/ganesh_idol_small.png',
    prop_toran: 'assets/props/marigold_toran.png',
    prop_tree: 'assets/props/banyan_tree.png',
    prop_shrine: 'assets/props/stone_shrine.png',
    prop_arch: 'assets/props/festival_arch.png',
    prop_lamp: 'assets/props/street_lamp.png',
    prop_lamp_corrupt: 'assets/props/street_lamp_corrupt.png',
    // --- buildings (image-first houses/shops, festive + corrupted variants) ---
    bld_house_a: 'assets/props/house_festive_a.png',
    bld_house_b: 'assets/props/house_festive_b.png',
    bld_shop: 'assets/props/shop_festive.png',
    bld_house_cor: 'assets/props/house_corrupt.png',
    bld_shop_cor: 'assets/props/shop_corrupt.png',
    // --- villain keyframe sheets ---
    kf_vyomasura: 'assets/villain/vyomasura/keyframes.png',
    kf_vyomasuraUnbound: 'assets/villain/vyomasura/keyframes_unbound.png',
    // --- UI ---
    icons: 'assets/ui/icons/ability_icons.jpg',
    menu_group: 'assets/ui/menus/menu_group_art.jpg',
    // --- cinematic storyboards ---
    cine_seal_break: 'assets/cinematics/seal_break.jpg',
    cine_vyo_awaken: 'assets/cinematics/vyomasura_awakens.jpg',
    cine_powers: 'assets/cinematics/divine_powers.jpg',
    cine_finale: 'assets/cinematics/finale_sunrise.jpg',
    cine_friends_festival: 'assets/cinematics/friends_festival.jpg',
    cine_defeat: 'assets/cinematics/first_defeat.jpg',
    cine_rise: 'assets/cinematics/the_rise.jpg',
    cine_silent_town: 'assets/cinematics/silent_town.jpg',
  },
  cache: {},

  get(key) {
    if (typeof Image === 'undefined') return null; // headless QA
    let e = this.cache[key];
    if (!e) {
      const src = this.M[key];
      if (!src) return null;
      const img = new Image();
      e = this.cache[key] = { img, ok: false, failed: false };
      img.onload = () => { e.ok = true; };
      img.onerror = () => { e.failed = true; };
      img.src = src;
    }
    return e.ok ? e.img : null;
  },
  has(key) { const e = this.cache[key]; return !!(e && e.ok); },
  preloadAll() {
    if (typeof Image === 'undefined') return;
    for (const k in this.M) this.get(k);
  },

  // draw with optional fractional crop {sx,sy,sw,sh} (0..1 of source)
  draw(ctx, key, dx, dy, dw, dh, crop) {
    const img = this.get(key);
    if (!img) return false;
    if (crop) {
      ctx.drawImage(img, crop.sx * img.width, crop.sy * img.height,
        crop.sw * img.width, crop.sh * img.height, dx, dy, dw, dh);
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    return true;
  },
  // draw image to COVER a rect (like css background-size: cover), with pan offset 0..1
  drawCover(ctx, key, dx, dy, dw, dh, panX = 0.5, panY = 0.5) {
    const img = this.get(key);
    if (!img) return false;
    const s = Math.max(dw / img.width, dh / img.height);
    const sw = dw / s, sh = dh / s;
    const sx = (img.width - sw) * clamp(panX, 0, 1);
    const sy = (img.height - sh) * clamp(panY, 0, 1);
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return true;
  },
};

// crop presets for the master sheets (3-view sheets → single figure / portrait)
const CROPS = {
  heroFigure: { sx: 0.412, sy: 0.015, sw: 0.176, sh: 0.965 }, // center figure of 3-view sheet
  heroPortrait: { sx: 0.438, sy: 0.03, sw: 0.124, sh: 0.235 }, // head/shoulders of center figure
  vyoFull: { sx: 0.02, sy: 0.0, sw: 0.96, sh: 1.0 },
  vyoFace: { sx: 0.32, sy: 0.09, sw: 0.36, sh: 0.17 },
};

// theme → background image key
const THEME_IMG = {
  festivalDay: 'bg_festival_day',
  festivalEvening: 'bg_festival_evening',
  festivalNight: 'bg_festival_night',
  stormNight: 'bg_storm_night',
  corrupted: 'bg_corrupted',
  forest: 'bg_forest',
  temple: 'bg_temple',
  citadel: 'bg_citadel',
  dawn: 'bg_dawn',
};
function levelBgKey(def) {
  if (def.underground) return 'bg_chamber';
  return THEME_IMG[def.theme] || 'bg_festival_night';
}

// gameplay tips for level intro cards
const LEVEL_TIPS = [
  'Watch your surroundings. Not every shadow is an enemy.',
  'SHIFT dash lo invincibility frames untayi — timing nerchuko.',
  'Companions padipothe kuda 6 seconds lo malli lestaru.',
  'Enemy attack ki mundhu red flash telegraph kanipistundi.',
  'Divine Shards tho upgrades konu — 3 shards oka upgrade.',
  'Ravi range lo strong. Kiran crowd lo strong.',
  'Ultimate meter full ayite L press cheyyi — waste cheyyoddu.',
  'One-way platforms meeda S+W tho kindaki digavachu.',
];
