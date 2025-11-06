// app/quick-game.jsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import TextCustom from '../components/TextCustom';
import { getRandomQuestions } from '../utils/questions';

export default function QuickGame() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    // Oyun başladığında soruları yükle
    const randomQuestions = getRandomQuestions(5); // Test için 5 soru
    setQuestions(randomQuestions);
  }, []);

  useEffect(() => {
    // Geri sayım timer'ı
    if (!currentQuestion || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameCompleted]);

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return; // Çift tıklamayı önle

    setSelectedAnswer(answerIndex);
    
    // Doğru cevap kontrolü
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(prev => prev + 10);
    }

    // 1 saniye sonra bir sonraki soruya geç
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      setGameCompleted(true);
    }
  };

  const restartGame = () => {
    const randomQuestions = getRandomQuestions(5);
    setQuestions(randomQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setTimeLeft(15);
    setGameCompleted(false);
  };

  if (questions.length === 0) {
    return (
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" }}
        style={styles.bg}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.container}>
          <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (gameCompleted) {
    return (
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" }}
        style={styles.bg}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.container}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Oyun Tamamlandı! 🎉</Text>
            <Text style={styles.scoreText}>Puan: {score}</Text>
            <Text style={styles.detailText}>
              {questions.length} sorudan {score / 10} doğru
            </Text>
            
            <View style={styles.resultButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={restartGame}>
                <Text style={styles.buttonText}>Tekrar Oyna</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => router.back()}
              >
                <Text style={styles.secondaryButtonText}>Ana Menü</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" }}
      style={styles.bg}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Puan: {score}</Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}>
              ⏱️ {timeLeft}s
            </Text>
          </View>
          <View style={styles.questionCounter}>
            <Text style={styles.counterText}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Soru */}
        <View style={styles.questionContainer}>
          <Text style={styles.categoryBadge}>
            {currentQuestion.category.toUpperCase()}
          </Text>
          <TextCustom style={styles.questionText} fontSize={20}>
            {currentQuestion.question}
          </TextCustom>
        </View>

        {/* Seçenekler */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
                selectedAnswer !== null && 
                  index === currentQuestion.correctAnswer && styles.correctOption,
                selectedAnswer !== null && 
                  selectedAnswer === index && 
                  selectedAnswer !== currentQuestion.correctAnswer && styles.wrongOption
              ]}
              onPress={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
            >
              <Text style={[
                styles.optionText,
                (selectedAnswer === index || 
                 (selectedAnswer !== null && index === currentQuestion.correctAnswer)) && 
                styles.optionTextSelected
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* İlerleme Çubuğu */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]} />
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,50,0.7)",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,140,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.5)',
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  questionCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: '#FF4136',
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryBadge: {
    color: '#FF8C00',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#FF8C00',
  },
  correctOption: {
    backgroundColor: 'rgba(0,200,81,0.3)',
    borderColor: '#00C851',
  },
  wrongOption: {
    backgroundColor: 'rgba(255,65,54,0.3)',
    borderColor: '#FF4136',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 3,
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailText: {
    color: '#f0f0f0',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  resultButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF8C00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});