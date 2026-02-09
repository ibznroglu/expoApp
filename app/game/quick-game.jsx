// app/quick-game.jsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { quickGameStyles } from "../../assets/styles/quickGameStyle";
import { getQuestions } from "../../services/questionService";
import { initSounds, playSound, unloadSounds } from "../../utils/sound";
import TextCustom from "../components/TextCustom";

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

  const currentQuestion = questions[currentQuestionIndex];

  // Soruları yükle
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const randomQuestions = await getQuestions(10);
      setQuestions(randomQuestions);
    } catch (error) {
      console.error("Sorular yüklenirken hata:", error);
      const fallbackQuestions = await getQuestions(10);
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!currentQuestion || gameCompleted || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 15;
        }
        if (prev <= 6 && soundsReady) {
          playSound("tick");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameCompleted, loading]);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10);
      if (soundsReady) playSound("correct");
    } else {
      playSound("wrong");
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      playSound("completed");
      setGameCompleted(true);
    }
  };

  const restartGame = async () => {
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
  };
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initSounds();
        setSoundsReady(true);
        console.log("✅ Sounds ready");
      } catch (e) {
        console.warn("🔇 initSounds failed:", e);
      }
    })();

    return () => {
      // cleanup
      unloadSounds().catch(() => {});
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        }}
        style={quickGameStyles.bg}
      >
        <View style={quickGameStyles.overlay} />
        <SafeAreaView style={quickGameStyles.container} edges={["top"]}>
          <View style={quickGameStyles.loadingContainer}>
            <Text style={quickGameStyles.loadingText}>
              Sorular yükleniyor...
            </Text>
            <Text style={quickGameStyles.loadingSubText}>
              Bilgi yarışması hazırlanıyor
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (questions.length === 0) {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        }}
        style={quickGameStyles.bg}
      >
        <View style={quickGameStyles.overlay} />
        <SafeAreaView style={quickGameStyles.container} edges={["top"]}>
          <View style={quickGameStyles.errorContainer}>
            <Text style={quickGameStyles.errorText}>Sorular yüklenemedi</Text>
            <TouchableOpacity
              style={quickGameStyles.retryButton}
              onPress={loadQuestions}
            >
              <Text style={quickGameStyles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (gameCompleted) {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        }}
        style={quickGameStyles.bg}
      >
        <View style={quickGameStyles.overlay} />
        <SafeAreaView style={quickGameStyles.container} edges={["top"]}>
          <View style={quickGameStyles.resultCard}>
            <Text style={quickGameStyles.resultTitle}>Oyun Tamamlandı! 🎉</Text>
            <Text style={quickGameStyles.scoreText}>Puan: {score}</Text>
            <Text style={quickGameStyles.detailText}>
              {questions.length} sorudan {score / 10} doğru
            </Text>

            <View style={quickGameStyles.resultButtons}>
              <TouchableOpacity
                style={quickGameStyles.primaryButton}
                onPress={restartGame}
              >
                <Text style={quickGameStyles.buttonText}>Tekrar Oyna</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={quickGameStyles.secondaryButton}
                onPress={() => router.back()}
              >
                <Text style={quickGameStyles.secondaryButtonText}>
                  Ana Menü
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      }}
      style={quickGameStyles.bg}
    >
      <View style={quickGameStyles.overlay} />
      <SafeAreaView style={quickGameStyles.container} edges={["top"]}>
        {/* Header */}
        <View style={quickGameStyles.header}>
          <View style={quickGameStyles.scoreContainer}>
            <Text style={quickGameStyles.scoreText}>Puan: {score}</Text>
          </View>
          <View style={quickGameStyles.timerContainer}>
            <Text
              style={[
                quickGameStyles.timerText,
                timeLeft <= 5 && quickGameStyles.timerWarning,
              ]}
            >
              ⏱️ {timeLeft}s
            </Text>
          </View>
          <View style={quickGameStyles.questionCounter}>
            <Text style={quickGameStyles.counterText}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Soru */}
        <View style={quickGameStyles.questionContainer}>
          <Text style={quickGameStyles.categoryBadge}>
            {currentQuestion.category?.toUpperCase() || "GENEL KÜLTÜR"}
          </Text>
          <TextCustom style={quickGameStyles.questionText} fontSize={20}>
            {currentQuestion.question}
          </TextCustom>
        </View>

        {/* Seçenekler */}
        <View style={quickGameStyles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                quickGameStyles.optionButton,
                selectedAnswer === index && quickGameStyles.selectedOption,
                selectedAnswer !== null &&
                  index === currentQuestion.correctAnswer &&
                  quickGameStyles.correctOption,
                selectedAnswer !== null &&
                  selectedAnswer === index &&
                  selectedAnswer !== currentQuestion.correctAnswer &&
                  quickGameStyles.wrongOption,
              ]}
              onPress={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
            >
              <Text
                style={[
                  quickGameStyles.optionText,
                  (selectedAnswer === index ||
                    (selectedAnswer !== null &&
                      index === currentQuestion.correctAnswer)) &&
                    quickGameStyles.optionTextSelected,
                ]}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* İlerleme Çubuğu */}
        <View style={quickGameStyles.progressContainer}>
          <View
            style={[
              quickGameStyles.progressBar,
              {
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
