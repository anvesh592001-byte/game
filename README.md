# GANESH CHATURTHI: THE LAST NIGHT

A complete 2D cinematic side-scrolling action-adventure game — pure HTML5 canvas + JavaScript, zero dependencies, zero external assets. Every character, enemy, boss, building, temple, idol, particle and UI element is drawn as an individual reusable vector asset at runtime.

## Play

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Click / press a key once to unlock audio.

## The Story

Four childhood friends — **Aditya, Arjun, Ravi and Kiran** — prepare to celebrate Ganesh Chaturthi in their South Indian town. Beneath the town, an ancient seal breaks. **Vyomasura**, a forgotten guardian corrupted by shadow, awakens. Blessed with four sparks of Vighnesha's divine power, the friends must fight through the last night of the festival.

**3 Phases · 24 Levels · 5 Bosses · 7 Enemy Classes**

| Phase | Levels | Mood |
|---|---|---|
| 1 — The Festival | 1–8 | Bright, funny, warm → mystery |
| 2 — The Awakening | 9–16 | Dangerous, supernatural, ends in defeat |
| 3 — The Final Night | 17–24 | Dark, emotional, epic finale |

## The Four Friends (locked character bible)

- **ADITYA** — Leader, balanced fighter. Maroon kurta, golden trim, sacred wrist thread. *Vighnesha Force* → ult: **Ganapati's Resolve**
- **ARJUN** — The joker, agile fighter with double jump. Mustard kurta + green waistcoat. *Vakratunda Dash* → ult: **Thunder Dash**
- **RAVI** — The brain, ranged support. Blue kurta, Nehru jacket, **permanent rectangular spectacles**. *Modaka Pulse* → ult: **Divine Barrage**
- **KIRAN** — The wall, heavy defender. Green kurta, **permanent trimmed moustache**, tallest of the four. *Gajashakti* → ult: **Elephant Force**

Pick one hero; the other three fight beside you as companion AI (they follow, attack, dodge, kite, revive, and banter in Tenglish).

## Controls (remappable in CONTROLS menu)

| Key | Action |
|---|---|
| A / D | Move |
| W | Jump (W again = Arjun double jump) |
| S | Drop through platforms / fast-fall |
| J | Basic attack |
| K | Special attack (energy) |
| L | Ultimate (when meter full) |
| SHIFT | Dash / dodge (i-frames) |
| E | Interact / rescue / examine |
| ESC | Pause |

## Systems

- Full Tenglish cinematic dialogue with subtitles (size + on/off in settings)
- Cinematic engine: letterboxing, camera moves, emotion beats, title cards, narrator
- Checkpoints + death menu (Continue / Restart / Main menu)
- Auto-save (level progress, character, upgrades, shards, settings, key bindings) via localStorage
- Progression: Divine Shards → health / energy / damage / ult / speed upgrades
- Boss fights with intro stingers, health bars, phases, telegraphs, pattern sets
- Wave arenas, rescue objectives, diya puzzles, carving examination, four-symbol gate ritual
- Procedural WebAudio soundtrack (festival dhol, mystery drones, epic boss themes) + full SFX
- Layered parallax scenes: festival streets (day/evening/night), storm, corruption, forest, temple, demon citadel, dawn

## QA

```bash
node test/qa.js
```

Headless harness simulates all 24 levels (300 frames each with random input), all cinematics, boss kills, the scripted level-16 defeat, ultimates for all four heroes, save/load roundtrip, checkpoint respawn, a full fast-forward playthrough, and render passes for every pose/emotion/enemy/boss/UI screen.
