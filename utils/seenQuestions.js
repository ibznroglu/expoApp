import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@bilgiArenasi/seenQuestionIds";
const MAX_SEEN = 35;

export const fisherYatesShuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const loadSeenIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Görülen sorular okunamadı:", e);
    return [];
  }
};

export const saveSeenIds = async (ids) => {
  if (!Array.isArray(ids)) return;
  try {
    const trimmed = ids.slice(-MAX_SEEN);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Görülen sorular kaydedilemedi:", e);
  }
};

export const appendSeenIds = async (newIds) => {
  const existing = await loadSeenIds();
  const merged = [...existing, ...newIds];
  const seen = new Set();
  const deduped = [];
  for (let i = merged.length - 1; i >= 0; i--) {
    if (!seen.has(merged[i])) {
      seen.add(merged[i]);
      deduped.unshift(merged[i]);
    }
  }
  await saveSeenIds(deduped);
  return deduped.slice(-MAX_SEEN);
};

export const clearSeenIds = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Görülen sorular temizlenemedi:", e);
  }
};
