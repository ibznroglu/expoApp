// utils/uploadQuestions.js
import { database } from '../../lib/appwrite';

const questions = [
  {
question: "En büyük 2 basamaklı tek sayı kaçtır?",
options: ["-11", "11", "-99", "99"],
correctAnswer: 3,
category: "matematik",
difficulty: "kolay"
},
];

export const uploadQuestions = async () => {
  try {
    const existingQuestions = await database.listDocuments('expoAppNew', 'questions');
    const existingQuestionMap = new Map();
    
    existingQuestions.documents.forEach(doc => {
      existingQuestionMap.set(doc.question, true);
    });
    const newQuestions = questions.filter(q => !existingQuestionMap.has(q.question));

    if (newQuestions.length === 0) {
      console.log('ℹ️  Tüm sorular zaten mevcut, yeni soru yok.');
      return;
    }
    for (const q of newQuestions) {
      try {
        await database.createDocument('expoAppNew', 'questions', 'unique()', q);
        console.log('✅ Soru eklendi:', q.question);
      } catch (error) {
        console.error('❌ Hata:', error);
      }
    }

    console.log(`\n📊 ${newQuestions.length} yeni soru eklendi`);

  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  }
};