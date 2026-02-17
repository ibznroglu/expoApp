import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SignInStyles } from "../assets/styles/signinStyle.js";
import { account } from "../lib/appwrite";
import { showToast } from "../utils/toast";
import TextCustom from "./components/TextCustom";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { userId, secret } = useLocalSearchParams();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ verifyEmail stabilize edildi
  const verifyEmail = useCallback(async () => {
    try {
      console.log("📧 E-posta doğrulanıyor...", { userId, secret });

      await account.updateVerification(userId, secret);

      console.log("✅ E-posta başarıyla doğrulandı");
      setStatus("success");

      showToast.success(
        "E-posta Doğrulandı!",
        "Hesabınız başarıyla aktifleştirildi. Giriş yapabilirsiniz.",
      );

      // 2 saniye sonra giriş ekranına yönlendir
      setTimeout(() => {
        router.replace("/signin");
      }, 2000);
    } catch (error) {
      console.error("❌ E-posta doğrulama hatası:", error);
      setStatus("error");

      let errorMsg = "E-posta doğrulanamadı. Lütfen tekrar deneyin.";

      if (
        error?.message?.includes("expired") ||
        error?.message?.includes("süresi")
      ) {
        errorMsg =
          "Doğrulama linkinin süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.";
      } else if (
        error?.message?.includes("invalid") ||
        error?.message?.includes("geçersiz")
      ) {
        errorMsg =
          "Doğrulama linki geçersiz. Lütfen yeni bir doğrulama e-postası isteyin.";
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      showToast.error("Doğrulama Hatası", errorMsg);
    }
  }, [userId, secret, router]);

  // ✅ useEffect dependency doğru ve temiz
  useEffect(() => {
    if (userId && secret) {
      verifyEmail();
    } else {
      setStatus("error");
      setErrorMessage(
        "E-posta doğrulama linki geçersiz veya eksik parametreler var.",
      );
    }
  }, [userId, secret, verifyEmail]);

  return (
    <View
      style={[
        SignInStyles.container,
        { justifyContent: "center", alignItems: "center", padding: 20 },
      ]}
    >
      {status === "verifying" && (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <TextCustom style={{ marginTop: 20, textAlign: "center" }}>
            E-posta adresiniz doğrulanıyor...
          </TextCustom>
        </>
      )}

      {status === "success" && (
        <>
          <TextCustom style={{ fontSize: 48, marginBottom: 20 }}>✅</TextCustom>
          <TextCustom
            style={{ fontSize: 24, marginBottom: 10, textAlign: "center" }}
          >
            E-posta Doğrulandı!
          </TextCustom>
          <TextCustom style={{ textAlign: "center", color: "#666" }}>
            Hesabınız başarıyla aktifleştirildi.
          </TextCustom>
          <TextCustom
            style={{ textAlign: "center", color: "#666", marginTop: 10 }}
          >
            Giriş sayfasına yönlendiriliyorsunuz...
          </TextCustom>
        </>
      )}

      {status === "error" && (
        <>
          <TextCustom style={{ fontSize: 48, marginBottom: 20 }}>❌</TextCustom>
          <TextCustom
            style={{ fontSize: 24, marginBottom: 10, textAlign: "center" }}
          >
            Doğrulama Başarısız
          </TextCustom>
          <TextCustom
            style={{ textAlign: "center", color: "#666", marginBottom: 20 }}
          >
            {errorMessage}
          </TextCustom>

          <TouchableOpacity
            style={[SignInStyles.button, { marginTop: 10 }]}
            onPress={() => router.replace("/signin")}
          >
            <Text style={SignInStyles.buttonText}>Giriş Sayfasına Dön</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
