import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  signIn,
  signUp,
  signOut,
  getCurrentSession,
  getCurrentUser,
  createPasswordRecovery,
  resendVerification,
  signInAsGuest,
} from "../services/authService";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [user, setUser] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const responseSession = await getCurrentSession();
      setSession(responseSession);

      const responseUser = await getCurrentUser();
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
      const { session, user } = await signIn({ email, password });
      setSession(session);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    setLoading(true);
    try {
      await signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, name }) => {
    setLoading(true);
    try {
      return await signUp({ email, password, name });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signinAsGuest = async () => {
    setLoading(true);
    try {
      const { session, user } = await signInAsGuest();
      setSession(session);
      setUser(user);
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

