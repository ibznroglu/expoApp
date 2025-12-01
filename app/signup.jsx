// app/signup.jsx
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
import { validateEmail } from "./utils/emailValidation.js";
import { showToast } from "./utils/toast.js";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const { session, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ 
    name: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });
  const [loading, setLoading] = useState(false);
const handleSubmit = async () => {
    const nameError = name.trim() === "";
    const emailError = email.trim() === "";
    const passwordError = password.trim() === "";
    const confirmPasswordError = confirmPassword.trim() === "";
     console.log('🔄 HandleSubmit state:', { name, email, password, confirmPassword });

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({ 
        name: nameError, 
        email: emailError, 
        password: passwordError, 
        confirmPassword: confirmPasswordError 
      });
      
      const message = [];
      if (nameError) message.push("Ad Soyad");
      if (emailError) message.push("E-posta");
      if (passwordError) message.push("Parola");
      if (confirmPasswordError) message.push("Parola Tekrarı");
      
      showToast.error("Eksik Bilgi", `${message.join(", ")} alanları boş olamaz!`);
      return;
    }

    // E-posta validasyonu (format + disposable email kontrolü)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      showToast.error("Geçersiz E-posta", emailValidation.error || "Lütfen geçerli bir e-posta adresi giriniz.");
      setErrors(prev => ({ ...prev, email: true }));
      return;
    }

    if (password.length < 8) {
      showToast.error("Geçersiz Şifre", "Şifre en az 8 karakter olmalıdır.");
      setErrors(prev => ({ ...prev, password: true }));
      return;
    }

    if (password !== confirmPassword) {
      showToast.error("Hata", "Şifreler eşleşmiyor.");
      setErrors(prev => ({ ...prev, confirmPassword: true }));
      return;
    }

    setErrors({ name: false, email: false, password: false, confirmPassword: false });
    setLoading(true);

    try {
      const result = await signup({ 
        name: name,
        email: email,
        password: password
      });
      
      // E-posta doğrulama gerekiyorsa bilgilendir
      if (result?.requiresVerification) {
        showToast.success(
          "Kayıt Başarılı!",
          "E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin 📧"
        );
      } else {
        showToast.success(
          "Kayıt Başarılı!",
          "Bilgi Arenası'na hoş geldiniz 🎉"
        );
      }
    } catch (error) {
      console.error('Sign up error DETAILS:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response,
        stack: error.stack
      });
      
      let errorMessage = "Kayıt başarısız";
      let errorDescription = "Lütfen bilgilerinizi kontrol edin.";
      
      // Önce en spesifik hataları kontrol et
      if (error.code === 409 || error.message?.includes('already') || error.message?.includes('exists')) {
        errorMessage = "Kullanıcı Mevcut";
        errorDescription = "Bu e-posta adresi ile zaten bir hesap bulunuyor.";
      } else if (error.code === 429) {
        errorMessage = "Çok Fazla İstek";
        errorDescription = "Lütfen bir süre bekleyip tekrar deneyin.";
      } else if (error.code === 400) {
        errorMessage = "Geçersiz Bilgi";
        errorDescription = error.message || "Lütfen geçerli bir e-posta ve şifre giriniz.";
      } else if (error.code === 401) {
        errorMessage = "Yetkilendirme Hatası";
        errorDescription = error.message || "Lütfen bilgilerinizi kontrol edin.";
      } else if (error.code === 500 || error.code === 502 || error.code === 503) {
        errorMessage = "Sunucu Hatası";
        errorDescription = "Sunucu şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.";
      } else if (error.message?.includes('network') || error.message?.includes('Network') || error.code === 0) {
        errorMessage = "Ağ Hatası";
        errorDescription = "İnternet bağlantınızı kontrol edin.";
      } else if (error.message) {
        // Genel hata mesajını göster
        errorMessage = "Kayıt Başarısız";
        errorDescription = error.message;
      }
      
      // Hatanın detayını göster
      console.log('Toast gösteriliyor:', errorMessage, errorDescription);
      showToast.error(errorMessage, errorDescription);
} finally {
      setLoading(false);
    }
  };

  if (session) {
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
          Hesabını Oluştur
        </TextCustom>

        <View style={SignInStyles.form}>
          <TextInput
            style={[
              SignInStyles.input,
              errors.name && SignInStyles.inputError,
            ]}
            placeholder="Ad Soyad"
            placeholderTextColor="#eee"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name && text.trim() !== "") {
                setErrors(prev => ({ ...prev, name: false }));
              }
            }}
            autoCapitalize="words"
            editable={!loading}
          />
          
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
                setErrors(prev => ({ ...prev, email: false }));
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
            placeholder="Parola (en az 8 karakter)"
            placeholderTextColor="#eee"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password && text.trim() !== "") {
                setErrors(prev => ({ ...prev, password: false }));
              }
            }}
            editable={!loading}
          />
          
          <TextInput
            style={[
              SignInStyles.input,
              errors.confirmPassword && SignInStyles.inputError,
            ]}
            placeholder="Parola Tekrarı"
            placeholderTextColor="#eee"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword && text.trim() !== "") {
                setErrors(prev => ({ ...prev, confirmPassword: false }));
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
              {loading ? "Kayıt Yapılıyor..." : "Hesap Oluştur"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={SignInStyles.forgotPasswordButton}
            onPress={() => router.push('/signin')}
            disabled={loading}
          >
            <Text style={SignInStyles.forgotPasswordText}>
              Zaten hesabın var mı? Giriş Yap
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignUp;