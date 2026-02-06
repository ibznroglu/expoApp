// utils/uploadQuestions.js
import { Query } from "react-native-appwrite"; // Eğer hata verirse söyle, import'u projene göre düzeltelim.
import { database } from "../../lib/appwrite";

const questions = [
  {
    question: "Hangi gezegenin etrafında en fazla uydu bulunur?",
    options: ["Uranüs", "Neptün", "Satürn", "Jüpiter"],
    correctAnswer: 3,
    category: "astronomi",
    difficulty: "kolay",
  },
];

let isUploading = false; // aynı anda iki kez çalışmayı engellemek için

export const uploadQuestions = async () => {
  if (isUploading) return { added: 0, skipped: 0, alreadyRunning: true };
  isUploading = true;

  try {
    // Toplam sayıyı görmek istiyorsan:
    const existingQuestions = await database.listDocuments(
      "expoAppNew",
      "questions",
    );
    console.log(
      "📊 Veritabanındaki toplam soru sayısı:",
      existingQuestions.total,
    );

    let added = 0;
    let skipped = 0;

    for (const q of questions) {
      // Aynı soru var mı? (pagination yok, nokta atışı)
      const found = await database.listDocuments("expoAppNew", "questions", [
        Query.equal("question", q.question),
        Query.limit(1),
      ]);

      if (found.total > 0) {
        skipped++;
        continue;
      }

      await database.createDocument("expoAppNew", "questions", "unique()", q);
      added++;
    }

    return { added, skipped };
  } catch (error) {
    console.error("❌ Soru yükleme hatası:", error);
    throw error;
  } finally {
    isUploading = false;
  }
};
