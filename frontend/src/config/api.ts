// frontend/src/config/api.ts
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  CLIENTS: `${API_BASE_URL}/clients`,
  FOLDERS: `${API_BASE_URL}/folders`,
  COUNTRIES: `${API_BASE_URL}/countries`,
  BALANCES: `${API_BASE_URL}/balances`,
  DSF: `${API_BASE_URL}/dsf`,
  DECLARATIONS: `${API_BASE_URL}/declarations`,
  DGI: `${API_BASE_URL}/dgi`,
} as const;

export default API_CONFIG;
