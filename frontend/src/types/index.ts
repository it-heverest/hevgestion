// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface User {
  id: string;
  email?: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  maxAssistants?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  clients?: any[];
}

export interface Client {
  id: string;
  name: string;
  legalForm: "SARL" | "SA" | "SUARL" | "INDIVIDUAL" | "OTHER";
  taxNumber?: string;
  address?: string;
  clientType?: string;
  email?: string;
  city?: string;
  phone?: string;
  country: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  folders?: any[];
}

export interface Folder {
  id: string;
  name: string;
  clientId: string;
  ownerId: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status:
    | "DRAFT"
    | "IN_PROGRESS"
    | "PROCESSING_BALANCE"
    | "BALANCE_READY"
    | "DSF_GENERATED"
    | "DSF_VALIDATED"
    | "COMPLETED"
    | "ARCHIVED";
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FolderAssignment {
  id: string;
  folderId: string;
  userId: string;
  role: "VIEWER" | "EDITOR" | "ADMIN";
  assignedAt: string;
}

export interface Balance {
  id: string;
  folderId: string;
  data: any;
  processedAt: string;
  status: "PENDING" | "PROCESSED" | "ERROR";
}

export interface DSF {
  id: string;
  folderId: string;
  data: any;
  generatedAt: string;
  status: "DRAFT" | "FINAL";
}

export interface Declaration {
  id: string;
  folderId: string;
  type: string;
  data: any;
  submittedAt: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  flag: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginCredentials {
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  role: "ASSISTANT" | "COMPTABLE" | "ADMIN";
  phoneCountryCode?: string;
  phoneNumber?: string;
  companyName?: string;
  legalForm?: string;
  taxNumber?: string;
  country: string;
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

export interface UserSettings {
  language?: string;
  theme?: string;
  notifications?: {
    email: boolean;
    push: boolean;
  };
}
