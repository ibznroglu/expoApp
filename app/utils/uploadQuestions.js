// utils/uploadQuestions.js
import { database } from "../../lib/appwrite";

const questions = [
  {
    question: "Halley Kuyruklu Yıldızı kaç yılda bir Dünya’dan gözlemlenir?",
    options: ["120", "76", "100", "50"],
    correctAnswer: 1,
    category: "astronomi",
    difficulty: "orta",
  },
];

export const uploadQuestions = async () => {
  try {
    const existingQuestions = await database.listDocuments(
      "expoAppNew",
      "questions",
    );
    console.log(
      "📊 Veritabanındaki toplam soru sayısı:",
      existingQuestions.total,
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
