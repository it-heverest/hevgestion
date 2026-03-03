# Localization Implementation Examples

Practical examples and best practices for implementing localization in HevGestion.

## 🎯 Quick Start

### 1. Using Translations in a Component

```typescript
import { useTranslation } from "../hooks/useTranslation";

function MyDashboard() {
  const { t, language } = useTranslation();

  return (
    <div>
      <h1>{t("dashboard")}</h1>
      <p>{t("loading")}</p>
      <span>Current Language: {language}</span>
    </div>
  );
}
```

### 2. Changing Language

```typescript
import { useApp } from "../contexts/AppContext";
import { useNavigate, useLocation } from "react-router-dom";

function LanguageSwitcher() {
  const { language, setLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (newLang: "en" | "fr") => {
    setLanguage(newLang);
    
    // Update URL
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const pathWithoutLang = pathSegments[0] === "en" || pathSegments[0] === "fr"
      ? pathSegments.slice(1).join("/")
      : pathSegments.join("/");
    
    navigate(`/${newLang}/${pathWithoutLang}`, { replace: true });
  };

  return (
    <select value={language} onChange={(e) => handleLanguageChange(e.target.value as "en" | "fr")}>
      <option value="fr">Français</option>
      <option value="en">English</option>
    </select>
  );
}
```

## 📝 Common Patterns

### Pattern 1: Form Labels

```typescript
function LoginForm() {
  const { t } = useTranslation();

  return (
    <form>
      <label>{t("email")}</label>
      <input type="email" placeholder={t("email")} />
      
      <label>{t("password")}</label>
      <input type="password" placeholder={t("password")} />
      
      <button>{t("signIn")}</button>
    </form>
  );
}
```

### Pattern 2: Error Messages

```typescript
function DataUpload() {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const handleUpload = async (file) => {
    try {
      // Upload logic
    } catch (err) {
      setError(t("operationFailed"));
    }
  };

  return (
    <div>
      {error && <Alert>{error}</Alert>}
      <Button onClick={() => handleUpload(file)}>
        {t("upload")}
      </Button>
    </div>
  );
}
```

### Pattern 3: Conditional Text

```typescript
function UserGreeting() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <p>
      {t("welcomeUser")}, {user?.firstName || "User"}
    </p>
  );
}
```

### Pattern 4: Lists and Data Display

