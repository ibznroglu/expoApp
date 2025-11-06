
export const quizQuestions = {
  genelKultur: [
    {
      id: 1,
      question: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
      correctAnswer: 1,
      category: "genelKultur",
      difficulty: "kolay"
    },
    {
      id: 2,
      question: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?",
      options: ["Venüs", "Mars", "Jüpiter", "Satürn"],
      correctAnswer: 1,
      category: "bilim",
      difficulty: "kolay"
    },
    {
      id: 3,
      question: "Mona Lisa tablosu kime aittir?",
      options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"],
      correctAnswer: 2,
      category: "sanat",
      difficulty: "orta"
    },
    {
      id: 4,
      question: "Hangi elementin sembolü 'Au'dur?",
      options: ["Gümüş", "Altın", "Alüminyum", "Argon"],
      correctAnswer: 1,
      category: "bilim",
      difficulty: "orta"
    },
    {
      id: 5,
      question: "İstanbul'un fethi hangi yılda gerçekleşmiştir?",
      options: ["1453", "1451", "1455", "1457"],
      correctAnswer: 0,
      category: "tarih",
      difficulty: "kolay"
    }
  ],
  spor: [
    {
      id: 6,
      question: "FIFA Dünya Kupası'nda en çok şampiyon olan takım hangisidir?",
      options: ["Almanya", "İtalya", "Brezilya", "Arjantin"],
      correctAnswer: 2,
      category: "spor",
      difficulty: "orta"
    }
  ]
};

export const getRandomQuestions = (count = 10) => {
  const allQuestions = Object.values(quizQuestions).flat();
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};