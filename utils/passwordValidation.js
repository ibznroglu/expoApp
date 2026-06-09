export const validatePassword = (password) => {
  if (!password || typeof password !== "string")
    return { valid: false, error: "Şifre gerekli" };
  if (password.length < 8)
    return { valid: false, error: "Şifre en az 8 karakter olmalı" };
  if (!/[a-z]/.test(password))
    return { valid: false, error: "Şifre en az bir küçük harf içermeli" };
  if (!/[A-Z]/.test(password))
    return { valid: false, error: "Şifre en az bir büyük harf içermeli" };
  if (!/[0-9]/.test(password))
    return { valid: false, error: "Şifre en az bir rakam içermeli" };
  if (!/[^A-Za-z0-9]/.test(password))
    return { valid: false, error: "Şifre en az bir özel karakter içermeli" };
  return { valid: true };
};
