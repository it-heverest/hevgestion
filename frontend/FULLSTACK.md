# Financial Dashboard - Complete Frontend Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Core Data Models](#core-data-models)
5. [State Management](#state-management)
6. [API Services Layer](#api-services-layer)
7. [Components Documentation](#components-documentation)
8. [Excel Processing System](#excel-processing-system)
9. [DSF (Déclaration Statistique et Fiscale) Module](#dsf-déclaration-statistique-et-fiscale-module)
10. [Authentication System](#authentication-system)
11. [Configuration & Environment](#configuration--environment)
12. [Utility Functions](#utility-functions)
13. [Development Guide](#development-guide)
14. [API Endpoints Reference](#api-endpoints-reference)

---

## 1. Project Overview

The **Financial Dashboard** is a comprehensive web application designed for accounting professionals and businesses in Cameroon and other OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) region countries. The application provides robust tools for managing corporate finances, generating statistical and fiscal declarations (DSF), and processing accounting balances.

### Key Capabilities

- **Multi-Company Management**: Handle multiple companies from a single interface
- **Exercise/Period Management**: Manage fiscal years and accounting periods
- **DSF Reporting**: Generate compliant Déclaration Statistique et Fiscale reports
- **Balance Sheet Processing**: Import and process Excel-based balance sheets
- **Report Generation**: Create various financial reports in multiple formats
- **Real-time Collaboration**: Multiple users can work on the same data
- **Audit Trail**: Comprehensive logging of all operations

### Target Users

- Accountants (Comptables)
- Accounting Assistants (Assistants)
- Administrators
- Financial Managers

---

## 2. Technology Stack

### Core Technologies

| Technology       | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| React            | 18.3.1  | UI Framework              |
| TypeScript       | 20.x    | Type-safe JavaScript      |
| Vite             | 6.3.5   | Build tool and dev server |
| React Router DOM | 7.9.4   | Client-side routing       |

### UI Framework & Components

| Library             | Version | Purpose                     |
| ------------------- | ------- | --------------------------- |
| Radix UI Primitives | Various | Accessible UI components    |
| Tailwind CSS        | Latest  | Utility-first CSS framework |
| Lucide React        | 0.487.0 | Icon library                |
| Recharts            | 2.15.2  | Data visualization          |
| Motion              | Latest  | Animation library           |

### Form & Data Handling

| Library         | Version | Purpose         |
| --------------- | ------- | --------------- |
| React Hook Form | 7.55.0  | Form management |
| Axios           | 1.13.1  | HTTP client     |

### Excel & Document Processing

| Library       | Version | Purpose               |
| ------------- | ------- | --------------------- |
| SpreadJS      | 19.0.2  | Excel manipulation    |
| XLSX          | 0.18.5  | Excel file parsing    |
| Fortune Sheet | 1.0.4   | Web-based spreadsheet |
| jsPDF         | 3.0.4   | PDF generation        |
| react-pdf     | 10.2.0  | PDF rendering         |

### Authentication & Security

| Library    | Version | Purpose              |
| ---------- | ------- | -------------------- |
| crypto-js  | 4.2.0   | Encryption utilities |
| jwt-encode | 1.0.1   | JWT handling         |

---

## 3. Project Architecture

### Directory Structure

```
frontend/
├── public/                          # Static assets
│   └── upload/
│       ├── reportconfig.xlsx       # Report template
│       └── templates/
│           └── dsf_complet.xlsx    # DSF template
├── src/
│   ├── components/                  # React components
│   │   ├── ui/                     # Base UI components
│   │   ├── DSF/                    # DSF-specific components
│   │   ├── Notes/                  # Notes components
│   │   ├── Accounting.tsx          # Accounting module
│   │   ├── AllReports.tsx          # Reports listing
│   │   ├── AnalyticsDashboard.tsx  # Analytics view
│   │   ├── AuditHistory.tsx        # Audit logs
│   │   ├── BalanceImporter.tsx     # Balance import
│   │   ├── CompanySelector.tsx     # Company selection
│   │   ├── CountrySelector.tsx     # Country selection
│   │   ├── DashboardGrid.tsx       # Dashboard layout
│   │   ├── DashboardOverview.tsx   # Dashboard content
│   │   ├── DSFConfigInterface.tsx  # DSF configuration
│   │   ├── DSFImporter.tsx         # DSF import
│   │   ├── ExcelBalanceImporter.tsx
│   │   ├── ExerciseSelector.tsx    # Exercise/year selection
│   │   ├── Login.tsx               # Login form
│   │   ├── RegisterPage.tsx        # Registration
│   │   ├── ReportGenerator.tsx     # Report builder
│   │   ├── SimpleSettings.tsx       # Settings panel
│   │   ├── TaxCalculator.tsx       # Tax calculator
│   │   ├── TaxDeadlines.tsx        # Tax deadlines
│   │   └── ...
│   ├── contexts/                    # React Context
│   │   ├── AuthContext.tsx         # Authentication state
│   │   └── AppContext.tsx          # Application state
│   ├── services/                   # API service layer
│   │   ├── auth.service.ts         # Authentication
│   │   ├── dsf.service.ts          # DSF operations
│   │   ├── dsf-config.service.ts   # DSF configuration
│   │   ├── client.service.ts       # Client management
│   │   ├── folder.service.ts       # Folder operations
│   │   ├── excel/
│   │   │   ├── excelExtractor.ts   # Excel extraction
│   │   │   └── noteConfigs.ts      # Note configurations
│   │   └── ...
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                      # Utility functions
│   │   ├── filevalidation.ts       # File validation
│   │   ├── formula-engine.ts       # Formula calculations
│   │   └── localAuth.ts            # Local auth utilities
│   ├── types/                      # TypeScript definitions
│   │   └── index.ts                # Core types
│   ├── config/                     # App configuration
│   │   └── api.ts                 # API configuration
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── build/                          # Production build
├── package.json                    # Dependencies
└── vite.config.ts                 # Vite config
```

---

## 4. Core Data Models

### TypeScript Interfaces

The application uses TypeScript for type safety. The core types are defined in `frontend/src/types/index.ts`.

#### User Model

```typescript
interface User {
  id: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  role: string; // "ASSISTANT" | "COMPTABLE" | "ADMIN"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Client Model

```typescript
interface Client {
  id: string;
  name: string;
  legalForm: "SARL" | "SA" | "SUARL" | "INDIVIDUAL" | "OTHER";
  taxNumber?: string;
  address?: string;
  city?: string;
  phone?: string;
  country: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  folders?: Folder[];
}
```

#### Folder (Exercise) Model

```typescript
interface Folder {
  id: string;
  name: string;
  clientId: string;
  ownerId: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  status:
    | "DRAFT"
    | "PROCESSING_BALANCE"
    | "BALANCE_READY"
    | "DSF_GENERATED"
    | "DSF_VALIDATED"
    | "COMPLETED";
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

#### Balance Model

```typescript
interface Balance {
  id: string;
  folderId: string;
  data: any;
  processedAt: string;
  status: "PENDING" | "PROCESSED" | "ERROR";
}
```

#### DSF Model

```typescript
interface DSF {
  id: string;
  folderId: string;
  data: any;
  generatedAt: string;
  status: "DRAFT" | "FINAL";
}
```

---

## 5. State Management

The application uses React Context API for state management, divided into two main contexts:

### 5.1 Authentication Context (AuthContext.tsx)

Located at `frontend/src/contexts/AuthContext.tsx`, this context manages:

- **User Authentication State**: Login status, user information
- **Tokens Management**: Access and refresh tokens
- **Session Handling**: Token expiration, refresh logic

#### Key Interfaces

```typescript
interface LoginCredentials {
  phoneCountryCode?: string;
  phoneNumber?: string;
  password: string;
}

interface RegisterData {
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

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: Tokens;
  error?: string;
  requiresOtp?: boolean;
}
```

### 5.2 Application Context (AppContext.tsx)

Located at `frontend/src/contexts/AppContext.tsx`, this context manages:

- **Country Selection**: Multi-country support
- **Client Management**: Create, read, update, delete clients
- **Folder/Exercise Management**: Manage fiscal years
- **Selection State**: Current selected country, client, folder

```typescript
interface AppContextType {
  // Data state
  countries: Country[];
  clients: Client[];
  folders: Folder[];
  loading: boolean;
  isFullyLoaded: boolean;
  error: string | null;

  // Selection state
  selectedCountry: string | null;
  filteredClients: Client[];
  selectedClient: Client | null;
  filteredFolders: Folder[];
  currentFolder: Folder | null;
  selectedFolder: Folder | null;
}
```

---

## 6. API Services Layer

The services layer provides a clean abstraction over HTTP requests. All services use Axios for HTTP communication.

### 6.1 API Configuration

Base URL configuration in `frontend/src/config/api.ts`:

```typescript
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
} as const;
```

### 6.2 Authentication Service

File: `frontend/src/services/auth.service.ts`

```typescript
class AuthService {
  // Token management
  setAccessToken(token: string): void;
  getToken(): string | null;
  clearTokens(): void;
  isAuthenticated(): boolean;

  // Authentication methods
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  verifyOtp(otp: string): Promise<AuthResponse>;
  forgotPassword(phone: string): Promise<PasswordResetResponse>;
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<PasswordResetResponse>;

  // Profile management
  updateProfile(data: UpdateProfileData): Promise<User>;
  getProfile(): Promise<User>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
}
```

**Key Features:**

- JWT token handling with expiration checking
- Automatic token refresh mechanism (5-minute buffer)
- HTTP-only cookie support

### 6.3 DSF Service

File: `frontend/src/services/dsf.service.ts`

```typescript
class DSFService {
  // Import/Export
  importDSF(folderId: string, file: File): Promise<DSFImportResponse>;
  generateDSF(folderId: string): Promise<{ message: string; dsf: any }>;
  exportDSF(
    dsfId: string,
    format?: string,
  ): Promise<{ message: string; downloadUrl: string }>;

  // CRUD operations
  getDSF(folderId: string): Promise<{ dsf: any }>;
  updateDSF(
    dsfId: string,
    data: any,
  ): Promise<{ message: string; results: any }>;

  // Validation
  validateDSF(
    dsfId: string,
  ): Promise<{ message: string; isValid: boolean; issues: string[] }>;
  getCoherenceReport(dsfId: string): Promise<{ coherenceControl: any }>;

  // Status
  checkDSFStatus(
    clientId: string,
    folderId: string,
  ): Promise<DSFStatusResponse>;
}
```

### 6.4 DSF Config Service

File: `frontend/src/services/dsf-config.service.ts`

```typescript
interface DSFConfig {
  id: string;
  configId: string;
  ownerId: string;
  ownerType: "SYSTEM" | "ACCOUNTANT" | "ADMIN";
  codeDsf: string;
  libelle: string;
  operations: string[];
  destinationCell: string | null;
  scope: "GLOBAL" | "CLIENT" | "EXERCISE";
  clientId: string | null;
  exerciseId: string | null;
  isActive: boolean;
  isLocked: boolean;
  isModified: boolean;
  baseConfigId: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}
```

### 6.5 Excel Extractor Service

File: `frontend/src/services/excel/excelExtractor.ts`

This service handles Excel file parsing and data extraction:

```typescript
interface MappingCellule {
  [key: string]: string; // e.g., grossAmount: "C10"
}

interface ConfigurationMapping {
  entete: MappingCellule;
  sections: {
    [sectionName: string]: {
      libelles: string[];
      lignes: MappingCellule[];
    };
  };
}

interface DonneesExtraites {
  entete: { [key: string]: any };
  sections: {
    [sectionName: string]: {
      libelles: string[];
      lignes: Array<{ [fieldName: string]: any }>;
    };
  };
}
```

### 6.6 Notes Configuration

File: `frontend/src/services/excel/noteConfigs.ts`

Defines configurations for all DSF notes (Note 1 through Note 16C):

```typescript
const NOTE_CONFIGS = {
  "NOTE 1": {
    noteNumber: "1",
    sheetName: "Note 1 ",
    transform: "transformNote1Data",
  },
  "NOTE 2": {
    noteNumber: "2",
    sheetName: "NOTE 2",
    transform: "transformNote2Data",
  },
  // ... Note 3A through Note 16C
};
```

Supported Notes:

- **Note 1**: Long and medium-term debts, leasing, current liabilities, commitments
- **Note 2**: Fixed assets
- **Note 3A**: Intangible assets (immobilisations incorporelles)
- **Note 3B**: Tangible assets (immobilisations corporelles)
- **Note 3C**: Advance payments (avancesacomptes)
- **Note 3D**: Financial assets (immobilisations financières)
- **Note 3E**: Receivables (créances)
- **Note 3F**: Short-term investments (placements)
- **Note 4**: Cash and cash equivalents
- **Note 5**: Equity
- **Note 6**: Provisions
- **Note 7**: Financial debts
- **Note 8**: Supplier and other debts
- **Note 9**: Regularization accounts
- **Note 10**: Operating revenue
- **Note 11**: Operating expenses
- **Note 12**: Financial income/expenses
- **Note 13**: Taxes
- **Note 14**: Employee benefits
- **Note 15A/15B**: Related parties
- **Note 16A/16B/16B_BIS/16C**: Additional disclosures

---

## 7. Components Documentation

### 7.1 Core Application Components

#### App.tsx

The main application component located at `frontend/src/App.tsx`. It sets up:

- React Router with all application routes
- Authentication provider wrapper
- Application context provider
- Sidebar navigation
- Main layout structure

**Navigation Items:**

```typescript
const navigationItems = [
  {
    id: "dashboard",
    label: "Tableau de Bord",
    icon: LayoutDashboard,
    path: "/web/user/dashboard",
  },
  {
    id: "exercise",
    label: "Exercice",
    icon: Calendar,
    path: "/web/user/exercise",
  },
  {
    id: "import",
    label: "Import Balance",
    icon: Upload,
    path: "/web/user/import",
  },
  {
    id: "traitement",
    label: "Traitement",
    icon: Edit3,
    path: "/web/user/traitement",
  },
  // ... more items
];
```

### 7.2 Authentication Components

#### Login.tsx

Multi-step login form with:

- Phone/email authentication
- Password validation (uppercase, lowercase, number, special char, 8+ chars)
- Remember me functionality
- Loading states
- Error handling

#### RegisterPage.tsx

Multi-step registration wizard:

- Step 1: Personal information (name, email)
- Step 2: Security (password)
- Step 3: Role selection (Assistant, Accountant, Admin)
- Step 4: Company details
- Progress tracking

#### ForgotPassword.tsx

Password recovery with:

- Phone number input
- OTP verification
- New password submission

#### OtpVerificationPage.tsx

OTP verification component with:

- 6-digit OTP input
- Auto-submit on complete
- Resend OTP option

### 7.3 Dashboard Components

#### DashboardGrid.tsx

Main dashboard layout using CSS Grid:

- Responsive grid system
- Card-based widget layout

#### DashboardOverview.tsx

Financial overview with:

- Key metrics display
- Charts and graphs
- Quick action buttons

#### AnalyticsDashboard.tsx

Advanced analytics featuring:

- Recharts visualizations
- Interactive charts
- Data filtering

### 7.4 Selection Components

#### CountrySelector.tsx

Multi-country support:

- Country dropdown with flags
- Currency display
- Persisted selection

#### CompanySelector.tsx

Company/client selection:

- Search functionality
- Filter by country
- Quick switch

#### ExerciseSelector.tsx

Fiscal year/exercise selection:

- Year picker
- Status indicators
- Quick navigation

### 7.5 Balance Management Components

#### ExcelBalanceImporter.tsx

Excel file import interface:

- Drag and drop upload
- File validation (.xlsx, .xls, max 10MB)
- Progress indication
- Error handling

#### ExcelBalanceProcessor.tsx

Balance processing interface:

- Data preview
- Validation rules
- Processing status
- Error reporting

#### BalanceImportGuide.tsx

Step-by-step import guide:

- Format requirements
- Template download
- Example data

#### BalanceProcessor.tsx

Main balance processing:

- Multi-step processing
- Data mapping
- Validation

### 7.6 DSF Components

#### DSFConfigInterface.tsx

Comprehensive DSF configuration panel:

- Category-based organization
- Scope management (Global/Client/Exercise)
- Configuration editing
- Lock/unlock functionality

#### DSFImporter.tsx

DSF data import wizard:

- Step-by-step upload
- Validation
- Preview data
- Error correction

#### DSFMappingEditor.tsx

Account mapping editor:

- Visual mapping interface
- Field configuration
- Save/load mappings

#### uploadSteps.tsx

Located at `frontend/src/components/DSF/uploadSteps.tsx`, this component provides:

```typescript
interface ExtractionResult {
  noteName: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Main features
- Step 1: File upload and validation
- Step 2: Sheet selection
- Step 3: Data extraction preview
- Step 4: Validation results
- Step 5: Import completion
```

#### ReportRenderer.tsx

DSF report rendering:

- Dynamic data binding
- Format conversion
- Print support

#### ReportsView.tsx

DSF reports viewer:

- Report listing
- Preview
- Export options

### 7.7 Report Components

#### AllReports.tsx

Central reports hub:

- Report categories
- Search and filter
- Quick access

#### ReportGenerator.tsx

Report building interface:

- Template selection
- Parameter configuration
- Preview generation

#### ReportEditor.tsx

In-place report editing:

- Rich text editing
- Data insertion
- Formatting tools

#### ReportExport.tsx

Export options panel:

- PDF export
- Excel export
- Print options

#### ReportViewer.tsx

Report preview component:

- PDF rendering
- Zoom controls
- Page navigation

### 7.8 Tax Components

#### TaxCalculator.tsx

Tax calculation tool:

- Multiple tax types
- Rate configuration
- Result display

#### TaxDeadlines.tsx

Tax deadline tracker:

- Calendar view
- Reminder settings
- Status tracking

#### DGIDeclarationProfessional.tsx

Professional DGI declarations:

- Form filling
- Validation
- Submission

### 7.9 Settings & Configuration

#### SimpleSettings.tsx

Comprehensive settings panel:

- Company settings
- User preferences
- Theme customization
- Notification settings

### 7.10 Audit & History

#### AuditHistory.tsx

Audit trail viewer:

- Operation logs
- User tracking
- Date filtering

#### OperationHistory.tsx

Operation history:

- Timeline view
- Details expansion
- Export options

---

## 8. Excel Processing System

### File Validation

File: `frontend/src/utils/filevalidation.ts`

```typescript
export const VALID_EXCEL_EXTENSIONS = [".xlsx", ".xls"] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateExcelFile = (file: File): FileValidationResult => {
  // Validates file extension and size
};

export const formatFileSize = (bytes: number): string => {
  // Formats file size for display
};
```

### Excel Extraction Process

1. **File Upload**: User uploads Excel file
2. **Validation**: System validates file format and size
3. **Sheet Detection**: System identifies available sheets
4. **Configuration Mapping**: Apply configured mappings
5. **Data Extraction**: Extract data cell-by-cell
6. **Transformation**: Transform data to internal format
7. **Validation**: Validate extracted data
8. **Storage**: Save to backend

### Cell Reference Parsing

The system uses Excel cell references (e.g., "A1", "C10") to extract data:

```typescript
function analyserReferenceCellule(refCellule: string): {
  ligne: number;
  colonne: number;
} {
  const match = refCellule.match(/^([A-Z]+)(\d+)$/);
  // Convert column letters to index (A=0, B=1, ..., Z=25, AA=26, etc.)
  // Convert row number to 0-based index
}
```

---

## 9. DSF (Déclaration Statistique et Fiscale) Module

### Overview

The DSF is the core reporting module for the application. It's designed for Cameroon tax reporting requirements.

### DSF Workflow

1. **Configuration**: Set up DSF parameters per company
2. **Balance Import**: Import accounting balances
3. **Data Mapping**: Map accounts to DSF fields
4. **DSF Generation**: Generate DSF from balances
5. **Validation**: Validate DSF data
6. **Export**: Export to required format
7. **Submission**: Submit to tax authorities

### DSF Configuration

```typescript
interface DSFConfig {
  codeDsf: string; // DSF code identifier
  libelle: string; // Description
  operations: string[]; // Operations to include
  destinationCell: string | null; // Output cell
  scope: "GLOBAL" | "CLIENT" | "EXERCISE";
}
```

### DSF Categories

- **Balance Sheet**: Notes 1-9
- **Income Statement**: Notes 10-14
- **Disclosures**: Notes 15A-16C

---

## 10. Authentication System

### Authentication Flow

1. **Login Request**: User submits credentials
2. **Verification**: Backend validates credentials
3. **OTP Challenge**: If enabled, send OTP
4. **Token Generation**: Generate JWT tokens
5. **Token Storage**: Store tokens securely
6. **Session Init**: Create user session

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Management

- Access token: Short-lived (typically 1 hour)
- Refresh token: Long-lived (typically 7 days)
- Automatic refresh 5 minutes before expiration

---

## 11. Configuration & Environment

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Theme Configuration

The application supports dark/light mode via `next-themes`:

```typescript
// Theme options
type Theme = "light" | "dark" | "system";
```

---

## 12. Utility Functions

### File Validation

Located at `frontend/src/utils/filevalidation.ts`:

- `validateExcelFile()`: Validates Excel file format and size
- `formatFileSize()`: Formats file size for display

### Formula Engine

Located at `frontend/src/utils/formula-engine.ts`:

- Custom formula calculations
- Excel-compatible functions

### Local Auth

Located at `frontend/src/utils/localAuth.ts`:

- Local storage authentication
- Token persistence

---

## 13. Development Guide

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (default: http://localhost:5000)

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Production files are generated in the `build/` directory.

### Adding New Components

1. Create component in `src/components/`
2. Use existing UI components from `src/components/ui/`
3. Add routing in `App.tsx`
4. Add service methods if API needed

---

## 14. API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| POST   | `/api/auth/login`           | User login        |
| POST   | `/api/auth/register`        | User registration |
| POST   | `/api/auth/logout`          | User logout       |
| POST   | `/api/auth/verify-otp`      | OTP verification  |
| POST   | `/api/auth/forgot-password` | Password recovery |
| POST   | `/api/auth/reset-password`  | Password reset    |
| GET    | `/api/auth/profile`         | Get user profile  |
| PUT    | `/api/auth/profile`         | Update profile    |

### Client Endpoints

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| GET    | `/api/clients`     | List all clients |
| GET    | `/api/clients/:id` | Get client by ID |
| POST   | `/api/clients`     | Create client    |
| PUT    | `/api/clients/:id` | Update client    |
| DELETE | `/api/clients/:id` | Delete client    |

### Folder Endpoints

| Method | Endpoint                        | Description           |
| ------ | ------------------------------- | --------------------- |
| GET    | `/api/folders`                  | List all folders      |
| GET    | `/api/folders/:id`              | Get folder by ID      |
| GET    | `/api/folders/client/:clientId` | Get folders by client |
| POST   | `/api/folders`                  | Create folder         |
| PUT    | `/api/folders/:id`              | Update folder         |
| DELETE | `/api/folders/:id`              | Delete folder         |

### DSF Endpoints

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| POST   | `/api/dsf/import`       | Import DSF file    |
| POST   | `/api/dsf/generate`     | Generate DSF       |
| GET    | `/api/dsf/:folderId`    | Get DSF for folder |
| PUT    | `/api/dsf/:id`          | Update DSF         |
| POST   | `/api/dsf/:id/validate` | Validate DSF       |
| POST   | `/api/dsf/:id/export`   | Export DSF         |
| GET    | `/api/dsf/check-status` | Check DSF status   |

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For technical support, please contact the development team.
