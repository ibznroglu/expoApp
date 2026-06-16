import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from "@expo/vector-icons";
import { quickGameStyles as s } from "../../../assets/styles/quickGameStyle";
import { getQuestions } from "../../../services/questionService";
import {
  initSounds,
  playSound,
  playUISound,
  stopSound,
  unloadSounds,
} from "../../../utils/sound";
import TextCustom from "../../components/TextCustom";
import ConfirmModal from '@/components/ConfirmModal';
import BackButton from '@/components/BackButton';
import { Colors, Typography } from "../../../constants/theme";

const BG_GRADIENT = ['#4A1E8A', '#2D1280', '#150960', '#080325', '#030115'];
const screenHeight = Dimensions.get('window').height;

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

  const headerAnim            = useRef(new Animated.Value(0)).current;
  const categoryScaleAnim     = useRef(new Animated.Value(0)).current;
  const categoryOpacityAnim   = useRef(new Animated.Value(0)).current;
  const questionOpacityAnim   = useRef(new Animated.Value(0)).current;
  const questionTranslateAnim = useRef(new Animated.Value(20)).current;
  const optionsEntranceAnim   = useRef(new Animated.Value(0)).current;

  const pulseLoopRef = useRef(null);
  const exitingRef = useRef(false);
  const wooshPlayedForRef = useRef(-1);
  const answerTimeoutRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const randomQuestions = await getQuestions(10);
      setQuestions(randomQuestions);
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    initSounds()
      .then(() => setSoundsReady(true))
      .catch(() => setSoundsReady(false));

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
      setGameCompleted(true);
    }
  }, [currentQuestionIndex, questions.length]);

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
      }

      setTimeout(() => {
        if (soundsReady) playSound(answerIndex === currentQuestion.correctAnswer ? "correct" : "wrong");
      }, 0);

      answerTimeoutRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 1200);
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

  // Woosh on every question transition including first
  useEffect(() => {
    if (!soundsReady) return;
    if (wooshPlayedForRef.current === currentQuestionIndex) return;
    wooshPlayedForRef.current = currentQuestionIndex;
    const t = setTimeout(() => playSound('woosh'), 0);
    return () => clearTimeout(t);
  }, [currentQuestionIndex, soundsReady]);

  // Entrance animations — runs on every question transition
  useEffect(() => {
    if (questions.length === 0) return;

    categoryScaleAnim.setValue(0);
    categoryOpacityAnim.setValue(0);
    questionOpacityAnim.setValue(0);
    questionTranslateAnim.setValue(20);
    optionsEntranceAnim.setValue(0);

    if (currentQuestionIndex === 0) {
      headerAnim.setValue(0);
      Animated.timing(headerAnim, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    Animated.parallel([
      Animated.parallel([
        Animated.timing(categoryScaleAnim,   { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(categoryOpacityAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(questionOpacityAnim,   { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(questionTranslateAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
      Animated.timing(optionsEntranceAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    return () => {
      clearTimeout(answerTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions.length]);

  // Game-over sound — bravo if perfect score, completed otherwise
  useEffect(() => {
    if (!gameCompleted || !soundsReady) return;
    const isPerfect = score === questions.length * 10;
    playSound(isPerfect ? 'bravo' : 'completed');
  }, [gameCompleted, soundsReady, score, questions.length]);

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
      headerAnim.setValue(0);
      categoryScaleAnim.setValue(0);
      categoryOpacityAnim.setValue(0);
      questionOpacityAnim.setValue(0);
      questionTranslateAnim.setValue(20);
      optionsEntranceAnim.setValue(0);
      setScore(0);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setGameCompleted(false);
    } catch (error) {
      console.error("Oyun yeniden başlatılırken hata:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [headerAnim, categoryScaleAnim, categoryOpacityAnim, questionOpacityAnim, questionTranslateAnim, optionsEntranceAnim]);

  const handleExitPress = useCallback(() => {
    setExitModalVisible(true);
  }, []);

  const confirmExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExitModalVisible(false);
    setTimeout(() => router.back(), 200);
  }, [router]);

  const cancelExit = useCallback(() => {
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
                onPress={() => { stopSound('bravo'); stopSound('completed'); if (soundsReady) playSound('buttonClick'); setTimeout(() => restartGame(), 250); }}
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
                onPress={() => { stopSound('bravo'); stopSound('completed'); if (soundsReady) playSound('buttonClick'); setTimeout(() => router.back(), 300); }}
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

        <Animated.View style={{
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
        }}>

          {/* Exit row — standalone above header */}
          <View style={s.exitRow}>
            <BackButton onPress={handleExitPress} />
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

        </Animated.View>

        {/* Category icon + badge */}
        <Animated.View style={[s.categoryBlock, {
          opacity: categoryOpacityAnim,
          transform: [{ scale: categoryScaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.0] }) }],
        }]}>
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
        </Animated.View>

        {/* Question + Options + Jokers */}
        <ScrollView
          style={s.gameContentScroll}
          contentContainerStyle={s.gameContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

        {/* Question card — gradient border + gradient bg */}
        <Animated.View style={[s.questionCardWrapper, {
          opacity: questionOpacityAnim,
          transform: [{ translateY: questionTranslateAnim }],
        }]}>
          <LinearGradient
            colors={['#9B59F5', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.questionCardGradientBorder}
          >
            <LinearGradient
              colors={['rgba(155,89,245,0.15)', 'rgba(0,212,255,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.questionCard}
            >
              <TextCustom
                style={s.questionText}
                fontSize={screenHeight < 700 ? 16 : 18}
                adjustsFontSizeToFit
                numberOfLines={5}
                minimumFontScale={0.6}
              >
                {currentQuestion.question}
              </TextCustom>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>

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
            const isFeedback = isCorrect || isWrong;

            return (
              <Animated.View
                key={(currentQuestion?.$id ?? currentQuestionIndex) + '-' + index}
                style={[
                  s.optionWrapper,
                  {
                    opacity: optionsEntranceAnim,
                    transform: [
                      { scale: scaleAnims[index] ?? scaleAnims[0] },
                      { translateY: optionsEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                    ],
                  },
                  isCorrect && s.optionWrapperCorrect,
                  isWrong   && s.optionWrapperWrong,
                  isSelected && !isFeedback && s.optionWrapperSelected,
                  // NOTE: isDimmed && s.optionDimmed intentionally removed — conflicts with animated opacity
                ]}
              >
                {isFeedback ? (
                  <TouchableOpacity
                    style={[
                      s.optionButton,
                      isSelected && !isCorrect && !isWrong && s.optionButtonSelected,
                      isCorrect && s.optionCorrect,
                      isWrong && s.optionWrong,
                      { opacity: isDimmed ? 0.5 : 1 },
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
                ) : (
                  <LinearGradient
                    colors={Colors.gradients.option}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      s.optionGradientBorder,
                      isSelected && s.optionGradientBorderSelected,
                      { opacity: isDimmed ? 0.5 : 1 },
                    ]}
                  >
                    <TouchableOpacity
                      style={s.optionButtonInner}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={Colors.gradients.option}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.optionLetterGradient}
                      >
                        <TextCustom style={s.optionLetterTextOnGradient} fontSize={13}>
                          {letterLabel}
                        </TextCustom>
                      </LinearGradient>
                      <TextCustom
                        style={[s.optionText, isSelected && s.optionTextSelected]}
                        fontSize={15}
                      >
                        {option}
                      </TextCustom>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
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
                <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>ÇİFTE ŞANS</TextCustom>
            </View>

            {/* 50:50 */}
            <View style={s.jokerItem}>
              <View style={[s.jokerBtn, { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: Colors.accent.gold }]}>
                <Ionicons name="bulb-outline" size={30} color={Colors.accent.gold} />
                <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>50:50</TextCustom>
            </View>

            {/* SORU GEC */}
            <View style={s.jokerItem}>
              <View style={[s.jokerBtn, { backgroundColor: 'rgba(0,212,255,0.12)', borderColor: Colors.accent.cyan }]}>
                <Ionicons name="play-skip-forward-outline" size={30} color={Colors.accent.cyan} />
                <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
              </View>
              <TextCustom style={s.jokerLabel} fontSize={10}>SORU GEÇ</TextCustom>
            </View>

          </View>
        </View>

        </ScrollView>{/* end gameContent */}

      </SafeAreaView>

      {/* Exit confirm modal */}
      <ConfirmModal
        visible={exitModalVisible}
        title="Oyundan Ayrıl"
        message="Oyundan ayrılmak istediğine emin misin? İlerlemen kaydedilmeyecek."
        confirmLabel="Evet"
        cancelLabel="Hayır"
        destructive
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

    </View>
  );
}
