// utils/uploadQuestions.js
import { database } from "../../lib/appwrite";

const questions = [
  {
    question: "En büyük 2 basamaklı tek sayı kaçtır?",
    options: ["-11", "11", "-99", "99"],
    correctAnswer: 3,
    category: "matematik",
    difficulty: "kolay",
  },
];

export const uploadQuestions = async () => {
  try {
    const existingQuestions = await database.listDocuments(
      "expoAppNew",
      "questions",
    );

    const existingQuestionMap = new Map();
    existingQuestions.documents.forEach((doc) => {
      existingQuestionMap.set(doc.question, true);
    });

    const newQuestions = questions.filter(
      (q) => !existingQuestionMap.has(q.question),
    );

    if (newQuestions.length === 0) {
      return { added: 0 };
    }

    for (const q of newQuestions) {
      await database.createDocument("expoAppNew", "questions", "unique()", q);
    }

    return { added: newQuestions.length };
  } catch (error) {
    console.error("❌ Soru yükleme hatası:", error);
    throw error;
  }
};
