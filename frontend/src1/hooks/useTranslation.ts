// hooks/useTranslation.ts
import { useApp } from "../contexts/AppContext";
import { translations, TranslationKeys } from "../locales/translations";

export function useTranslation() {
  const { language } = useApp();

  const t = (key: keyof TranslationKeys): string => {
    const currentTranslations = translations[language] || translations.fr;
    return currentTranslations[key] || key;
  };

  return { t, language };
}