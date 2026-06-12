// services/questionService.js
import { Query } from "react-native-appwrite";
import { database, config } from "../lib/appwrite";
import { fisherYatesShuffle, loadSeenIds, appendSeenIds } from "../utils/seenQuestions";

const mapDoc = (doc) => ({
  id: doc.$id,
  question: doc.question,
  options: doc.options || [],
  correctAnswer: doc.correctAnswer,
  category: doc.category,
  difficulty: doc.difficulty,
  explanation: doc.explanation,
});

const fetchAllIds = async (extraQueries = []) => {
  const ids = [];
  let cursor = null;
  while (true) {
    const queries = [...extraQueries, Query.select(["$id"]), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await database.listDocuments(config.db, config.col.questions, queries);
    if (res.documents.length === 0) break;
    for (const doc of res.documents) ids.push(doc.$id);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
    if (ids.length > 100_000) break;
  }
  return ids;
};

const pickIds = async (allIds, count) => {
  const seen = await loadSeenIds();
  const seenSet = new Set(seen);
  let candidates = allIds.filter((id) => !seenSet.has(id));

  let releaseIdx = 0;
  while (candidates.length < count && releaseIdx < seen.length) {
    seenSet.delete(seen[releaseIdx]);
    releaseIdx++;
    candidates = allIds.filter((id) => !seenSet.has(id));
  }
  if (candidates.length < count) candidates = [...allIds];

  const shuffled = fisherYatesShuffle(candidates);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const fetchDocsByIds = async (ids) => {
  if (ids.length === 0) return [];
  const res = await database.listDocuments(config.db, config.col.questions, [
    Query.equal("$id", ids),
    Query.limit(ids.length),
  ]);
  const docMap = new Map(res.documents.map((doc) => [doc.$id, doc]));
  return ids.map((id) => docMap.get(id)).filter(Boolean).map(mapDoc);
};

export const getQuestions = async (limit = 10) => {
  try {
    const allIds = await fetchAllIds();
    if (allIds.length === 0) return [];
    const chosenIds = await pickIds(allIds, limit);
    const docs = await fetchDocsByIds(chosenIds);
    await appendSeenIds(docs.map((d) => d.id));
    return docs;
  } catch (error) {
    console.error("Sorular alınamadı:", error);
    return [];
  }
};

export const getQuestionsByCategory = async (category, limit = 10) => {
  try {
    const allIds = await fetchAllIds([Query.equal("category", category)]);
    if (allIds.length === 0) return [];
    const chosenIds = await pickIds(allIds, limit);
    const docs = await fetchDocsByIds(chosenIds);
    await appendSeenIds(docs.map((d) => d.id));
    return docs;
  } catch (error) {
    console.error("Kategoriye göre sorular alınamadı:", error);
    return [];
  }
};
