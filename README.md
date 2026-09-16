# AETHER DRIFT — Smooth 2D Remake

**v2.5** — A complete 2D platformer remake with upgraded graphics, redesigned characters, and two full levels.

Play: `python3 -m http.server 8000` → `http://localhost:8000` or open `AETHER-DRIFT-v2.5-SINGLE-FILE.html` directly (no server needed).

---

## 🎮 How to Play
- **Move:** `A/D` or `←/→`
- **Jump:** `W` / `SPACE` / `↑` (hold for higher, coyote time + jump buffer)
- **Dash:** `SHIFT` or `J` (air-dash, invincible frames, destroys enemies)
- **Wall Jump (Level 2):** Hold `A` or `D` against a wall to slide slowly → press **Jump** to launch off
- **Pause:** `P` • **Restart:** `R` • **Mute:** `M` • **Map:** `Esc` or button
- **Mobile:** On-screen `‹ › + ⤒ + ⚡`

---

## ✨ What's New in v2.5 (Continued)

### Level 02 — CRYSTAL SPIRES (NEW)
- **Theme:** Twilight cavern — dark purple/blue cave, stalactites, glowing crystals, volumetric fog, background crystal bloom
- **Mechanics:**
  - **Wall Slide & Wall Jump** — tall grip walls, slide particles, `🧗 WALL JUMP!` feedback
  - **Fragile Crystal Platforms** — crack when you stand, turn red, then shatter & fall (keep moving!)
  - **Dash Crystals** 🔷 — cyan diamonds that instantly refill your dash
  - **Cave Parallax** — stalactites, distant crystal glows, fog layers
- **Layout:** 4400px, wall-shaft tutorials → fragile bridge over spikes → moving crystals → vertical wall climbs → lantern alley → final spire climb to portal
- **Enemies:** `🦀 Crystal Crabs` (ground patrollers) + `🏮 Lanterns` (floating, pulsing glow ring)
- **12 shards + 3 dash crystals**, 2 spikes pits, moving + vertical platforms

### Expanded World
- **World Map** — select Level 01 or 02, see best time / shards / grade per level, Level 2 unlocks after beating Level 1
- **Save System** — `localStorage` remembers best time, best shards, grade, and unlocked levels
- **Level Progression** — win screen shows “Next Level →” for seamless flow, portal color changes per level (cyan → purple)

### Characters — 4 Skins (Redesigned)
- **KIKO** — Cyan scarf, cyan trail (default explorer)
- **NOVA** — Magenta spark, magenta trail
- **YUKI** — Ice blue, frost trail
- **EMBER** — Orange blaze, orange trail
- All skins share the same smooth capsule body: gradient suit, fluffy physics scarf (sine flutter), backpack, antenna light, big tracking eyes, squash & stretch, dash glow ring — trail color follows skin

### Graphics+ Enhancements
- **60FPS Delta-Time Engine** — DPR scaling, lerp camera with look-ahead, screen shake, motion blur, bloom, vignette, scanlines
- **Cave Rendering:** crystal platforms with glow edges + shard on top, grip walls with horizontal lines, fragile cracking animation & shake, ground2 dark purple base with crystal teeth
- **New Particles:** wall-slide dust, crystal shatter, dash-crystal refill burst
- **HUD Upgrades:** wall-hint `🧗 Wall Jump Ready`, dynamic level label, dash meter, progress bar

---

## 📁 Files
- `index.html` — stage, HUD, world map + skin pick, overlays
- `style.css` — glassmorphism, level cards, skin dots, gradients
- `game.js` — engine (camera, particles, audio), `buildLevel1()` + `buildLevel2()`, wall-jump physics, fragile logic, skin system, save
- `AETHER-DRIFT-v2.5-SINGLE-FILE.html` — single-file build (just open it)

## 🗺 Levels
| # | Name | Theme | New Mechanic | Difficulty |
|---|------|-------|--------------|------------|
| 01 | Verdant Ascent | Floating Gardens | Dash, Moving Platforms | Easy |
| 02 | Crystal Spires | Twilight Cavern | Wall Jump, Fragile, Dash Crystals | Medium |

Beat Level 1 to unlock Level 2. Collect all 12 shards for `S+` grade (under 58s).

Enjoy the flow!
