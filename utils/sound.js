import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let players = {};
let ready = false;

const SOURCES = {
  correct: require("../assets/sounds/correct.mp3"),
  wrong: require("../assets/sounds/wrong.mp3"),
  tick: require("../assets/sounds/tick.mp3"),
  gameOver: require("../assets/sounds/game-over.mp3"),
  completed: require("../assets/sounds/completed.mp3"),
  bravo: require("../assets/sounds/bravo.mp3"),
  buttonClick: require("../assets/sounds/button-click.wav"),
  bubble: require("../assets/sounds/bubble.wav"),
  dailyPrize: require("../assets/sounds/daily-prize.wav"),
  woosh: require("../assets/sounds/woosh.wav"),
};

export const initSounds = async () => {
  if (ready) return;

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    allowsRecording: false,
  });

  players.correct = createAudioPlayer(SOURCES.correct);
  players.wrong = createAudioPlayer(SOURCES.wrong);
  players.tick = createAudioPlayer(SOURCES.tick);
  players.gameOver = createAudioPlayer(SOURCES.gameOver);
  players.completed = createAudioPlayer(SOURCES.completed);
  players.bravo = createAudioPlayer(SOURCES.bravo);
  players.buttonClick = createAudioPlayer(SOURCES.buttonClick);
  players.bubble = createAudioPlayer(SOURCES.bubble);
  players.dailyPrize = createAudioPlayer(SOURCES.dailyPrize);
  players.woosh = createAudioPlayer(SOURCES.woosh);

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
    p.pause?.();
    p.seekTo(0);
    p.play();
  } catch (e) {
    console.warn("playSound error", e);
  }
};

export const playUISound = (type) => {
  return new Promise((resolve) => {
    switch (type) {
      case "button":
        playSound("buttonClick");
        setTimeout(resolve, 200);
        break;
      case "modal":
        playSound("buttonClick");
        setTimeout(() => {
          playSound("bubble");
          setTimeout(resolve, 350);
        }, 150);
        break;
      case "daily-prize":
        playSound("dailyPrize");
        setTimeout(resolve, 300);
        break;
      default:
        resolve();
    }
  });
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
        p.release();
      } catch {}
    });
  } finally {
    players = {};
    ready = false;
  }
};
