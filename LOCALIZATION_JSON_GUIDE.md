# Localization JSON Files - Usage Guide

This document explains how to use and manage the JSON localization files in the `frontend/public/locales/` directory.

## 📁 File Structure

```
frontend/public/locales/
├── en.json   (English - 276 keys)
└── fr.json   (French - 276 keys)
```

## 🎯 Quick Reference

### English (en.json)

Main language file with English translations organized by category:

```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "clients": "Clients",
    ...
  },
  "common": {
    "loading": "Loading...",
    ...
  },
  ...
}
```

### French (fr.json)

Main language file with French translations (default language):

```json
{
  "navigation": {
    "dashboard": "Tableau de bord",
    "clients": "Clients",
    ...
  },
  "common": {
    "loading": "Chargement...",
    ...
  },
  ...
}
```

## 📂 Categories

Both files contain the following categories:

1. **navigation** - App navigation labels
2. **common** - Common UI elements
3. **auth** - Authentication labels
4. **client** - Client management labels
5. **exercise** - Exercise/Folder management labels
6. **balance** - Balance processing labels
7. **dsf** - DSF generation and processing labels
8. **reports** - Report names and labels
9. **settings** - Settings page labels
10. **messages** - Success/error/info messages
11. **validation** - Form validation messages
12. **workflow** - Workflow selection labels
13. **ui** - General UI labels

## 🔄 Syncing Between Files

Keep er.json and fr.json synchronized:

### Checking for Synchronized Keys

Use this script to verify all keys exist in both files:

```bash
# Terminal command to check key count
jq 'keys | length' frontend/public/locales/en.json
jq 'keys | length' frontend/public/locales/fr.json
```

### Using with Translation Tools

1. **Crowdin**:
   - Upload en.json as source
   - Set up fr.json as target
   - Manage translations through Crowdin dashboard

2. **Lokalise**:
   - Import en.json to create base
   - Import fr.json as translation
   - Update translations through editor

3. **POEditor**:
   - Create project
   - Upload en.json
   - Upload fr.json
   - Invite translators

## 💡 Adding New Keys

### Manual Addition

Edit the JSON files and add new keys:

```json
{
  "existingCategory": {
    "existingKey": "value",
    "newKey": "New value"  // Add here
  }
}
```

### Automated Update Script

Create `scripts/update-locales.js`:

```javascript
const fs = require('fs');
const path = require('path');

const localesDir = 'frontend/public/locales';
const localeFiles = ['en.json', 'fr.json'];

// Read source (English)
const enContent = JSON.parse(
  fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8')
);

// Ensure all locales have same keys
localeFiles.forEach(file => {
  const filePath = path.join(localesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Recursively ensure all keys exist
  function ensureKeys(source, target) {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object') {
        target[key] = target[key] || {};
        ensureKeys(source[key], target[key]);
      } else if (!(key in target)) {
        target[key] = `[MISSING: ${file}] ${key}`;
      }
    });
  }

  ensureKeys(enContent, content);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
});

console.log('✅ Locales synchronized');
```

Run with: `node scripts/update-locales.js`

## 🔗 API Endpoints for Dynamic Locales

Add these endpoints to backend for serving locales:

### GET /api/locales/:lang

Returns localization file for specified language:

```bash
curl http://localhost:5000/api/locales/en
curl http://localhost:5000/api/locales/fr
```

### Backend Implementation (Express.js)

```typescript
// routes/locales.route.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/locales/:lang', (req, res) => {
  const { lang } = req.params;
  
  // Validate language
  if (!['en', 'fr'].includes(lang)) {
    return res.status(400).json({
      error: 'Invalid language code',
      supported: ['en', 'fr']
    });
  }

  try {
    const filePath = path.join(
      __dirname,
      `../../frontend/public/locales/${lang}.json`
    );
    const content = fs.readFileSync(filePath, 'utf-8');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load localization file' });
  }
});

export default router;
```

### Frontend Implementation

Load locales from API instead of static files:

```typescript
// hooks/useRemoteLocales.ts
import { useEffect, useState } from 'react';

export function useRemoteLocales(language: 'en' | 'fr') {
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const response = await fetch(`/api/locales/${language}`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to load locales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocales();
  }, [language]);

  return { translations, loading };
}
```

## 📋 Translation Checklist

Before deploying new strings:

- [ ] Added key to TypeScript interface (`translations.ts`)
- [ ] Added English translation in `translations.ts`
- [ ] Added French translation in `translations.ts`
- [ ] Added to `public/locales/en.json`
- [ ] Added to `public/locales/fr.json`
- [ ] Verified in browser at different language prefixes (`/en` and `/fr`)
- [ ] No console errors or missing translation warnings
- [ ] Tested with long text to ensure UI doesn't break

## 🎨 Formatting Guidelines

### English Conventions

- Use clear, concise language
- Use title case for headings
- Use sentence case for descriptions
- Use active voice
- Example: "Upload your balance file"

### French Conventions

- Use proper French capitalization (first word only)
- Use accents correctly
- Use formal "vous" unless specific context
- Example: "Téléversez votre fichier de balance"

## ✅ Validation

Ensure JSON files are valid:

```bash
# Test JSON validity
node -e "JSON.parse(require('fs').readFileSync('frontend/public/locales/en.json'))"

# Pretty print
jq . frontend/public/locales/en.json > temp.json && mv temp.json frontend/public/locales/en.json
```

## 🌐 Deployment

When deploying new translations:

1. Update `translations.ts` in frontend
2. Update JSON files in `public/locales/`
3. Run tests: `npm test`
4. Build frontend: `npm run build`
5. Deploy `dist/` folder
6. Verify translations at both `/en` and `/fr` routes

## 📊 Translation Statistics

| Language | Keys | Categories | Last Updated |
|----------|------|-----------|--------------|
| English  | 276+ | 13        | 2026-03-03   |
| French   | 276+ | 13        | 2026-03-03   |

## 🔗 Related Files

- [Frontend translations.ts](../frontend/src/locales/translations.ts)
- [useTranslation hook](../frontend/src/hooks/useTranslation.ts)
- [useLanguageRoute hook](../frontend/src/hooks/useLanguageRoute.ts)
- [SimpleSettings component](../frontend/src/components/SimpleSettings.tsx)
- [Main LOCALIZATION.md](./LOCALIZATION.md)

---

**Notes:**
- Always keep source English file (en.json) as reference
- French is the default language in this application
- Keys are case-sensitive
- Nested objects only go 2 levels deep (category → key)
