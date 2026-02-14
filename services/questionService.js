// services/questionService.js
import { Query } from "react-native-appwrite";
import { database } from "../lib/appwrite";

const mapDoc = (doc) => ({
  id: doc.$id,
  question: doc.question,
  options: doc.options || [],
  correctAnswer: doc.correctAnswer,
  category: doc.category,
  difficulty: doc.difficulty,
  explanation: doc.explanation,
});

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const getQuestions = async (limit = 10) => {
  try {
    // Havuz boyutu: limit’in 8-12 katı iyi çalışır
    const poolSize = Math.min(200, Math.max(80, limit * 10));

    const res = await database.listDocuments("expoAppNew", "questions", [
      Query.limit(poolSize),
    ]);

    return shuffle(res.documents).slice(0, limit).map(mapDoc);
  } catch (error) {
    console.error("Sorular alınamadı:", error);
    return [];
  }
};

export const getQuestionsByCategory = async (category, limit = 10) => {
  try {
    const poolSize = Math.min(200, Math.max(80, limit * 10));

    const res = await database.listDocuments("expoAppNew", "questions", [
      Query.equal("category", category),
      Query.limit(poolSize),
    ]);

    return shuffle(res.documents).slice(0, limit).map(mapDoc);
  } catch (error) {
    console.error("Kategoriye göre sorular alınamadı:", error);
    return [];
  }
};
