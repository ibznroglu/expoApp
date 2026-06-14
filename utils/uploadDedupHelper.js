import { Query } from "react-native-appwrite";

const DB_ID = "expoAppNew";
const COL_ID = "questions";

const TR_FOLD = {
  "ı": "i", "İ": "i", "I": "i", "i": "i",
  "ş": "s", "Ş": "s",
  "ç": "c", "Ç": "c",
  "ğ": "g", "Ğ": "g",
  "ö": "o", "Ö": "o",
  "ü": "u", "Ü": "u",
};

export const normalize = (text) => {
  if (!text) return "";
  let out = "";
  for (const ch of String(text)) {
    out += TR_FOLD[ch] ?? ch;
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const tokenize = (text) => {
  const norm = normalize(text);
  if (!norm) return new Set();
  return new Set(norm.split(" ").filter(Boolean));
};

export const jaccard = (aSet, bSet) => {
  if (aSet.size === 0 && bSet.size === 0) return 0;
  let intersection = 0;
  for (const t of aSet) if (bSet.has(t)) intersection++;
  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const resolveAnswer = (q) => {
  const opts = Array.isArray(q?.options) ? q.options : [];
  const idx = q?.correctAnswer;
  if (typeof idx !== "number" || idx < 0 || idx >= opts.length) return "";
  return normalize(opts[idx]);
};

export const JACCARD_THRESHOLD = 0.6;

export const fetchAllExisting = async (database) => {
  const docs = [];
  let cursor = null;
  while (true) {
    const queries = [
      Query.select(["$id", "question", "options", "correctAnswer", "category"]),
      Query.limit(100),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await database.listDocuments(DB_ID, COL_ID, queries);
    if (res.documents.length === 0) break;
    for (const doc of res.documents) docs.push(doc);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
    if (docs.length > 100_000) break;
  }
  return docs;
};

export const buildExistingIndex = (docs) =>
  docs.map((d) => ({
    id: d.$id,
    question: d.question,
    normQuestion: normalize(d.question),
    tokens: tokenize(d.question),
    category: d.category,
    answer: resolveAnswer(d),
  }));
