import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { quickGameStyles as s } from "../../assets/styles/quickGameStyle";
import { getQuestions } from "../../services/questionService";
import {
  initSounds,
  playSound,
  playUISound,
  stopSound,
  unloadSounds,
} from "../../utils/sound";
import TextCustom from "../components/TextCustom";
import { Colors } from "../../constants/theme";

const BG_GRADIENT = ['#3D1A7A', '#22107A', '#130850', '#080320'];

export default function QuickGame() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundsReady, setSoundsReady] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const timedOutRef = useRef(false);
  const exitingRef = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const randomQuestions = await getQuestions(10);
      setQuestions(randomQuestions);
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      try {
        const fallbackQuestions = await getQuestions(10);
        setQuestions(fallbackQuestions);
      } catch (e) {
        console.error("Fallback sorular da yüklenemedi:", e);
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    (async () => {
      try {
        await initSounds();
        setSoundsReady(true);
      } catch (e) {
        console.warn("initSounds failed:", e);
        setSoundsReady(false);
      }
    })();

    return () => {
      unloadSounds().catch(() => {});
    };
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      if (soundsReady) playSound("completed");
      setGameCompleted(true);
    }
  }, [currentQuestionIndex, questions.length, soundsReady]);

  const animateOptionPress = useCallback((index) => {
    if (index >= scaleAnims.length) return;
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1.0, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [scaleAnims]);

  const handleAnswerSelect = useCallback(
    (answerIndex) => {
      animateOptionPress(answerIndex);
      if (!currentQuestion) return;
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answerIndex);
      if (soundsReady) stopSound("tick");

      if (answerIndex === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 10);
        if (soundsReady) playSound("correct");
      } else {
        if (soundsReady) playSound("wrong");
      }

      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    },
    [currentQuestion, selectedAnswer, soundsReady, handleNextQuestion, animateOptionPress],
  );

  useEffect(() => {
    if (!currentQuestion || gameCompleted || loading || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      timedOutRef.current = false;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          timedOutRef.current = true;
          return 15;
        }
        if (prev <= 6 && soundsReady) playSound("tick");
        return prev - 1;
      });
      if (timedOutRef.current) {
        if (soundsReady) playSound("gameOver");
        handleNextQuestion();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, gameCompleted, loading, soundsReady, handleNextQuestion, selectedAnswer]);

  const restartGame = useCallback(async () => {
    try {
      setLoading(true);
      const randomQuestions = await getQuestions(10);
      setQuestions(randomQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setGameCompleted(false);
    } catch (error) {
      console.error("Oyun yeniden başlatılırken hata:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExitPress = useCallback(() => {
    playUISound('modal');
    setExitModalVisible(true);
  }, []);

  const confirmExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    playUISound('button');
    setExitModalVisible(false);
    setTimeout(() => router.back(), 200);
  }, [router]);

  const cancelExit = useCallback(() => {
    playUISound('button');
    setExitModalVisible(false);
  }, []);

  // --- UI STATES ---

  if (loading) {
    return (
      <View style={s.root}>
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={s.safeArea} edges={['top']}>
          <View style={s.centeredFill}>
            <TextCustom style={s.loadingText} fontSize={20}>
              Sorular yükleniyor...
            </TextCustom>
            <TextCustom style={s.loadingSubText} fontSize={15}>
              Bilgi yarışması hazırlanıyor
            </TextCustom>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={s.root}>
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={s.safeArea} edges={['top']}>
          <View style={s.centeredFill}>
            <TextCustom style={s.errorText} fontSize={18}>
              Sorular yüklenemedi
            </TextCustom>
            <TouchableOpacity
              style={s.retryButton}
              onPress={() => { playUISound('button'); loadQuestions(); }}
              activeOpacity={0.8}
            >
              <TextCustom style={s.retryButtonText} fontSize={16}>
                Tekrar Dene
              </TextCustom>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (gameCompleted) {
    const correctCount = score / 10;
    const coinsEarned = score * 2;

    return (
      <View style={s.root}>
        <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={s.safeArea} edges={['top']}>
          <View style={s.centeredFill}>

            <View style={s.scoreCircle}>
              <TextCustom style={s.scoreCircleNumber} fontSize={52}>
                {score}
              </TextCustom>
              <TextCustom style={s.scoreCircleLabel} fontSize={13}>
                PUAN
              </TextCustom>
            </View>

            <TextCustom style={s.resultSubtitle} fontSize={18}>
              {correctCount} / {questions.length} Doğru
            </TextCustom>

            <View style={s.coinsBadge}>
              <Text style={s.coinsBadgeText}>🪙 {coinsEarned} Jeton Kazandın!</Text>
            </View>

            <View style={s.resultButtons}>
              <TouchableOpacity
                style={s.primaryButton}
                onPress={() => { playUISound('button'); restartGame(); }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.brand.gradient}
                  style={s.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <TextCustom style={s.primaryButtonText} fontSize={16}>
                    Tekrar Oyna
                  </TextCustom>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.secondaryButton}
                onPress={() => { playUISound('button'); router.back(); }}
                activeOpacity={0.8}
              >
                <TextCustom style={s.secondaryButtonText} fontSize={16}>
                  Ana Menü
                </TextCustom>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!currentQuestion) return null;

  return (
    <View style={s.root}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={s.safeArea} edges={['top']}>

        {/* Header Row */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleExitPress} style={s.exitButton} activeOpacity={0.75}>
            <Ionicons name="log-out-outline" size={28} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={s.scoreBadge}>
            <TextCustom style={s.scoreBadgeText} fontSize={14}>
              {score} Puan
            </TextCustom>
          </View>

          <View style={[s.timerCircle, timeLeft <= 5 && s.timerCircleUrgent]}>
            <TextCustom
              style={[s.timerText, timeLeft <= 5 && s.timerTextUrgent]}
              fontSize={22}
            >
              {timeLeft}
            </TextCustom>
          </View>

          <View style={s.counterBadge}>
            <TextCustom style={s.counterText} fontSize={14}>
              {currentQuestionIndex + 1}/{questions.length}
            </TextCustom>
          </View>
        </View>

        {/* Category badge */}
        <View style={s.categoryBadgeWrap}>
          <View style={s.categoryBadge}>
            <TextCustom style={s.categoryBadgeText} fontSize={11}>
              {currentQuestion.category?.toLocaleUpperCase('tr-TR') ?? 'GENEL KÜLTÜR'}
            </TextCustom>
          </View>
        </View>

        {/* Question + Options centered group */}
        <View style={s.gameContent}>

        {/* Question card */}
        <View style={s.questionCard}>
          <TextCustom style={s.questionText} fontSize={19}>
            {currentQuestion.question}
          </TextCustom>
        </View>

        {/* Answer options */}
        <View style={s.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = selectedAnswer !== null && index === currentQuestion.correctAnswer;
            const isWrong =
              selectedAnswer !== null &&
              isSelected &&
              selectedAnswer !== currentQuestion.correctAnswer;
            const isDimmed = selectedAnswer !== null && !isSelected && !isCorrect;
            const letterLabel = String.fromCharCode(65 + index);

            return (
              <Animated.View
                key={index}
                style={[
                  s.optionWrapper,
                  { transform: [{ scale: scaleAnims[index] ?? scaleAnims[0] }] },
                  isDimmed && s.optionDimmed,
                ]}
              >
                <TouchableOpacity
                  style={[
                    s.optionButton,
                    isCorrect && s.optionCorrect,
                    isWrong && s.optionWrong,
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.85}
                >
                  <View style={[
                    s.optionLetter,
                    isCorrect && s.optionLetterCorrect,
                    isWrong && s.optionLetterWrong,
                  ]}>
                    <TextCustom style={s.optionLetterText} fontSize={13}>
                      {letterLabel}
                    </TextCustom>
                  </View>

                  <TextCustom
                    style={[s.optionText, (isSelected || isCorrect) && s.optionTextSelected]}
                    fontSize={15}
                  >
                    {option}
                  </TextCustom>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        </View>{/* end gameContent */}

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

      </SafeAreaView>

      {/* Exit confirm modal */}
      <Modal
        visible={exitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelExit}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TextCustom style={s.modalTitle} fontSize={17}>
              Oyundan ayrılmak istediğine emin misin?
            </TextCustom>
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={cancelExit}
                activeOpacity={0.8}
              >
                <TextCustom style={s.modalCancelText} fontSize={15}>
                  Hayır
                </TextCustom>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalConfirmBtn}
                onPress={confirmExit}
                activeOpacity={0.8}
              >
                <TextCustom style={s.modalConfirmText} fontSize={15}>
                  Evet
                </TextCustom>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
