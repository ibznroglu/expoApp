import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SignInStyles } from "../assets/styles/signinStyle.js";
import TextCustom from "./components/TextCustom";
import { showToast } from "./utils/toast.js";

const { width } = Dimensions.get("window");

const SignIn = () => {
  const { session, signin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async () => {
    const emailError = email.trim() === "";
    const passwordError = password.trim() === "";

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      const message = [];
      if (emailError) message.push("E-posta");
      if (passwordError) message.push("Parola");
      const errorMsg = `${message.join(" ve ")} alanı boş olamaz!`;

      showToast.error("Eksik Bilgi", errorMsg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error("Geçersiz E-posta", "Lütfen geçerli bir e-posta adresi giriniz.");
      setErrors(prev => ({ ...prev, email: true }));
      return;
    }

    setErrors({ email: false, password: false });
    setLoading(true);

    try {
      await signin({ email, password });
      // Başarılı giriş - toast göster
      showToast.success(
        "Giriş Başarılı!",
        "Bilgi Arenası'na hoş geldiniz 🎉"
      );
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = "Giriş başarısız";
      let errorDescription = "E-posta veya parola hatalı!";
      
      if (error.code === 401 || error.type === 'invalid_credentials') {
        errorMessage = "Kimlik Doğrulama Hatası";
        errorDescription = "E-posta veya parolanız hatalı. Lütfen tekrar deneyin.";
      } else if (error.code === 429) {
        errorMessage = "Çok Fazla İstek";
        errorDescription = "Lütfen bir süre bekleyip tekrar deneyin.";
      } else if (error.message?.includes('network') || error.code === 0) {
        errorMessage = "Ağ Hatası";
        errorDescription = "İnternet bağlantınızı kontrol edin.";
      }
      
      showToast.error(errorMessage, errorDescription);
    } finally {
      setLoading(false);
    }
  };

  if (session && !redirecting) {
    setRedirecting(true);
    // Toast'ı göster ve 2 saniye sonra yönlendir
    showToast.success("Giriş başarılı!", "Ana sayfaya yönlendiriliyorsunuz...");
    
    setTimeout(() => {
      // Burada router kullanmak yerine Redirect component'i zaten çalışacak
    }, 2000);
    
    return <Redirect href="/" />;
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      }}
      style={SignInStyles.bg}
    >
      <View style={SignInStyles.overlay} />

      <View style={SignInStyles.container}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={SignInStyles.logo}
        />

        <TextCustom style={SignInStyles.headline} fontSize={40}>
          Bilgi Arenası
        </TextCustom>
        <TextCustom style={SignInStyles.subHeadline}>
          Zekanı Yarıştır!
        </TextCustom>

        <View style={SignInStyles.form}>
          <TextInput
            style={[
              SignInStyles.input,
              errors.email && SignInStyles.inputError,
            ]}
            placeholder="E-posta"
            placeholderTextColor="#eee"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email && text.trim() !== "") {
                setErrors((prev) => ({ ...prev, email: false }));
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={[
              SignInStyles.input,
              errors.password && SignInStyles.inputError,
            ]}
            placeholder="Parola"
            placeholderTextColor="#eee"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password && text.trim() !== "") {
                setErrors((prev) => ({ ...prev, password: false }));
              }
            }}
            editable={!loading}
          />

          <TouchableOpacity 
            style={[
              SignInStyles.button, 
              loading && SignInStyles.buttonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={SignInStyles.buttonText}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap & Başla"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={SignInStyles.forgotPasswordButton}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={SignInStyles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignIn;