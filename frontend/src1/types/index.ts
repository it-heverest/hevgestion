export interface User {
  id: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  legalForm: 'SARL' | 'SA' | 'SUARL' | 'INDIVIDUAL' | 'OTHER';
  taxNumber?: string;
  address?: string;
  city?: string;
  phone?: string;
  country: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  folders?: any[]; // For API responses
}

export interface Folder {
  id: string;
  name: string;
  clientId: string;
  ownerId: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PROCESSING_BALANCE' | 'BALANCE_READY' | 'DSF_GENERATED' | 'DSF_VALIDATED' | 'COMPLETED';
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FolderAssignment {
  id: string;
  folderId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN';
  assignedAt: string;
}

export interface Balance {
  id: string;
  folderId: string;
  data: any; // Excel data
  processedAt: string;
  status: 'PENDING' | 'PROCESSED' | 'ERROR';
}

export interface DSF {
  id: string;
  folderId: string;
  data: any;
  generatedAt: string;
  status: 'DRAFT' | 'FINAL';
}

export interface Declaration {
  id: string;
  folderId: string;
  type: string;
  data: any;
  submittedAt: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  flag: string;
}



