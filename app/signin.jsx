import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SignInStyles } from "../assets/styles/signinStyle.js";

import TextCustom from "./components/TextCustom";

const { width } = Dimensions.get("window");

const SignIn = () => {
  const { session, signin } = useAuth();
  const router = useRouter();

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

      Platform.OS === "web" ? window.alert(errorMsg) : Alert.alert("Eksik Bilgi", errorMsg);
      return;
    }

    setErrors({ email: false, password: false });

    try {
      await signin({ email, password });
    } catch (error) {
      Platform.OS === "web" 
        ? window.alert("E-posta ya da parola hatalı!")
        : Alert.alert("Giriş Başarısız", "E-posta ya da parola hatalı!");
    }
  };

  if (session) return <Redirect href="/" />;

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
          />

          <TouchableOpacity style={SignInStyles.button} onPress={handleSubmit}>
            <Text style={SignInStyles.buttonText}>Giriş Yap & Başla</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={SignInStyles.forgotPasswordButton}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={SignInStyles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignIn;