# 🌐 HevGestion Localization System

Complete English-French (EN/FR) localization system with URL-based language routing and client-side switching.

## 📋 Overview

The localization system features:
- **URL-based language routing**: `/en` and `/fr` prefixes for all routes
- **Default language**: French `/fr` (non-prefixed URLs redirect to `/fr`)
- **Language persistence**: Language selection stored in App Context
- **Dynamic language switching**: Users can change language in Settings with automatic URL update
- **Comprehensive translations**: 100+ translation keys covering the entire application
- **JSON localization files**: For easy export, import, and third-party translation tools
- **React Router integration**: Seamless navigation with language awareness

## 🗂️ Project Structure

### Frontend Localization Files

```
frontend/
├── src/
│   ├── locales/
│   │   └── translations.ts          # Main translation definitions (TypeScript)
│   ├── hooks/
│   │   └── useLanguageRoute.ts      # Hook for managing language routing
│   ├── contexts/
│   │   └── AppContext.tsx           # Contains language state management
│   └── components/
│       └── SimpleSettings.tsx       # Language selector component
└── public/
    └── locales/
        ├── en.json                  # English translations (JSON)
        └── fr.json                  # French translations (JSON)
```

## 🚀 How It Works

### 1. URL-Based Language Routing

All routes are prefixed with the language code:

```
/fr/web/user/dashboard     → French version
/en/web/user/dashboard     → English version
/web/user/dashboard        → Redirects to /fr/web/user/dashboard (default)
```

### 2. Language Detection and Setting

The `useLanguageRoute` hook automatically:
- Extracts language from URL on mount
- Updates `AppContext.language` state
- Provides `changeLanguage()` function for navigation

```typescript
const { language, changeLanguage } = useLanguageRoute();

// Change to English
changeLanguage('en');  // Navigates to /en/<current-path>
```

### 3. App Context Integration

Language is managed in `AppContext`:

```typescript
const { language, setLanguage } = useApp();

// Get current language
console.log(language); // 'en' | 'fr'

// Change language (also updates URL)
setLanguage('en');
```

### 4. Translation Usage

Use the `useTranslation` hook to access translations:

```typescript
import { useTranslation } from "../hooks/useTranslation";

function MyComponent() {
  const { t, language } = useTranslation();

  return (
    <h1>{t("dashboard")}</h1>
    <p>Current language: {language}</p>
  );
}
```

## 📝 Translation Keys

### Available Translation Categories

1. **Navigation** - `dashboard`, `clients`, `exercises`, `reports`, `settings`
2. **Common** - `loading`, `error`, `save`, `cancel`, `delete`, `edit`, `create`
3. **Authentication** - `login`, `logout`, `email`, `password`, `register`
4. **Client Management** - `addClient`, `clientName`, `selectClientFirst`
5. **Exercise Management** - `addExercise`, `exerciseName`, `fiscalYear`
6. **Balance Processing** - `uploadBalance`, `processBalance`, `balanceEquilibre`
7. **DSF** - `dsfGeneration`, `generateDSF`, `dsfValidation`, `dsfExport`
8. **Reports** - `allReports`, `balanceSheet`, `incomeStatement`
9. **Settings** - `profileSettings`, `changePassword`, `theme`, `language`
10. **Messages** - `success`, `warning`, `operationCompleted`, `confirmDelete`
11. **Validation** - `requiredField`, `invalidEmail`, `passwordMismatch`

See [src/locales/translations.ts](frontend/src/locales/translations.ts) for the complete list.

## 🔄 Adding New Translations

### Step 1: Update TypeScript Interface

Edit `frontend/src/locales/translations.ts`:

```typescript
export interface TranslationKeys {
  // ... existing keys
  myNewKey: string;
}
```

### Step 2: Add English Translation

```typescript
export const translations: Record<string, TranslationKeys> = {
  en: {
    // ... existing translations
    myNewKey: "My New Key in English",
  },
  // ...
};
```

### Step 3: Add French Translation

```typescript
  fr: {
    // ... existing translations
    myNewKey: "Ma Nouvelle Clé en Français",
  },
};
```

### Step 4: Update JSON Files (Optional)

Update `public/locales/en.json` and `public/locales/fr.json` for consistency:

```json
{
  "myCategory": {
    "myNewKey": "My New Key in English"
  }
}
```

### Step 5: Use in Component

