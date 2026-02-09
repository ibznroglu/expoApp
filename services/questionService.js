// services/questionService.js
import { database } from "../lib/appwrite";

export const getQuestions = async (limit = 10) => {
  try {
    const response = await database.listDocuments("expoAppNew", "questions");
    const shuffled = [...response.documents].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, limit).map((doc) => ({
      id: doc.$id,
      question: doc.question,
      options: doc.options || [],
      correctAnswer: doc.correctAnswer,
      category: doc.category,
      difficulty: doc.difficulty,
      explanation: doc.explanation,
    }));

    return selectedQuestions;
  } catch (error) {
    console.error("Sorular alınamadı:", error);
    return [];
  }
};
export const getQuestionsByCategory = async (category, limit = 10) => {
  try {
    const response = await database.listDocuments("expoAppNew", "questions", [
      `category=${category}`,
    ]);

    const shuffled = [...response.documents].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit).map((doc) => ({
      id: doc.$id,
      question: doc.question,
      options: doc.options || [],
      correctAnswer: doc.correctAnswer,
      category: doc.category,
      difficulty: doc.difficulty,
      explanation: doc.explanation,
    }));
  } catch (error) {
    console.error("Kategoriye göre sorular alınamadı:", error);
    return [];
  }
};
