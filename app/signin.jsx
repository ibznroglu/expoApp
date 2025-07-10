import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import TextCustom from "./components/TextCustom";

const { width } = Dimensions.get("window");

const SignIn = () => {
  const { session, signin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });

  const handleSubmit = async () => {

    const emailError = email.trim() === "";
    const passwordError = password.trim() === "";

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });

      const message = [];
      if (emailError) message.push("E-posta");
      if (passwordError) message.push("Parola");

      const errorMsg = `${message.join(" ve ")} alanı boş olamaz!`;

      if (Platform.OS === "web") {
        window.alert(errorMsg);
      } else {
        Alert.alert("Eksik Bilgi", errorMsg);
      }
      return;
    }

    setErrors({ email: false, password: false });

    try {
      await signin({ email, password });
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("E-posta ya da parola hatalı!");
      } else {
        Alert.alert("Giriş Başarısız", "E-posta ya da parola hatalı!");
      }
    }
  };

  if (session) return <Redirect href="/" />;

  return (
    <ImageBackground
      source={{
        uri:
          "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      }}
      style={styles.bg}
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.logo}
        />

        <TextCustom style={styles.headline} fontSize={40}>
          Bilgi Arenası
        </TextCustom>
        <TextCustom style={styles.subHeadline}>
          Zekanı Yarıştır!
        </TextCustom>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              errors.email && styles.inputError,
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
          />
          <TextInput
            style={[
              styles.input,
              errors.password && styles.inputError,
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
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Giriş Yap & Başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,50,0.5)",
  },
  container: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    backdropFilter: "blur(12px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  headline: {
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  subHeadline: {
    color: "#f0f0f0",
    fontSize: 18,
    marginBottom: 24,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: "#fff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  inputError: {
    borderColor: "#FF4136",
  },
  button: {
    backgroundColor: "#FF8C00",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default SignIn;