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
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
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
import { Colors, Typography } from "../../constants/theme";

const BG_GRADIENT = ['#4A1E8A', '#2D1280', '#150960', '#080325', '#030115'];

const CATEGORY_ICON_MAP = {
  'spor':          'football-outline',
  'tarih':         'time-outline',
  'bilim':         'flask-outline',
  'coğrafya':      'earth-outline',
  'cografya':      'earth-outline',
  'edebiyat':      'book-outline',
  'matematik':     'calculator-outline',
  'fizik':         'nuclear-outline',
  'kimya':         'beaker-outline',
  'biyoloji':      'leaf-outline',
  'sanat':         'color-palette-outline',
  'müzik':         'musical-notes-outline',
  'muzik':         'musical-notes-outline',
  'teknoloji':     'hardware-chip-outline',
  'genel kültür':  'globe-outline',
  'genel kultur':  'globe-outline',
  'astronomi':     'planet-outline',
};

function getCategoryIcon(category) {
  if (!category) return 'help-circle-outline';
  const key = category.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] ?? 'help-circle-outline';
}

const CIRCUMFERENCE = 251.33;

function TimerArc({ timeLeft }) {
  const offset = CIRCUMFERENCE * (1 - timeLeft / 15);
  const isUrgent = timeLeft <= 5;
  return (
    <View style={s.timerArcWrapper}>
      <Svg width={96} height={96}>
        <Defs>
          <SvgLinearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4FC3F7" />
            <Stop offset="0.5" stopColor="#FF8C00" />
            <Stop offset="1" stopColor="#FF4136" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={0} />
        <Circle
          cx={48} cy={48} r={40} fill="none"
          stroke={isUrgent ? '#FF4136' : 'url(#timerGrad)'}
          strokeWidth={5}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90, 48, 48)"
        />
      </Svg>
      <View style={s.timerArcCenter}>
        <TextCustom style={s.timerArcNumber} fontSize={26}>{timeLeft}</TextCustom>
        <TextCustom style={s.timerArcLabel} fontSize={9}>saniye</TextCustom>
      </View>
    </View>
  );
}

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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);
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

  // Tick down — returns 0 when expired, handleNextQuestion is triggered by the effect below
  useEffect(() => {
    if (!currentQuestion || gameCompleted || loading || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        if (prev <= 6 && soundsReady) playSound("tick");
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, gameCompleted, loading, soundsReady, selectedAnswer]);

  // Detect timeout — separate effect so async state update is visible before acting
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (gameCompleted || loading || selectedAnswer !== null) return;
    handleNextQuestion();
  }, [timeLeft, gameCompleted, loading, selectedAnswer, soundsReady, handleNextQuestion]);

  // Pulse animation — activates in urgent mode (≤5s), stops when answer selected or game done
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && selectedAnswer === null && !gameCompleted) {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 300, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      pulseAnim.setValue(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedAnswer, gameCompleted]);

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
        <LinearGradient
          colors={['rgba(138,43,226,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,120,220,0.28)']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
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
        <LinearGradient
          colors={['rgba(138,43,226,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,120,220,0.28)']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
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
        <LinearGradient
          colors={['rgba(138,43,226,0.35)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,120,220,0.28)']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
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
      <LinearGradient
        colors={['rgba(138,43,226,0.35)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,120,220,0.28)']}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={s.safeArea} edges={['top']}>

        {/* Exit row — standalone above header */}
        <View style={s.exitRow}>
          <TouchableOpacity onPress={handleExitPress} style={s.exitBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Header card — PUAN | timer | SORU */}
        <View style={s.headerCard}>
          <View style={s.headerSection}>
            <TextCustom style={s.headerLabel} fontSize={10}>PUAN</TextCustom>
            <TextCustom style={s.headerValue} fontSize={22}>{score}</TextCustom>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TimerArc timeLeft={timeLeft} />
          </Animated.View>

          <View style={[s.headerSection, { alignItems: 'flex-end' }]}>
            <TextCustom style={s.headerLabel} fontSize={10}>SORU</TextCustom>
            <TextCustom style={s.headerValue} fontSize={22}>
              {currentQuestionIndex + 1}
              <TextCustom style={s.headerValueDim} fontSize={16}>/{questions.length}</TextCustom>
            </TextCustom>
          </View>
        </View>

        {/* Dot progress */}
        <View style={s.dotProgressRow}>
          {Array.from({ length: questions.length }).map((_, i) => (
            <View
              key={i}
              style={[
                s.progressDot,
                i < currentQuestionIndex && s.progressDotAnswered,
                i === currentQuestionIndex && s.progressDotCurrent,
              ]}
            />
          ))}
        </View>

        {/* Category icon + badge */}
        <View style={s.categoryBlock}>
          <View style={s.categoryIconOuter}>
            <LinearGradient
              colors={['rgba(0,212,255,0.25)', 'rgba(155,89,245,0.35)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.categoryIconGradient}
            >
              <Ionicons
                name={getCategoryIcon(currentQuestion.category)}
                size={48}
                color={Colors.text.primary}
              />
            </LinearGradient>
          </View>
          <View style={s.categoryBadge}>
            <TextCustom style={s.categoryBadgeText} fontSize={11}>
              {currentQuestion.category?.toLocaleUpperCase('tr-TR') ?? 'GENEL KÜLTÜR'}
            </TextCustom>
          </View>
        </View>

        {/* Question + Options + Jokers */}
        <View style={s.gameContent}>

        {/* Question card — gradient border */}
        <View style={s.questionCardWrapper}>
          <LinearGradient
            colors={['#9B59F5', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.questionCardGradientBorder}
          >
            <View style={s.questionCard}>
              <TextCustom style={s.questionText} fontSize={19}>
                {currentQuestion.question}
              </TextCustom>
            </View>
          </LinearGradient>
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
                  isCorrect && s.optionWrapperCorrect,
                  isWrong   && s.optionWrapperWrong,
                ]}
              >
                <TouchableOpacity
                  style={[
                    s.optionButton,
                    isSelected && !isCorrect && !isWrong && s.optionButtonSelected,
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

        {/* Joker row */}
        <View style={s.jokerSection}>
          <View style={s.jokerRow}>

            {/* x2 — CIFTE SANS */}
            <View style={s.jokerItem}>
              <View style={[s.jokerBtn, { backgroundColor: 'rgba(155,89,245,0.25)', borderColor: Colors.accent.purple }]}>
                <TextCustom style={{ color: Colors.accent.purple, fontFamily: Typography.family.black }} fontSize={20}>x2</TextCustom>
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>ÇİFTE ŞANS</TextCustom>
              <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
            </View>

            {/* 50:50 */}
            <View style={s.jokerItem}>
              <View style={[s.jokerBtn, { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: Colors.accent.gold }]}>
                <Ionicons name="bulb-outline" size={30} color={Colors.accent.gold} />
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>50:50</TextCustom>
              <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
            </View>

            {/* SORU GEC */}
            <View style={s.jokerItem}>
              <View style={[s.jokerBtn, { backgroundColor: 'rgba(0,212,255,0.12)', borderColor: Colors.accent.cyan }]}>
                <Ionicons name="play-skip-forward-outline" size={30} color={Colors.accent.cyan} />
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>SORU GEÇ</TextCustom>
              <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
            </View>

          </View>
        </View>

        </View>{/* end gameContent */}

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
