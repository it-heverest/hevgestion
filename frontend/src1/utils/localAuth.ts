import CryptoJS from "crypto-js";
import jwtEncode from "jwt-encode";

export interface User {
  id: string;
  email?: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  password?: string; // Optional for responses, required for storage
  firstName: string;
  lastName: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  maxAssistants?: number;
  isActive: boolean;
  createdAt: string;
  clients?: any[];
  resetToken?: string;
  resetTokenExpiry?: string;
}

export interface RegisterData {
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  country: string;
  companyName?: string;
  legalForm?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: Tokens;
  error?: string;
  message?: string;
  requiresOtp?: boolean;
}

const JWT_SECRET = "your-jwt-secret-key-change-in-production";
const REFRESH_SECRET = "your-refresh-secret-key-change-in-production";
const SALT_ROUNDS = 12;

// Hash password using crypto-js (simplified bcrypt alternative for client-side)
export const hashPassword = async (password: string): Promise<string> => {
  // Use PBKDF2 with salt for client-side hashing
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return salt.toString() + ":" + hash.toString();
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const [saltStr, hashStr] = hashedPassword.split(":");
  const salt = CryptoJS.enc.Hex.parse(saltStr);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return hash.toString() === hashStr;
};

export interface TokenPayload {
  userId: string;
  email?: string;
  role: string;
  exp?: number;
  iat?: number;
}

export const generateAccessToken = (
  payload: Omit<TokenPayload, "exp" | "iat">
): string => {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 15 * 60, // 15 minutes
  };
  return jwtEncode(tokenPayload, JWT_SECRET);
};

export const generateRefreshToken = (
  payload: Omit<TokenPayload, "exp" | "iat">
): string => {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };
  return jwtEncode(tokenPayload, REFRESH_SECRET);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwtEncode.decode(token, JWT_SECRET) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      throw new Error("Token expired");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwtEncode.decode(token, REFRESH_SECRET) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      throw new Error("Refresh token expired");
    }
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
