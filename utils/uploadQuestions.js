// utils/uploadQuestions.js
import { database } from "../lib/appwrite";
import {
  normalize,
  tokenize,
  jaccard,
  resolveAnswer,
  fetchAllExisting,
  buildExistingIndex,
  JACCARD_THRESHOLD,
} from "./uploadDedupHelper";

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

const dedupeBatch = (batch) => {
  const seen = new Set();
  const unique = [];
  let intraSkipped = 0;
  for (const q of batch) {
    const key = normalize(q.question);
    if (seen.has(key)) { intraSkipped++; continue; }
    seen.add(key);
    unique.push(q);
  }
  return { unique, intraSkipped };
};

export const uploadQuestions = async () => {
  if (isUploading) {
    return { added: 0, skippedExact: 0, skippedSuspectedStrong: 0, skippedReview: 0, alreadyRunning: true };
  }
  isUploading = true;

  try {
    const existingDocs = await fetchAllExisting(database);
    console.log("📊 Veritabanındaki toplam soru sayısı:", existingDocs.length);

    const existingIndex = buildExistingIndex(existingDocs);
    const existingNormSet = new Set(existingIndex.map((e) => e.normQuestion));

    const { unique, intraSkipped } = dedupeBatch(questions);

    let added = 0;
    let skippedExact = intraSkipped;
    let skippedSuspectedStrong = 0;
    let skippedReview = 0;

    for (const q of unique) {
      const normQ = normalize(q.question);

      // LAYER 1 — exact / normalized duplicate
      if (existingNormSet.has(normQ)) {
        skippedExact++;
        console.log("⏭️  Birebir kopya, atlandı:", q.question);
        continue;
      }

      // LAYER 2 — semantic suspect (same category + same resolved answer)
      const qTokens = tokenize(q.question);
      const qAnswer = resolveAnswer(q);
      const semanticMatch = existingIndex.find(
        (e) =>
          e.category === q.category &&
          e.answer !== "" &&
          e.answer === qAnswer
      );
      if (semanticMatch) {
        const score = jaccard(qTokens, semanticMatch.tokens);
        if (score >= JACCARD_THRESHOLD) {
          skippedSuspectedStrong++;
          console.log("⚠️  Güçlü şüpheli benzer soru, atlandı:");
          console.log("    Yeni soru   :", q.question);
          console.log(`    Mevcut soru : [${semanticMatch.id}] ${semanticMatch.question}`);
        } else {
          skippedReview++;
          console.log("🔍  İnceleme gerekli (aynı kategori+cevap, düşük kelime örtüşmesi):");
          console.log("    Yeni soru   :", q.question);
          console.log(`    Mevcut soru : [${semanticMatch.id}] ${semanticMatch.question}`);
          console.log(`    Jaccard skoru: ${score.toFixed(3)}`);
        }
        continue;
      }

      await database.createDocument("expoAppNew", "questions", "unique()", q);
      existingNormSet.add(normQ);
      existingIndex.push({
        id: "(yeni)",
        question: q.question,
        normQuestion: normQ,
        tokens: qTokens,
        category: q.category,
        answer: qAnswer,
      });
      added++;
    }

    console.log("✅ Yükleme tamamlandı.");
    console.log(`   Eklenen                        : ${added}`);
    console.log(`   Birebir kopya                  : ${skippedExact}`);
    console.log(`   Güçlü şüpheli (jaccard>=${JACCARD_THRESHOLD}): ${skippedSuspectedStrong}`);
    console.log(`   İnceleme gerekli               : ${skippedReview}`);

    return { added, skippedExact, skippedSuspectedStrong, skippedReview };
  } catch (error) {
    console.error("❌ Soru yükleme hatası:", error);
    throw error;
  } finally {
    isUploading = false;
  }
};
