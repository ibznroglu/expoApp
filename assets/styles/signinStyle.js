import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const SignInStyles = StyleSheet.create({
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
    backdropFilter: Platform.OS === "web" ? "blur(12px)" : undefined,
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
  forgotPasswordButton: {
  marginTop: 20,
  alignItems: 'center',
  paddingVertical: 12,
},
forgotPasswordText: {
  color: '#FF8C00',
  fontSize: 16,
  fontWeight: '600',
},
forgotPasswordHeadline: {
  color: "#fff",
  fontSize: 32,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 8,
  textShadowColor: "#000",
  textShadowOffset: { width: 1, height: 2 },
  textShadowRadius: 6,
},
forgotPasswordSubHeadline: {
  color: "#f0f0f0",
  fontSize: 16,
  textAlign: "center",
  marginBottom: 24,
  lineHeight: 22,
},
});
export const Colors = {
  primary: "#FF8C00",
  error: "#FF4136",
  white: "#fff",
  transparentWhite: "rgba(255,255,255,0.1)",
  darkOverlay: "rgba(0,0,50,0.5)",
};