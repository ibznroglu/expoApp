import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet } from "react-native";
import { account } from "../lib/appwrite";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(false);
    const [user, setUser] = useState(false);

    useEffect(() => {
        init();   
    }, []);      

    const init= async () => {
        checkAuth()
    }  
    const checkAuth = async () => {
        try {
            const responseSession = await account.getSession("current");
            setSession(responseSession);
            const responseUser = await account.get();
            setUser(responseUser);
        } catch (error) {
            console.error("Error checking authentication:", error);
        }
            setLoading(false);
        }

    const signin = async ({ email, password }) => {
    setLoading(true);
    try {
        const responseSession = await account.createEmailPasswordSession(email, password);
        setSession(responseSession);
        const responseUser = await account.get();
        setUser(responseUser);
    } catch (error) {
        console.error("Error during sign-in:", error);
        throw error;
    } finally {
        setLoading(false);
    }
    };

    
    const signout = async () => {
        setLoading(true);
            await account.deleteSession("current");
            setSession(null);
            setUser(null);
            setLoading(false);
    };
// AuthContext.js - signup fonksiyonunu şu şekilde değiştir:
// AuthContext.js - web için farklı bir yaklaşım
const signup = async ({ email, password, name }) => {
    setLoading(true);
    try {
        console.log('🔄 Signup başlatılıyor:', { email, hasName: !!name, platform: Platform.OS });
        
        // WEB ve MOBILE için AppWrite SDK kullanımı (daha güvenilir)
        // Kayıt oluştur
        // account.create(userId, email, password, name) formatında kullanılmalı
        console.log('📝 Hesap oluşturuluyor...', { email, hasPassword: !!password, name });
        await account.create('unique()', email, password, name || undefined);
        console.log('✅ Hesap oluşturuldu');
        
        // Session oluştur (name güncelleme ve e-posta doğrulama için gerekli)
        console.log('🔐 Session oluşturuluyor...');
        const session = await account.createEmailPasswordSession(email, password);
        console.log('✅ Session oluşturuldu:', session.$id);
        
        // Name güncelle (session ile)
        if (name) {
            try {
                console.log('👤 İsim güncelleniyor...');
                await account.updateName(name);
                console.log('✅ İsim güncellendi');
            } catch (nameError) {
                console.warn('⚠️ İsim güncellenemedi:', nameError);
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
            const verificationUrl = process.env.EXPO_PUBLIC_VERIFICATION_URL || "https://reset-expo.vercel.app/verify-email";
            
            console.log('🔗 Verification URL:', verificationUrl);
            
            console.log('📧 E-posta doğrulama gönderiliyor...', { verificationUrl });
            await account.createVerification(verificationUrl);
            console.log('✅ E-posta doğrulama gönderildi');
            verificationSent = true;
        } catch (verificationError) {
            console.warn('⚠️ E-posta doğrulama gönderilemedi:', verificationError);
            // E-posta doğrulama gönderilemese bile kayıt başarılı sayılır
            // Not: AppWrite konsolunda e-posta doğrulama özelliğinin aktif olduğundan emin olun
        }
        
        // Session'ı sil (kullanıcı e-postasını doğrulayana kadar giriş yapmasın)
        try {
            console.log('🗑️ Session siliniyor...');
            await account.deleteSession(session.$id);
            console.log('✅ Session silindi');
        } catch (deleteError) {
            console.warn('⚠️ Session silinemedi:', deleteError);
        }
        
        return { success: true, requiresVerification: true, verificationSent };
        
    } catch (error) {
        console.error("❌ Sign-up error DETAILS:", {
            message: error.message,
            code: error.code,
            type: error.type,
            response: error.response,
            stack: error.stack
        });
        throw error;
    } finally {
        setLoading(false);
    }
};
const createPasswordRecovery = async (email) => {
  try {
    const resetUrl = "https://reset-expo.vercel.app/reset-password"
    
    await account.createRecovery(email, resetUrl);
    return { success: true };
  } catch (error) {
    console.error("Password recovery error:", error);
    return { success: false, error: error.message };
  }
};

    const contextData = { session, user, signin, signout,signup,createPasswordRecovery };
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

