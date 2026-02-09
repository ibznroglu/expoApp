// app/index.jsx
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../../assets/styles/homeStyle";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import { uploadQuestions } from "../../utils/uploadQuestions";
import TextCustom from "../components/TextCustom";

export default function Index() {
  const { user, signout } = useAuth();
  const router = useRouter();
  const handleUpload = async () => {
    try {
      const result = await uploadQuestions();

      if (result.added === 0) {
        showToast.info(
          "Yeni soru yok",
          "Tüm sorular zaten veritabanında mevcut.",
        );
      } else {
        showToast.success(
          "Sorular yüklendi",
          `${result.added} yeni soru eklendi 🎉`,
        );
      }
    } catch (error) {
      showToast.error("Soru yüklenemedi", "Lütfen tekrar deneyin.");
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      }}
      style={homeStyles.bg}
    >
      <View style={homeStyles.overlay} />

      <SafeAreaView style={homeStyles.safeArea}>
        {/* Header */}
        <View style={homeStyles.header}>
          <TouchableOpacity style={homeStyles.logoutButton} onPress={signout}>
            <Text style={homeStyles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={homeStyles.container}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={homeStyles.logo}
          />

          <TextCustom style={homeStyles.welcomeText} fontSize={28}>
            Hoş Geldin {user.name}!
          </TextCustom>

          <TextCustom style={homeStyles.subtitle}>
            Bilgi Arenası'na hazır mısın?
          </TextCustom>
          <TouchableOpacity onPress={handleUpload}>
            <Text>Soruları Yükle</Text>
          </TouchableOpacity>

          {/* Action Cards */}
          <View style={homeStyles.cardsContainer}>
            {/* Hızlı Oyun Kartı */}
            <TouchableOpacity
              style={[homeStyles.card, homeStyles.quickGameCard]}
              onPress={() => router.push("/game/quick-game")}
            >
              <Text style={homeStyles.cardIcon}>⚡</Text>
              <Text style={homeStyles.cardTitle}>Hızlı Oyun</Text>
              <Text style={homeStyles.cardDescription}>
                Rastgele sorularla tek başına yarış
              </Text>
            </TouchableOpacity>

            {/* Arkadaşla Oyna Kartı */}
            <TouchableOpacity
              style={[homeStyles.card, homeStyles.friendGameCard]}
            >
              <Text style={homeStyles.cardIcon}>👥</Text>
              <Text style={homeStyles.cardTitle}>Arkadaşla Oyna</Text>
              <Text style={homeStyles.cardDescription}>
                Arkadaşını davet et ve bilgini test et
              </Text>
            </TouchableOpacity>

            {/* Turnuva Kartı */}
            <TouchableOpacity
              style={[homeStyles.card, homeStyles.tournamentCard]}
            >
              <Text style={homeStyles.cardIcon}>🏆</Text>
              <Text style={homeStyles.cardTitle}>Turnuva</Text>
              <Text style={homeStyles.cardDescription}>
                Çok oyunculu turnuvalara katıl
              </Text>
            </TouchableOpacity>

            {/* Profil Kartı */}
            <TouchableOpacity style={[homeStyles.card, homeStyles.profileCard]}>
              <Text style={homeStyles.cardIcon}>📊</Text>
              <Text style={homeStyles.cardTitle}>İstatistiklerim</Text>
              <Text style={homeStyles.cardDescription}>
                Başarılarını ve istatistiklerini gör
              </Text>
            </TouchableOpacity>
          </View>

          {/* Daily Challenge */}
          <View style={homeStyles.dailyChallenge}>
            <Text style={homeStyles.challengeTitle}>Günlük Mücadele</Text>
            <Text style={homeStyles.challengeDescription}>
              Bugün 10 soruyu doğru cevapla ve 100 puan kazan!
            </Text>
            <TouchableOpacity style={homeStyles.challengeButton}>
              <Text style={homeStyles.challengeButtonText}>Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
