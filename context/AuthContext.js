import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { account } from "../lib/appwrite";

const VERIFICATION_URL =
  process.env.EXPO_PUBLIC_VERIFICATION_URL ||
  "https://reset-expo.vercel.app/verify-email";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [user, setUser] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const responseSession = await account.getSession("current");
      setSession(responseSession);

      const responseUser = await account.get();
      setUser(responseUser);
    } catch (error) {
      setSession(null);
      setUser(null);

      const msg = String(error?.message || "").toLowerCase();
      const code = error?.code;

      const isExpectedAuthState =
        code === 401 ||
        msg.includes("missing scopes") ||
        msg.includes("session") ||
        msg.includes("guests");

      if (!isExpectedAuthState) {
        console.error("Error checking authentication:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signin = async ({ email, password }) => {
    setLoading(true);
    try {
      const responseSession = await account.createEmailPasswordSession(
        email,
        password,
      );

      // Fetch the user and run the verification gate inside a nested try so
      // that any error after session creation still triggers deleteSession,
      // preventing checkAuth from finding and restoring an orphaned session.
      let responseUser;
      try {
        responseUser = await account.get();
      } catch (err) {
        await account.deleteSession("current");
        throw err;
      }

      // Email-verification gate: block unverified email/password logins.
      // Delete the live session so checkAuth cannot auto-login on next mount
      // and bypass the gate.
      if (!responseUser.emailVerification) {
        await account.deleteSession("current");
        throw Object.assign(new Error("Email not verified"), {
          code: "EMAIL_NOT_VERIFIED",
        });
      }

      setSession(responseSession);
      setUser(responseUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    setLoading(true);
    try {
      await account.deleteSession("current");
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // AuthContext.js - signup fonksiyonunu şu şekilde değiştir:
  // AuthContext.js - web için farklı bir yaklaşım
  const signup = async ({ email, password, name }) => {
    setLoading(true);
    try {
      console.log("🔄 Signup başlatılıyor:", {
        email,
        hasName: !!name,
        platform: Platform.OS,
      });

      // WEB ve MOBILE için AppWrite SDK kullanımı (daha güvenilir)
      // Kayıt oluştur
      // account.create(userId, email, password, name) formatında kullanılmalı
      console.log("📝 Hesap oluşturuluyor...", {
        email,
        hasPassword: !!password,
        name,
      });
      await account.create("unique()", email, password, name || undefined);
      console.log("✅ Hesap oluşturuldu");

      // Session oluştur (name güncelleme ve e-posta doğrulama için gerekli)
      console.log("🔐 Session oluşturuluyor...");
      const session = await account.createEmailPasswordSession(email, password);
      console.log("✅ Session oluşturuldu:", session.$id);

      // Name güncelle (session ile)
      if (name) {
        try {
          console.log("👤 İsim güncelleniyor...");
          await account.updateName(name);
          console.log("✅ İsim güncellendi");
        } catch (nameError) {
          console.warn("⚠️ İsim güncellenemedi:", nameError);
          // İsim güncellenemese bile kayıt başarılı sayılır
        }
      }

      // E-posta doğrulama gönder
      let verificationSent = false;
      try {
        // Verification URL'i belirle
        // E-posta linkleri her zaman web tarayıcıda açılır, bu yüzden her zaman Vercel URL'i kullanmalıyız
        // Reset password gibi, e-posta doğrulama için de Vercel'da deploy edilmiş HTML sayfası kullanılacak
        // Not: Environment variable'dan alınabilir, yoksa default Vercel URL'i kullanılır
        const verificationUrl =
          process.env.EXPO_PUBLIC_VERIFICATION_URL ||
          "https://reset-expo.vercel.app/verify-email";

        console.log("🔗 Verification URL:", verificationUrl);

        console.log("📧 E-posta doğrulama gönderiliyor...", {
          verificationUrl,
        });
        await account.createVerification(verificationUrl);
        console.log("✅ E-posta doğrulama gönderildi");
        verificationSent = true;
      } catch (verificationError) {
        console.warn("⚠️ E-posta doğrulama gönderilemedi:", verificationError);
        // E-posta doğrulama gönderilemese bile kayıt başarılı sayılır
        // Not: AppWrite konsolunda e-posta doğrulama özelliğinin aktif olduğundan emin olun
      }

      // Session'ı sil (kullanıcı e-postasını doğrulayana kadar giriş yapmasın)
      try {
        console.log("🗑️ Session siliniyor...");
        await account.deleteSession(session.$id);
        console.log("✅ Session silindi");
      } catch (deleteError) {
        console.warn("⚠️ Session silinemedi:", deleteError);
      }

      return { success: true, requiresVerification: true, verificationSent };
    } catch (error) {
      console.error("❌ Sign-up error DETAILS:", {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response,
        stack: error.stack,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const createPasswordRecovery = async (email) => {
    try {
      const resetUrl = "https://reset-expo.vercel.app/reset-password";

      await account.createRecovery(email, resetUrl);
      return { success: true };
    } catch (error) {
      console.error("Password recovery error:", error);
      return { success: false, error: error.message };
    }
  };

  // Resends the email-verification link for an unverified email/password account.
  // Creates a temporary session to call createVerification, then always deletes
  // it so no live session is left behind.
  const resendVerification = async ({ email, password }) => {
    try {
      await account.createEmailPasswordSession(email, password);
      try {
        await account.createVerification(VERIFICATION_URL);
        return { success: true };
      } finally {
        // Always clean up the temporary session, even on verification failure.
        // Swallow deleteSession errors so a cleanup glitch cannot mask a
        // successful send and cause the UI to show a false failure.
        try {
          await account.deleteSession("current");
        } catch (cleanupErr) {
          console.warn("resendVerification: deleteSession cleanup failed", cleanupErr);
        }
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      return { success: false, error };
    }
  };

  // Signs in as an anonymous guest with an auto-generated MS- display name
  // derived from the anonymous userId (already unique — no collection query needed).
  const signinAsGuest = async () => {
    setLoading(true);
    try {
      await account.createAnonymousSession();
      const u = await account.get();
      const tail = String(u.$id).slice(-4).toUpperCase();
      const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
      const guestName = `MS-${tail}${rand}`;
      try {
        await account.updateName(guestName);
      } catch {
        // Non-blocking: guest stays logged in even without a name.
      }
      const responseUser = await account.get();
      setSession(await account.getSession("current"));
      setUser(responseUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Anonymous (guest) sessions have no email. signinAsGuest also sets an
  // "MS-" display name but that updateName call is best-effort and may fail,
  // so the empty-email check is the reliable primary signal.
  const isUserObject = user && typeof user === "object";
  const isGuest = Boolean(
    isUserObject &&
      (user.email === "" ||
        (typeof user.name === "string" && user.name.startsWith("MS-")))
  );

  const contextData = {
    session,
    user,
    isGuest,
    signin,
    signout,
    signup,
    createPasswordRecovery,
    resendVerification,
    signinAsGuest,
  };
  return (
    <AuthContext.Provider value={contextData}>
      {loading ? (
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export { AuthContext, AuthProvider, useAuth };

