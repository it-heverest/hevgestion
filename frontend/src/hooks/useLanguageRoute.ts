// hooks/useLanguageRoute.ts
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useCallback, useEffect } from "react";

type Language = "en" | "fr";

/**
 * Hook to manage language routing with URL prefixes
 * Supports /en/* and /fr/* URL prefixes
 * Default language is French (/fr)
 */
export function useLanguageRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useApp();

  /**
   * Extract language from URL
   * /en/* -> "en"
   * /fr/* -> "fr"
   * default -> "fr"
   */
  const extractLanguageFromUrl = useCallback((): Language => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const firstSegment = pathSegments[0];

    if (firstSegment === "en" || firstSegment === "fr") {
      return firstSegment as Language;
    }
    return "fr"; // Default to French
  }, [location.pathname]);

  /**
   * Initialize language from URL on mount/URL change
   */
  useEffect(() => {
    const urlLanguage = extractLanguageFromUrl();
    if (urlLanguage !== language) {
      setLanguage(urlLanguage);
    }
  }, [extractLanguageFromUrl, language, setLanguage]);

  /**
   * Change language by adding/updating URL prefix
   */
  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      const currentPathSegments = location.pathname.split("/").filter(Boolean);
      let newPath: string;

      // Remove existing language prefix if present
      const pathWithoutLanguage = currentPathSegments[0] === "en" ||
        currentPathSegments[0] === "fr"
        ? currentPathSegments.slice(1).join("/")
        : currentPathSegments.join("/");

      // Add new language prefix
      newPath = `/${newLanguage}${pathWithoutLanguage ? "/" + pathWithoutLanguage : ""}`;

      setLanguage(newLanguage);
      navigate(newPath + location.search + location.hash);
    },
    [location.pathname, location.search, location.hash, navigate, setLanguage]
  );

  /**
   * Get the current path without language prefix
   */
  const getPathWithoutLanguage = useCallback((): string => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments[0] === "en" || pathSegments[0] === "fr") {
      return "/" + pathSegments.slice(1).join("/");
    }
    return location.pathname;
  }, [location.pathname]);

  return {
    language,
    changeLanguage,
    getPathWithoutLanguage,
    extractLanguageFromUrl,
  };
}
