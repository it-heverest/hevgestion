export const generateStrongPassword = (): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|";
  let password = "";

  // Au moins un de chaque catégorie
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*()_+-=[]{}|"[Math.floor(Math.random() * 12)];

  // Compléter jusqu'à 12 caractères
  while (password.length < 12) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
