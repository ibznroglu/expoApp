// services/scoreService.js
import { Query, Permission, Role, ID } from "react-native-appwrite";
import { database, config } from "../lib/appwrite";

const mapDoc = (doc) => ({
  id: doc.$id,
  userId: doc.userId,
  userName: doc.userName,
  totalScore: doc.totalScore,
  gamesPlayed: doc.gamesPlayed,
  bestScore: doc.bestScore,
  totalCorrect: doc.totalCorrect,
  totalQuestions: doc.totalQuestions,
  lastPlayedAt: doc.lastPlayedAt,
  accuracy:
    doc.totalQuestions > 0
      ? Math.round((doc.totalCorrect / doc.totalQuestions) * 100)
      : null,
});

export const submitScore = async ({
  userId,
  userName,
  score,
  correctCount,
  questionCount,
}) => {
  try {
    const res = await database.listDocuments(config.db, config.col.userStats, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    if (res.documents.length > 0) {
      const existing = res.documents[0];
      await database.updateDocument(
        config.db,
        config.col.userStats,
        existing.$id,
        {
          totalScore: existing.totalScore + score,
          gamesPlayed: existing.gamesPlayed + 1,
          bestScore: Math.max(existing.bestScore, score),
          totalCorrect: existing.totalCorrect + correctCount,
          totalQuestions: existing.totalQuestions + questionCount,
          userName,
          lastPlayedAt: new Date().toISOString(),
        }
      );
    } else {
      await database.createDocument(
        config.db,
        config.col.userStats,
        ID.unique(),
        {
          userId,
          userName,
          totalScore: score,
          gamesPlayed: 1,
          bestScore: score,
          totalCorrect: correctCount,
          totalQuestions: questionCount,
          lastPlayedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Skor kaydedilemedi:", error);
    return { success: false };
  }
};

export const getLeaderboard = async ({ limit = 50, offset = 0 } = {}) => {
  try {
    const res = await database.listDocuments(config.db, config.col.userStats, [
      Query.orderDesc("totalScore"),
      Query.limit(limit),
      Query.offset(offset),
    ]);
    return res.documents.map((d, i) => ({ ...mapDoc(d), rank: offset + i + 1 }));
  } catch (error) {
    console.error("Liderlik tablosu alınamadı:", error);
    return [];
  }
};

export const getUserStats = async (userId) => {
  if (!userId) return null;
  try {
    const res = await database.listDocuments(config.db, config.col.userStats, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return null;
    const doc = res.documents[0];
    const mapped = mapDoc(doc);
    const higher = await database.listDocuments(config.db, config.col.userStats, [
      Query.greaterThan("totalScore", doc.totalScore),
      Query.limit(1),
    ]);
    return { ...mapped, rank: higher.total + 1 };
  } catch (error) {
    console.error("Kullanıcı istatistikleri alınamadı:", error);
    return null;
  }
};
