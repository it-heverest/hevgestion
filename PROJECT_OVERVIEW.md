# Financial Dashboard - Complete Project Overview

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Database Schema](#database-schema)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Core Features](#core-features)
8. [API Endpoints](#api-endpoints)
9. [Key Components & Modules](#key-components--modules)
10. [Development Guidelines](#development-guidelines)
11. [Deployment & Configuration](#deployment--configuration)

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

### Backend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| Node.js | >=18.0.0 | Runtime environment |
| Express.js | 4.21.2 | Web framework |
| TypeScript | 5.3.3 | Type-safe JavaScript |
| Prisma | 5.22.0 | ORM and database tools |
| PostgreSQL | Latest | Primary database |
| JWT | 9.0.2 | Authentication |
| ExcelJS | 4.4.0 | Excel file generation |
| XLSX | 0.18.5 | Excel file parsing |
| Zod | 3.25.76 | Data validation |
| Redis | Latest | Caching and sessions |
| Multer | 1.4.5-lts.1 | File uploads |
| bcryptjs | 2.4.3 | Password hashing |

### Frontend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| React | 18.3.1 | UI Framework |
| TypeScript | 20.x | Type-safe JavaScript |
| Vite | 6.3.5 | Build tool and dev server |
| React Router DOM | 7.9.4 | Client-side routing |
| Radix UI | Various | Accessible UI components |
| Tailwind CSS | Latest | Utility-first CSS framework |
| Recharts | 2.15.2 | Data visualization |
| SpreadJS | 19.0.2 | Excel manipulation |
| jsPDF | 3.0.4 | PDF generation |
| React PDF | 10.2.0 | PDF rendering |
| Axios | 1.13.1 | HTTP client |
| React Hook Form | 7.55.0 | Form management |

---

## 3. Project Architecture

### Overall Structure

```
HevGestion/
├── backend/                    # Express.js API server
│   ├── prisma/                 # Database schema and migrations
│   │   ├── migrations/         # Database migrations
│   │   └── schema.prisma       # Prisma schema definition
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── lib/                # Utility libraries
│   │   ├── utils/              # Helper functions
│   │   ├── types/              # TypeScript type definitions
│   │   ├── validators/         # Request validation
│   │   └── index.ts            # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React.js application
│   ├── public/
│   │   ├── locales/           # i18n translation files
│   │   └── upload/            # Uploaded files and templates
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── DSF/           # DSF-specific components
│   │   │   ├── Notes/         # Notes components
│   │   │   └── *.tsx          # Feature components
│   │   ├── contexts/          # React Context
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript definitions
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

### Architecture Patterns

- **Backend**: RESTful API with service layer pattern
- **Frontend**: Component-based architecture with context for state management
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **File Handling**: Multer for uploads, local storage with cloud storage option

---

## 4. Database Schema

### Core Entities

#### User Management
- **User**: Main user entity with roles (ASSISTANT, COMPTABLE, ADMIN)
- **Client**: Company/client information
- **Folder**: Fiscal exercise/project container
- **FolderAssignment**: User assignments to folders

#### Financial Data
- **Balance**: Accounting balance imports and processing
- **BalanceEquilibrium**: Balance validation results
- **AccountIssue**: Issues found during balance processing
- **FixedAsset**: Fixed asset tracking

#### DSF (Déclaration Statistique et Fiscale)
- **DSF**: Main DSF report entity with all note sections as JSON
- **CoherenceControl**: DSF validation results
- **TaxDeclaration**: Tax declaration tracking

#### Configuration
- **DSFConfig**: DSF configuration categories
- **DSFComptableConfig**: User-specific DSF configurations
- **DSFSystemConfig**: System default configurations
- **DSFMappingConfig**: Excel-to-DSF field mappings

#### Audit & Tracking
- **AuditLog**: Comprehensive audit trail
- **Notification**: User notifications
- **ExcelFileUpload**: File upload tracking

#### Revue Fiscal
- **RevueFiscalCompany**: Fiscal review companies
- **RevueFiscalQuestionnaire**: Review questionnaires
- **RevueFiscalQuestionState**: Question responses

### Key Relationships

```
User (1) ──── (N) FolderAssignment (N) ──── (1) Folder
User (1) ──── (N) Client
User (1) ──── (N) DSFComptableConfig
Client (1) ──── (N) Folder
Folder (1) ──── (1) DSF
Folder (1) ──── (N) Balance
Balance (1) ──── (1) BalanceEquilibrium
Balance (1) ──── (N) AccountIssue
Balance (1) ──── (N) FixedAsset
```

---

## 5. Backend Architecture

### Directory Structure

```
backend/src/
├── config/             # Configuration management
│   ├── database.ts     # Database connection
│   └── index.ts        # App configuration
├── controllers/        # Request handlers
│   ├── auth.controller.ts
│   ├── client.controller.ts
│   ├── folder.controller.ts
│   ├── balance.controller.ts
│   ├── dsf.controller.ts
│   └── audit.controller.ts
├── routes/             # API route definitions
│   ├── auth.routes.ts
│   ├── client.routes.ts
│   ├── folder.routes.ts
│   ├── balance.routes.ts
│   ├── dsf.routes.ts
│   └── index.ts
├── services/           # Business logic layer
│   ├── auth.service.ts
│   ├── client.service.ts
│   ├── folder.service.ts
│   ├── balance.service.ts
│   ├── dsf.service.ts
│   ├── excel.service.ts
│   └── audit.service.ts
├── middleware/         # Express middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── upload.middleware.ts
│   └── error.middleware.ts
├── lib/                # Shared libraries
│   ├── prisma.ts       # Prisma client
│   └── redis.ts        # Redis client
├── utils/              # Utility functions
│   ├── jwt.ts          # JWT utilities
│   ├── password.ts     # Password hashing
│   ├── file.ts         # File operations
│   └── excel.ts        # Excel processing
├── types/              # TypeScript definitions
│   └── index.ts        # Shared types
├── validators/         # Request validation
│   ├── auth.validator.ts
│   ├── client.validator.ts
│   └── dsf.validator.ts
└── index.ts            # Application entry point
```

### Key Backend Components

#### Authentication System
- JWT-based authentication with access/refresh tokens
- Role-based access control (RBAC)
- OTP verification for additional security
- Password reset functionality

#### DSF Processing Engine
- Excel file parsing and validation
- Account mapping to DSF fields
- Report generation with OHADA compliance
- Coherence control and validation

#### Balance Processing
- Excel import with template validation
- Account balance equilibrium checking
- Issue detection and reporting
- Fixed asset extraction and classification

#### Audit System
- Comprehensive logging of all operations
- User activity tracking
- Change history for critical data
- Compliance reporting

---

## 6. Frontend Architecture

### Directory Structure

```
frontend/src/
├── components/         # React components
│   ├── ui/             # Base UI components (Radix UI)
│   ├── DSF/            # DSF-specific components
│   ├── Notes/          # Financial notes components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── pages/          # Page components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── AppContext.tsx  # Application state
├── services/           # API service layer
│   ├── auth.service.ts
│   ├── dsf.service.ts
│   ├── client.service.ts
│   └── api.ts          # Axios configuration
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useDSF.ts
│   └── useApi.ts
├── utils/              # Utility functions
│   ├── fileValidation.ts
│   ├── formulaEngine.ts
│   └── formatters.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── config/             # Configuration
│   └── api.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### State Management

#### Authentication Context
- User authentication state
- Token management (access/refresh)
- Login/logout functionality
- Profile management

#### Application Context
- Country and client selection
- Folder/exercise management
- Loading states
- Error handling

### Key Frontend Components

#### Dashboard Components
- **DashboardGrid**: Main dashboard layout
- **DashboardOverview**: Financial overview
- **AnalyticsDashboard**: Advanced analytics
- **CompanySelector**: Client selection
- **ExerciseSelector**: Fiscal period selection

#### DSF Components
- **DSFConfigInterface**: Configuration panel
- **DSFImporter**: File import wizard
- **ReportGenerator**: Report creation
- **Notes**: Individual financial note components (Note1-Note19)

#### Form Components
- **Login**: Authentication form
- **RegisterPage**: Multi-step registration
- **ExcelBalanceImporter**: Balance import interface
- **TaxCalculator**: Tax calculation tool

#### UI Components
- Built on Radix UI primitives
- Tailwind CSS for styling
- Custom components for specific functionality
- Responsive design patterns

---

## 7. Core Features

### 1. Multi-Company Management
- Create and manage multiple client companies
- Country-specific configurations (Cameroon, Benin, etc.)
- Legal form management (SARL, SA, SUARL, Individual)
- Tax number and contact information tracking

### 2. Exercise/Folder Management
- Fiscal year management
- Status tracking (Draft → Balance Ready → DSF Generated → Completed)
- User assignment and permissions
- Folder-specific configurations

### 3. Balance Sheet Processing
- Excel file import with validation
- Account balance equilibrium checking
- Issue detection and correction
- Fixed asset extraction and classification
- Multi-period support (current/previous year)

### 4. DSF Report Generation
- OHADA-compliant financial reports
- 19 different notes (Balance Sheet, Income Statement, Disclosures)
- Excel template processing
- PDF and Excel export capabilities
- Coherence control and validation

### 5. DSF Configuration System
- Hierarchical configuration (System → Accountant → Exercise)
- Account mapping to DSF fields
- Custom formulas and calculations
- Configuration import/export

### 6. User Management & Security
- Role-based access control
- OTP verification
- Password policies
- Session management
- Audit logging

### 7. Audit & Compliance
- Comprehensive audit trail
- Change tracking
- User activity monitoring
- Compliance reporting

### 8. Notification System
- Real-time notifications
- Deadline reminders
- System alerts
- User communication

---

## 8. API Endpoints

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-otp
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Client Management
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Folder Management
```
GET    /api/folders
POST   /api/folders
GET    /api/folders/:id
PUT    /api/folders/:id
DELETE /api/folders/:id
GET    /api/folders/client/:clientId
POST   /api/folders/:id/assign
DELETE /api/folders/:id/assign/:userId
```

### Balance Management
```
GET    /api/balances
POST   /api/balances/import
GET    /api/balances/:id
PUT    /api/balances/:id
DELETE /api/balances/:id
POST   /api/balances/:id/process
GET    /api/balances/:id/issues
POST   /api/balances/:id/correct
```

### DSF Management
```
GET    /api/dsf
POST   /api/dsf/import
POST   /api/dsf/generate
GET    /api/dsf/:id
PUT    /api/dsf/:id
POST   /api/dsf/:id/validate
POST   /api/dsf/:id/export
GET    /api/dsf/check-status
```

### DSF Configuration
```
GET    /api/dsf-config
POST   /api/dsf-config
GET    /api/dsf-config/:id
PUT    /api/dsf-config/:id
DELETE /api/dsf-config/:id
POST   /api/dsf-config/import
POST   /api/dsf-config/export
```

### Audit & Notifications
```
GET    /api/audit
GET    /api/audit/:id
GET    /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

---

## 9. Key Components & Modules

### Backend Services

#### AuthService
- JWT token management
- Password hashing/verification
- OTP generation and validation
- Session handling

#### DSFService
- DSF report generation
- Excel processing and mapping
- Validation and coherence control
- Export functionality

#### BalanceService
- Excel file processing
- Account validation
- Equilibrium checking
- Issue detection and correction

#### ExcelService
- File upload and validation
- Sheet parsing
- Cell reference resolution
- Data extraction and transformation

### Frontend Components

#### DSFConfigInterface
- Configuration management UI
- Scope-based settings
- Account mapping interface
- Validation and saving

#### ExcelBalanceImporter
- Drag-and-drop file upload
- Real-time validation
- Progress tracking
- Error handling and correction

#### ReportGenerator
- Template selection
- Parameter configuration
- Preview generation
- Export options

#### Note Components (Note1 - Note19)
- Individual financial note editing
- Data binding and calculations
- Validation
- Export integration

---

## 10. Development Guidelines

### Code Organization
- **Backend**: Service layer pattern with controllers, services, and utilities
- **Frontend**: Component-based with clear separation of concerns
- **Database**: Prisma ORM with migration-based schema management
- **Types**: Strict TypeScript usage throughout

### Naming Conventions
- **Files**: kebab-case for files, PascalCase for components
- **Variables**: camelCase
- **Types**: PascalCase with descriptive names
- **Database**: snake_case for columns, PascalCase for tables

### Error Handling
- Backend: Centralized error middleware
- Frontend: Try-catch blocks and error boundaries
- Database: Transaction handling for complex operations
- API: Consistent error response format

### Security Practices
- Input validation with Zod schemas
- JWT authentication with expiration
- Role-based access control
- File upload restrictions
- SQL injection prevention via Prisma
- XSS protection with proper sanitization

---

## 11. Deployment & Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hevgestion"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR="./uploads"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:5000/api"
VITE_APP_NAME="HevGestion"
VITE_ENVIRONMENT="development"
```

### Database Setup
1. Install PostgreSQL
2. Create database: `hevgestion`
3. Run migrations: `npm run prisma:migrate`
4. Generate client: `npm run prisma:generate`
5. Optional seed: `npm run prisma:seed`

### Development Workflow
1. Backend: `npm run dev` (ts-node-dev with hot reload)
2. Frontend: `npm run dev` (Vite dev server)
3. Database: `npm run prisma:studio` for GUI
4. Testing: `npm run test` (Jest setup)

### Production Build
1. Backend: `npm run build && npm start`
2. Frontend: `npm run build` (outputs to dist/)
3. Database: Run migrations in production
4. Environment: Set NODE_ENV=production

### Docker Support
- Dockerfile for both backend and frontend
- Docker Compose for full stack development
- Production-ready container configurations

---

This document provides a comprehensive overview of the Financial Dashboard project. For specific implementation details, refer to the individual component documentation or source code comments.