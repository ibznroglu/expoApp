import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/utils/toast";
import { validateEmail } from "@/utils/emailValidation";
import { authStyles } from "@/assets/styles/authStyles";
import { Colors } from "@/constants/theme";
import BrandMark from "@/components/auth/BrandMark";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

const RESEND_COOLDOWN_SECONDS = 30;

const SignIn = () => {
  const { session, signin, signinAsGuest, resendVerification } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(undefined);
  const [passwordError, setPasswordError] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownTimer = useRef(null);

  // Clear the countdown interval on unmount.
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    };
  }, []);

  if (session) {
    return <Redirect href="/" />;
  }

  const startResendCooldown = () => {
    if (cooldownTimer.current) {
      clearInterval(cooldownTimer.current);
    }
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) {
            clearInterval(cooldownTimer.current);
            cooldownTimer.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailSignin = async () => {
    // Reset previous errors on a new attempt.
    setEmailError(undefined);
    setPasswordError(undefined);

    let hasError = false;
    if (!validateEmail(email).valid) {
      setEmailError("Geçerli bir e-posta gir");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Şifre boş olamaz");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    setSubmitting(true);
    try {
      await signin({ email, password });
      // On success the session change triggers the redirect automatically.
    } catch (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true);
        showToast.info("E-postanı doğrula", "Giriş yapmadan önce e-postandaki doğrulama linkine tıkla.");
      } else if (error?.message?.includes("network") || error?.message?.includes("Network") || error?.code === 0) {
        showToast.error("Ağ Hatası", "İnternet bağlantınızı kontrol edin.");
      } else {
        showToast.error("Giriş başarısız", "E-posta veya şifre hatalı");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const result = await resendVerification({ email, password });
    if (result?.success) {
      showToast.success("Mail gönderildi", "Gelen kutunu kontrol et");
      startResendCooldown();
    } else {
      showToast.error("Hata", "Mail gönderilemedi, tekrar dene");
    }
  };

  const handleGoogle = () => {
    showToast.info("Yakında", "Google ile giriş yakında!");
  };

  const handleApple = () => {
    showToast.info("Yakında", "Apple ile giriş yakında!");
  };

  const resendLabel =
    resendCooldown > 0
      ? `Tekrar gönder (${resendCooldown}s)`
      : "Doğrulama mailini tekrar gönder";

  return (
    <View style={authStyles.container}>
      <LinearGradient colors={Colors.gradients.background} style={StyleSheet.absoluteFill} />
      <View style={authStyles.glowTopLeft} pointerEvents="none" />
      <View style={authStyles.glowBottomRight} pointerEvents="none" />

      <SafeAreaView style={authStyles.safeArea}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={authStyles.scrollContent}
          >
            <View style={authStyles.brandBlock}>
              <BrandMark />
            </View>

            <View style={authStyles.form}>
              <AuthInput
                icon="mail-outline"
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
              <AuthInput
                icon="lock-closed-outline"
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureToggle
                error={passwordError}
              />

              <Pressable
                style={authStyles.forgotRow}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={authStyles.forgotLink}>Şifremi unuttum</Text>
              </Pressable>

              <AuthButton
                variant="gradient"
                label="Giriş yap"
                loading={submitting}
                onPress={handleEmailSignin}
              />
            </View>

            {notVerified && (
              <View style={authStyles.banner}>
                <Text style={authStyles.bannerText}>E-postanı doğrulamadın.</Text>
                <AuthButton
                  variant="ghost"
                  label={resendLabel}
                  onPress={handleResend}
                  disabled={resendCooldown > 0}
                />
              </View>
            )}

            <View style={authStyles.dividerRow}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerLabel}>veya</Text>
              <View style={authStyles.dividerLine} />
            </View>

            <View style={authStyles.socialRow}>
              <View style={authStyles.socialItem}>
                <AuthButton
                  variant="social"
                  label="Google"
                  icon="logo-google"
                  onPress={handleGoogle}
                />
              </View>
              <View style={authStyles.socialItem}>
                <AuthButton
                  variant="social"
                  label="Apple"
                  icon="logo-apple"
                  onPress={handleApple}
                />
              </View>
            </View>

            <View style={authStyles.guestButton}>
              <AuthButton
                variant="ghost"
                label="Misafir olarak oyna"
                icon="person-outline"
                onPress={async () => {
                  try {
                    await signinAsGuest();
                  } catch (error) {
                    if (error?.message?.includes("network") || error?.message?.includes("Network") || error?.code === 0) {
                      showToast.error("Ağ Hatası", "İnternet bağlantınızı kontrol edin.");
                    } else {
                      showToast.error("Hata", "Misafir girişi başarısız");
                    }
                  }
                }}
              />
            </View>

            <View style={authStyles.footerRow}>
              <Text style={authStyles.footerText}>Hesabın yok mu?</Text>
              <Pressable onPress={() => router.push("/signup")}>
                <Text style={authStyles.footerLink}>Kayıt ol</Text>
              </Pressable>
            </View>
          </ScrollView>
      </SafeAreaView>

    </View>
  );
};

export default SignIn;
