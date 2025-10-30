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
        console.log('🌐 Web platformu - signup deneniyor');
        
        // WEB ÖZEL: AppWrite REST API direkt kullanımı
        if (Platform.OS === 'web') {
            const response = await fetch(`${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
                },
                body: JSON.stringify({
                    userId: 'unique()', // AppWrite'un otomatik oluşturması için
                    email: email,
                    password: password,
                    name: name
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Web signup başarılı:', result);
            return { success: true };
        } else {
            // Mobile için normal SDK
            await account.create(email, password);
            if (name) await account.updateName(name);
            return { success: true };
        }
        
    } catch (error) {
        console.error("❌ Sign-up error:", error);
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

