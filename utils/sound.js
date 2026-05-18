// app/utils/sound.js (veya nerede duruyorsa)
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let players = {};
let ready = false;

const SOURCES = {
  correct: require("../assets/sounds/correct.mp3"),
  wrong: require("../assets/sounds/wrong.mp3"),
  tick: require("../assets/sounds/tick.mp3"),
  gameOver: require("../assets/sounds/game-over.mp3"),
  completed: require("../assets/sounds/completed.mp3"),
};

export const initSounds = async () => {
  if (ready) return;

  // Global audio davranışı (iOS sessizde de çalsın)
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    allowsRecording: false,
    // İstersen:
    // interruptionMode: "mixWithOthers",
  }); // expo-audio API :contentReference[oaicite:2]{index=2}

  // Player'ları oluştur
  players.correct = createAudioPlayer(SOURCES.correct);
  players.wrong = createAudioPlayer(SOURCES.wrong);
  players.tick = createAudioPlayer(SOURCES.tick);
  players.gameOver = createAudioPlayer(SOURCES.gameOver);
  players.completed = createAudioPlayer(SOURCES.completed);

  // SFX için kısa ve net
  Object.values(players).forEach((p) => {
    p.loop = false;
    p.volume = 1;
  });

  ready = true;
};

export const playSound = (key) => {
  try {
    const p = players[key];
    if (!p) return;

    // expo-audio: ses bitince pozisyon resetlenmez -> tekrar çalmak için seekTo(0) şart :contentReference[oaicite:3]{index=3}
    p.pause?.(); // bazı platformlarda gerekmeyebilir ama güvenli
    p.seekTo(0);
    p.play();
  } catch (e) {
    // sessizce geç (oyunu bozmasın)
    console.warn("playSound error", e);
  }
};

export const stopSound = (key) => {
  try {
    const p = players[key];
    if (!p) return;
    p.pause?.();
    p.seekTo(0);
  } catch (e) {
    console.warn("stopSound error", e);
  }
};

export const unloadSounds = async () => {
  try {
    Object.values(players).forEach((p) => {
      try {
        p.release(); // createAudioPlayer ile oluşturulanlar için önemli :contentReference[oaicite:4]{index=4}
      } catch {}
    });
  } finally {
    players = {};
    ready = false;
  }
};
