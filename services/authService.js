// services/authService.js
import { account } from "../lib/appwrite";

const VERIFICATION_URL =
  process.env.EXPO_PUBLIC_VERIFICATION_URL ||
  "https://reset-expo.vercel.app/verify-email";

export async function getCurrentSession() {
  return await account.getSession("current");
}

export async function getCurrentUser() {
  return await account.get();
}

export async function signIn({ email, password }) {
  const session = await account.createEmailPasswordSession(email, password);
  let user;
  try {
    user = await account.get();
  } catch (err) {
    await account.deleteSession("current");
    throw err;
  }
  if (!user.emailVerification) {
    await account.deleteSession("current");
    throw Object.assign(new Error("Email not verified"), {
      code: "EMAIL_NOT_VERIFIED",
    });
  }
  return { session, user };
}

export async function signUp({ email, password, name }) {
  await account.create("unique()", email, password, name || undefined);
  const session = await account.createEmailPasswordSession(email, password);
  if (name) {
    try {
      await account.updateName(name);
    } catch {
      /* non-blocking */
    }
  }
  let verificationSent = false;
  try {
    await account.createVerification(VERIFICATION_URL);
    verificationSent = true;
  } catch {
    /* non-blocking */
  }
  try {
    await account.deleteSession(session.$id);
  } catch (deleteError) {
    console.warn("signUp: deleteSession failed", deleteError);
  }
  return { success: true, requiresVerification: true, verificationSent };
}

export async function signOut() {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("signOut error:", error);
    throw error;
  }
}

export async function createPasswordRecovery(email) {
  try {
    await account.createRecovery(
      email,
      "https://reset-expo.vercel.app/reset-password",
    );
    return { success: true };
  } catch (error) {
    console.error("Password recovery error:", error);
    return { success: false, error: error.message };
  }
}

export async function resendVerification({ email, password }) {
  try {
    await account.createEmailPasswordSession(email, password);
    try {
      await account.createVerification(VERIFICATION_URL);
      return { success: true };
    } finally {
      try {
        await account.deleteSession("current");
      } catch (cleanupError) {
        console.warn(
          "resendVerification: deleteSession cleanup failed",
          cleanupError,
        );
      }
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return { success: false, error: error };
  }
}

export async function signInAsGuest() {
  await account.createAnonymousSession();
  const u = await account.get(); // first get: name derivation
  const tail = String(u.$id).slice(-4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  const guestName = `MS-${tail}${rand}`;
  try {
    await account.updateName(guestName);
  } catch {
    /* non-blocking */
  }
  const user = await account.get(); // second get: picks up updated name
  const session = await getCurrentSession();
  return { session, user };
}
