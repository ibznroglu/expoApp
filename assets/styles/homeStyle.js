
import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,50,0.6)",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  welcomeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
    marginBottom: 8,
  },
  subtitle: {
    color: "#f0f0f0",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  quickGameCard: {
    backgroundColor: 'rgba(255,140,0,0.3)',
    borderColor: 'rgba(255,140,0,0.5)',
  },
  friendGameCard: {
    backgroundColor: 'rgba(0,200,81,0.3)',
    borderColor: 'rgba(0,200,81,0.5)',
  },
  tournamentCard: {
    backgroundColor: 'rgba(155,81,224,0.3)',
    borderColor: 'rgba(155,81,224,0.5)',
  },
  profileCard: {
    backgroundColor: 'rgba(66,133,244,0.3)',
    borderColor: 'rgba(66,133,244,0.5)',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#f0f0f0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  dailyChallenge: {
    width: '100%',
    backgroundColor: 'rgba(255,193,7,0.3)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.5)',
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  challengeDescription: {
    color: '#f0f0f0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  challengeButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});