```typescript
function ClientList() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) return <p>{t("loading")}</p>;
  if (clients.length === 0) return <p>{t("noClientsFound")}</p>;

  return (
    <div>
      <h2>{t("clientManagement")}</h2>
      <button>{t("addClient")}</button>
      <ul>
        {clients.map(client => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Pattern 5: Notifications and Toasts

```typescript
function SaveSettings() {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const handleSave = async (data) => {
    try {
      await updateSettings(data);
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      setAlertType("error");
      setShowAlert(true);
    }
  };

  return (
    <div>
      {showAlert && (
        <Alert variant={alertType}>
          {alertType === "success" 
            ? t("operationCompleted")
            : t("operationFailed")
          }
        </Alert>
      )}
      <Button onClick={() => handleSave(formData)}>
        {t("save")}
      </Button>
    </div>
  );
}
```

## 🔀 Routing with Language

### Pattern 6: Language-Aware Navigation

```typescript
function Navigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp();

  const navigateTo = (path: string) => {
    // Ensure language prefix is included
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    navigate(`/${language}${cleanPath}`);
  };

  return (
    <nav>
      <button onClick={() => navigateTo("/web/user/dashboard")}>
        {t("dashboard")}
      </button>
      <button onClick={() => navigateTo("/web/user/clients")}>
        {t("clients")}
      </button>
    </nav>
  );
}
```

### Pattern 7: Dynamic Route Parameters

```typescript
function ExerciseDetail() {
  const { t } = useTranslation();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    fetchExercise(exerciseId);
  }, [exerciseId]);

  if (!exercise) return <p>{t("loading")}</p>;

  return (
    <div>
      <h1>{exercise.name}</h1>
      <p>{t("fiscalYear")}: {exercise.fiscalYear}</p>
      <p>{t("status")}: {t(exercise.status)}</p>
    </div>
  );
}
```

## 🎨 Component-Specific Examples

### Pattern 8: Settings Component with Language Switch

```typescript
function SettingsPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useApp();
  const { theme, setTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguageAndNavigate = (newLang: "en" | "fr") => {
    setLanguage(newLang);
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const otherSegments = pathSegments[0] === "en" || pathSegments[0] === "fr"
      ? pathSegments.slice(1)
      : pathSegments;
    
    navigate(`/${newLang}/${otherSegments.join("/")}`, { replace: true });
  };

  return (
    <div className="settings-page">
      <Card>
        <CardTitle>{t("profileSettings")}</CardTitle>
        <div>
          <Label>{t("language")}</Label>
          <Select 
            value={language}
            onValueChange={changeLanguageAndNavigate}
          >
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </Select>
        </div>
        
        <div>
          <Label>{t("theme")}</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectItem value="light">{t("lightMode")}</SelectItem>
            <SelectItem value="dark">{t("darkMode")}</SelectItem>
          </Select>
        </div>
      </Card>
    </div>
  );
}
```

### Pattern 9: Form Validation with Translations

```typescript
function ClientForm() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.name) {
      newErrors.name = t("requiredField");
    }

    if (!data.email || !isValidEmail(data.email)) {
      newErrors.email = t("invalidEmail");
    }

    if (data.password !== data.confirmPassword) {
      newErrors.password = t("passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (validateForm(formData)) {
        // Submit form
      }
    }}>
      <Input 
        placeholder={t("clientName")}
        error={errors.name}
      />
      {errors.name && <span className="error">{errors.name}</span>}
    </form>
  );
}
```

## 🌐 Advanced Patterns

### Pattern 10: Internationalized Dates

```typescript
function TransactionHistory() {
  const { t, language } = useTranslation();
  const [transactions, setTransactions] = useState([]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(
      language === "fr" ? "fr-FR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  };

  return (
    <table>
      <tbody>
        {transactions.map(t => (
          <tr key={t.id}>
            <td>{formatDate(new Date(t.timestamp))}</td>
            <td>{t.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Pattern 11: Pluralization Helper

```typescript
function reportItems(count: number, language: "en" | "fr") {
  const singular_en = "report";
  const plural_en = "reports";
  const singular_fr = "rapport";
  const plural_fr = "rapports";

  if (language === "en") {
    return count === 1 ? singular_en : plural_en;
  }
  return count === 1 ? singular_fr : plural_fr;
}

function ReportList() {
  const { language } = useTranslation();
  const [reports, setReports] = useState([]);

  return (
    <p>
      {reports.length} {reportItems(reports.length, language)}
    </p>
  );
}
```

### Pattern 12: Context-Aware Messages

```typescript
function ExerciseManager() {
  const { t } = useTranslation();
  const { selectedFolder } = useApp();

  const getStatusMessage = () => {
    switch (selectedFolder?.status) {
      case "DRAFT":
        return `${t("exerciseName")}: ${selectedFolder.name}`;
      case "ACTIVE":
        return `${t("active")}: ${selectedFolder.name}`;
      case "CLOSED":
        return `${t("closed")}: ${selectedFolder.name}`;
      default:
        return t("selectFolderDescription");
    }
  };

  return <div>{getStatusMessage()}</div>;
}
```

## ✅ Best Practices

### 1. Always Use Translation Keys

❌ Bad:
```typescript
return <h1>Dashboard</h1>;
```

✅ Good:
```typescript
const { t } = useTranslation();
return <h1>{t("dashboard")}</h1>;
```

### 2. Keep Keys Consistent

❌ Bad:
```typescript
t("save_btn")
t("saveText")
t("save-button")
```

✅ Good:
```typescript
t("save")  // Single, consistent key
```

### 3. Use Descriptive Key Names

❌ Bad:
```typescript
t("msg1")
t("err")
```

✅ Good:
```typescript
t("operationCompleted")
t("invalidEmail")
```

### 4. Handle Missing Keys Gracefully

❌ Bad:
```typescript
return <h1>{t("missingKey")}</h1>; // Shows key as is
```

✅ Good:
```typescript
return <h1>{t("missingKey") || "Loading..."}</h1>;
```

### 5. Keep Language Sync Before Navigation

✅ Good pattern:
```typescript
// Update language first
setLanguage(newLang);

// Then update URL with language prefix
navigate(`/${newLang}/currentPath`);
```

## 🧪 Testing Localization

```typescript
// __tests__/useTranslation.test.ts
import { renderHook } from "@testing-library/react-hooks";
import { useTranslation } from "../hooks/useTranslation";
import { AppProvider } from "../contexts/AppContext";

describe("useTranslation", () => {
  it("should return French translation by default", () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    expect(result.current.t("dashboard")).toBe("Tableau de bord");
  });

  it("should return English translation when language is English", () => {
    // Test setup with language set to 'en'
    expect(result.current.t("dashboard")).toBe("Dashboard");
  });
});
```

---

**Pro Tips:**
- Use IDE search/replace to find all instances of a translation key
- Test all routes with both `/en` and `/fr` prefixes
- Keep translations short to avoid UI overflow
- Use consistent terminology across all translations
- Review French translations for Quebec/Canadian conventions if needed
