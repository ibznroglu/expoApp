## Summary

The sound system is centrally managed in `utils/sound.js` using the `expo-audio` library.
The project contains five sound files (correct, wrong, tick, game-over, completed).
Sounds are only triggered from the Quick Game screen (`app/game/quick-game.jsx`).
The module exposes three functions: `initSounds()`, `playSound(key)`, and `unloadSounds()`.
Sound playback is tied to game events: correct answer, wrong answer, countdown timer, and game completion.

## Sound Files

| File | Format | Purpose |
|------|--------|---------|
| assets/sounds/correct.mp3 | .mp3 | Played on correct answer |
| assets/sounds/wrong.mp3 | .mp3 | Played on wrong answer |
| assets/sounds/tick.mp3 | .mp3 | Played each second when timeLeft <= 6 |
| assets/sounds/game-over.mp3 | .mp3 | Loaded but never played |
| assets/sounds/completed.mp3 | .mp3 | Played when all questions are done |

## Related Files

- `utils/sound.js` — Central sound module. Preloads all five sounds via `createAudioPlayer`,
  exposes `initSounds()` / `playSound(key)` / `unloadSounds()`. Players are module-level
  singletons; `playSound` calls `pause -> seekTo(0) -> play` to allow replaying a sound
  before it finishes.
- `app/game/quick-game.jsx` — The only consumer. Calls `initSounds()` on mount,
  `unloadSounds()` on unmount, and `playSound()` on game events.

## Event-to-Sound Mapping

| Event | Sound key | Location |
|-------|-----------|----------|
| Correct answer selected | `"correct"` | `handleAnswerSelect`, line ~91 |
| Wrong answer selected | `"wrong"` | `handleAnswerSelect`, line ~93 |
| Timer tick (timeLeft <= 6) | `"tick"` | timer `setInterval` callback, line ~114 |
| All questions completed | `"completed"` | `handleNextQuestion`, line ~76 |

## Architecture Decisions

- **Library**: `expo-audio` (successor to expo-av)
- **Preloading**: all sounds loaded at game start to avoid playback latency
- **Cleanup**: `unloadSounds()` releases players on unmount to prevent memory leaks
- **Silent mode**: `playsInSilentMode: true` — sounds play on iOS even when muted
- **Graceful degradation**: `soundsReady` state flag; game continues if init fails

## Open Questions

- `game-over.mp3` is loaded but never called — could be used when the timer expires
- No `stopSound(key)` function exists — a playing sound cannot be interrupted
- `playSound()` errors are silently swallowed (console.warn only)
- Tick sound keeps playing after an answer is selected (bug — see plans/2026-05-19_tick-sound-fix.md)