```typescript
const { t } = useTranslation();

return <h1>{t("myNewKey")}</h1>;
```

## 💾 Language Persistence

The current language is stored in App Context with localStorage fallback through `secureStorageService`:

```typescript
// Language is automatically persisted
setLanguage('en');

// On app reload, language is restored from storage
const savedLanguage = localStorage.getItem('app_language');
```

## 🌍 Language Switching in Settings

Users can change language in **Settings → Préférences → Langue**:

```typescript
// When user selects language from dropdown
onValueChange={(newLanguage) => {
  setLanguage(newLanguage);
  // URL automatically updates: /fr/... → /en/... or vice versa
  navigate(`/${newLanguage}${pathWithoutLanguage}`);
}}
```

## 📦 JSON Localization Files

Separate JSON files are provided in `frontend/public/locales/` for:
- Easy export/import with translation tools
- Third-party translator collaboration
- API endpoints for dynamic translation loading

### Example: Loading JSON files

```typescript
// Option 1: Fetch from public directory
const translations = await fetch('/locales/en.json').then(r => r.json());

// Option 2: Use with translation management tools
// Upload en.json and fr.json to Crowdin, Lokalise, etc.
```

## 🔧 Backend Localization

For backend error messages and notifications, use i18n middleware:

### Current Setup (Basic)

The backend currently serves content in French by default. For multi-language support on backend:

1. **Error Messages**: Implement language-based error factory
   ```typescript
   const errors = {
     en: { USER_NOT_FOUND: "User not found" },
     fr: { USER_NOT_FOUND: "Utilisateur non trouvé" }
   };
   ```

2. **Email Templates**: Create separate templates for each language
   ```
   templates/
   ├── emails/en/
   │   └── welcome.html
   └── emails/fr/
       └── welcome.html
   ```

3. **API Responses**: Include language param in requests
   ```
   GET /api/data?lang=en
   ```

## 🐛 Troubleshooting

### Language Not Changing

1. Check URL prefix: Should be `/en` or `/fr`
2. Verify `useLanguageRoute` hook is imported
3. Check browser console for errors
4. Clear localStorage and reload

### Missing Translations

1. Verify key exists in `translations.ts`
2. Check TypeScript compilation: `npm run build`
3. Use fallback: `t("missingKey") || "missingKey"`

### URL Not Updating

1. Ensure `navigate()` is called with full path including language prefix
2. Check `SimpleSettings.tsx` for proper URL construction
3. Verify React Router context is available

## 📱 Responsive Language Selection

Language selector appears in:
- **Settings page**: Préférences → Langue
- **URL bar**: Direct URL editing with `/en` or `/fr` prefix
- **Future**: Language selector in header/footer (can be added)

## 🔐 Security & Best Practices

1. **Sanitize translations**: Always escape user input in translations
2. **Store securely**: Language preference stored in secure context
3. **Default to safe**: Default to French if language is invalid
4. **Validate lang param**: Only accept 'en' or 'fr'

```typescript
const extractLanguageFromUrl = (): Language => {
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (firstSegment === "en" || firstSegment === "fr") {
    return firstSegment as Language;
  }
  return "fr"; // Safe default
};
```

## 📊 Statistics

- **Total Translation Keys**: 100+
- **Languages Supported**: 2 (English, French)
- **Coverage**: ~95% of UI strings
- **JSON Files**: 2 (en.json, fr.json)
- **Main Translation File**: translations.ts

## 🚀 Future Enhancements

1. **Add more languages**: Spanish, Arabic, etc.
   - Add to `useLanguageRoute` validation
   - Add to translations object
   - Add JSON files

2. **Dynamic translation loading**: Load from CDN or API
   ```typescript
   const translations = await fetch(`/api/translations/${language}`);
   ```

3. **Language auto-detection**: Detect from browser settings
   ```typescript
   const browserLang = navigator.language.split('-')[0];
   ```

4. **Pluralization**: Add support for plural forms
   ```typescript
   t("items", { count: 5 }); // "5 items"
   ```

5. **Missing translation reporter**: Log missing keys for translation teams

## 📞 Support

For questions or issues with localization:
1. Check this documentation
2. Review translation files in `frontend/src/locales/`
3. Check component usage in `SimpleSettings.tsx`
4. Verify routing in `App.tsx` and `useLanguageRoute.ts`

---

**Last Updated**: March 2026
**Maintained by**: HevGestion Development Team
