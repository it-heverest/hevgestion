# Guide des Composants - FinanceERP Pro

## 📚 Table des Matières

1. [Architecture](#architecture)
2. [Composants d'Aide](#composants-daide)
3. [Composants de Navigation](#composants-de-navigation)
4. [Composants de Visualisation](#composants-de-visualisation)
5. [Composants de Collaboration](#composants-de-collaboration)
6. [États et Feedback](#états-et-feedback)
7. [Bonnes Pratiques](#bonnes-pratiques)

## Architecture

### Structure des Composants

```
┌─────────────────────────────────────┐
│           App.tsx (Root)            │
├─────────────────────────────────────┤
│  AuthProvider + AppProvider         │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼─────┐        ┌─────▼────┐
│  Login  │        │ AppContent│
└─────────┘        └─────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
    │  Sidebar  │  │ Header  │  │   Main    │
    └───────────┘  └─────────┘  └─────┬─────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                  ┌──────▼──────┐           ┌───────▼────────┐
                  │  Dashboard  │           │  Other Views   │
                  └─────────────┘           └────────────────┘
```

## Composants d'Aide

### HelpSystem.tsx

#### HelpTooltip

Affiche des infobulles contextuelles pour expliquer les fonctionnalités.

**Props :**
```typescript
interface HelpTooltipProps {
  content: string;      // Contenu de l'infobulle
  title?: string;       // Titre optionnel
  children: ReactNode;  // Élément déclencheur
}
```

**Exemple :**
```tsx
<HelpTooltip 
  title="Solde du compte"
  content="Le solde représente la différence entre le débit et le crédit"
>
  <Badge>125,000 FCFA</Badge>
</HelpTooltip>
```

#### HelpCenter

Centre d'aide complet avec recherche et articles.

**Props :**
```typescript
interface HelpCenterProps {
  context?: string;  // Contexte actuel pour filtrer les articles pertinents
}
```

**Structure des articles :**
```typescript
interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
}
```

**Exemple :**
```tsx
<HelpCenter context="import-balance" />
```

### OnboardingGuide.tsx

Guide interactif pour les nouveaux utilisateurs.

**Props :**
```typescript
interface OnboardingGuideProps {
  onComplete: () => void;           // Callback de complétion
  onNavigate?: (view: string) => void;  // Navigation optionnelle
}
```

**Structure d'une étape :**
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  tips: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Exemple :**
```tsx
<OnboardingGuide
  onComplete={() => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  }}
  onNavigate={(view) => setActiveView(view)}
/>
```

## Composants de Navigation

### GlobalSearch.tsx

Recherche globale type Command Palette.

**Props :**
```typescript
interface GlobalSearchProps {
  onNavigate: (view: string) => void;
  companyName?: string;
  currentExercise?: number;
}
```

**Raccourci :** `⌘K` ou `Ctrl+K`

**Exemple :**
```tsx
<GlobalSearch 
  onNavigate={setActiveView}
  companyName="ACME Corp"
  currentExercise={2025}
/>
```

### KeyboardShortcuts.tsx

Documentation et gestion des raccourcis clavier.

**Props :**
```typescript
interface KeyboardShortcutsProps {
  onNavigate?: (view: string) => void;
}
```

**Raccourcis par défaut :**
- Navigation : `⌘D`, `⌘I`, `⌘R`, `⌘H`
- Actions : `⌘S`, `⌘E`, `⌘N`, `⌘P`
- Édition : `⌘Z`, `⌘Y`, `⌘C`, `⌘V`, `⌘X`

**Exemple :**
```tsx
<KeyboardShortcuts onNavigate={setActiveView} />
```

## Composants de Visualisation

### AnalyticsDashboard.tsx

Tableau de bord avec graphiques et métriques.

**Props :**
```typescript
interface AnalyticsDashboardProps {
  companyName: string;
  currentExercise: number;
}
```

**Composants intégrés :**
- KPI Cards (4 métriques principales)
- Line Chart (Performance financière)
- Pie Chart (Répartition des revenus)
- Activités récentes
- Échéances fiscales
- Conformité SYSCOHADA

**Exemple :**
```tsx
<AnalyticsDashboard 
  companyName="ACME Corp"
  currentExercise={2025}
/>
```

### StatusOverview.tsx

Vue d'ensemble de l'état du dossier.

**Props :**
```typescript
interface StatusOverviewProps {
  companyName: string;
  currentExercise: number;
}
```

**Métriques affichées :**
- Comptes traités
- Rapports générés
- Conformité
- Performance

**États possibles :**
- `success` : Vert, complété
- `warning` : Orange, attention requise
- `error` : Rouge, erreur critique
- `pending` : Bleu, en cours

**Exemple :**
```tsx
<StatusOverview 
  companyName="ACME Corp"
  currentExercise={2025}
/>
```

## Composants de Collaboration

### CollaborationPanel.tsx

Panneau de collaboration avec commentaires et équipe.

**Props :**
```typescript
interface CollaborationPanelProps {
  context?: string;   // Contexte (ex: 'balance-2025')
  entityId?: string;  // ID de l'entité
}
```

**Structure d'un commentaire :**
```typescript
interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}
```

**Exemple :**
```tsx
<CollaborationPanel 
  context="balance"
  entityId="2025-Q1"
/>
```

### NotificationCenter.tsx

Centre de notifications avec badge et historique.

**Props :** Aucune prop requise

**Structure d'une notification :**
```typescript
interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'deadline';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
```

**Exemple :**
```tsx
<NotificationCenter />
```

## États et Feedback

### EmptyState.tsx

Composants pour afficher des états vides élégants.

**Props du composant générique :**
```typescript
interface EmptyStateProps {
  icon?: 'file' | 'folder' | 'upload' | 'document' | 'calendar' | 'search' | 'inbox';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
```

**Composants pré-configurés :**

#### NoBalanceState
```tsx
<NoBalanceState
  onImport={() => navigate('import')}
  onUseTemplate={() => navigate('templates')}
/>
```

#### NoReportsState
```tsx
<NoReportsState
  onGenerate={() => navigate('reports')}
/>
```

#### NoExerciseState
```tsx
<NoExerciseState
  onCreate={() => navigate('exercise')}
/>
```

#### NoSearchResultsState
```tsx
<NoSearchResultsState />
```

#### NoDataState
```tsx
<NoDataState message="Aucune donnée pour cette période" />
```

## Bonnes Pratiques

### 1. Composition des Composants

**✅ Bon :**
```tsx
function DashboardPage() {
  return (
    <div>
      <StatusOverview />
      <AnalyticsDashboard />
      <CollaborationPanel />
    </div>
  );
}
```

**❌ Mauvais :**
```tsx
function DashboardPage() {
  // Tout le code en un seul composant géant
  return (
    <div>
      {/* 500 lignes de code... */}
    </div>
  );
}
```

### 2. Gestion de l'État

**✅ Bon :**
```tsx
function MyComponent() {
  const { user } = useAuth();
  const { selectedExercise } = useApp();
  
  // État local uniquement si nécessaire
  const [localState, setLocalState] = useState();
  
  return <div>...</div>;
}
```

**❌ Mauvais :**
```tsx
function MyComponent() {
  // Tout dans l'état local
  const [user, setUser] = useState();
  const [exercise, setExercise] = useState();
  // Dupliquer l'état global...
  
  return <div>...</div>;
}
```

### 3. Props et Types

**✅ Bon :**
```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
  optional?: boolean;
}

function MyComponent({ title, onAction, optional = false }: MyComponentProps) {
  return <div>...</div>;
}
```

**❌ Mauvais :**
```tsx
function MyComponent(props: any) {
  return <div>...</div>;
}
```

### 4. Accessibilité

**✅ Bon :**
```tsx
<button 
  onClick={handleClick}
  aria-label="Importer une balance"
  disabled={isLoading}
>
  <Upload className="h-4 w-4" />
  <span>Importer</span>
</button>
```

**❌ Mauvais :**
```tsx
<div onClick={handleClick}>
  <Upload className="h-4 w-4" />
</div>
```

### 5. Performance

**✅ Bon :**
```tsx
const MemoizedComponent = memo(function HeavyComponent({ data }) {
  return <ExpensiveRender data={data} />;
});

function Parent() {
  const data = useMemo(() => processData(), [dependency]);
  return <MemoizedComponent data={data} />;
}
```

**❌ Mauvais :**
```tsx
function Parent() {
  const data = processData(); // Recalculé à chaque render
  return <HeavyComponent data={data} />;
}
```

### 6. Gestion des Erreurs

**✅ Bon :**
```tsx
function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      setError(null);
      await performAction();
    } catch (err) {
      setError(err.message);
      toast.error('Une erreur est survenue');
    }
  };
  
  return (
    <div>
      {error && <Alert variant="destructive">{error}</Alert>}
      <Button onClick={handleAction}>Action</Button>
    </div>
  );
}
```

**❌ Mauvais :**
```tsx
function MyComponent() {
  const handleAction = async () => {
    await performAction(); // Pas de gestion d'erreur
  };
  
  return <Button onClick={handleAction}>Action</Button>;
}
```

### 7. Responsive Design

**✅ Bon :**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

**❌ Mauvais :**
```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Cassé sur mobile */}
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

### 8. Séparation des Préoccupations

**✅ Bon :**
```tsx
// hooks/useBalanceData.ts
export function useBalanceData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    const result = await api.getBalance();
    setData(result);
    setLoading(false);
  };
  
  return { data, loading, fetchData };
}

// components/BalanceView.tsx
function BalanceView() {
  const { data, loading, fetchData } = useBalanceData();
  
  return <div>...</div>;
}
```

**❌ Mauvais :**
```tsx
function BalanceView() {
  // Tout mélangé
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    const result = await api.getBalance();
    setData(result);
    setLoading(false);
  };
  
  return <div>...</div>;
}
```

## 🎨 Conventions de Style

### Nommage
- **Composants** : PascalCase (`MyComponent.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useMyHook.ts`)
- **Utils** : camelCase (`formatDate.ts`)
- **Constants** : UPPER_SNAKE_CASE (`API_URL`)

### Organisation des Imports
```tsx
// 1. React et bibliothèques externes
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// 2. Composants UI
import { Button } from './ui/button';
import { Card } from './ui/card';

// 3. Composants locaux
import { MyComponent } from './MyComponent';

// 4. Hooks et utils
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/date';

// 5. Types
import type { User } from '../types';

// 6. Styles et assets
import './styles.css';
```

### Structure d'un Composant
```tsx
// 1. Imports

// 2. Types et interfaces
interface MyComponentProps {
  title: string;
}

// 3. Constantes
const DEFAULT_VALUE = 'value';

// 4. Composant
export function MyComponent({ title }: MyComponentProps) {
  // 4.1 Hooks
  const [state, setState] = useState();
  
  // 4.2 Computed values
  const computed = useMemo(() => {}, []);
  
  // 4.3 Effects
  useEffect(() => {}, []);
  
  // 4.4 Handlers
  const handleClick = () => {};
  
  // 4.5 Render
  return <div>...</div>;
}
```

## 📝 Documentation des Composants

Chaque composant doit avoir :
1. **Commentaire JSDoc** avec description
2. **Props TypeScript** bien typées
3. **Exemple d'utilisation** en commentaire
4. **Gestion des erreurs** appropriée

```tsx
/**
 * Composant pour afficher un tableau de bord analytique
 * 
 * @example
 * ```tsx
 * <AnalyticsDashboard 
 *   companyName="ACME Corp"
 *   currentExercise={2025}
 * />
 * ```
 */
export function AnalyticsDashboard({ 
  companyName, 
  currentExercise 
}: AnalyticsDashboardProps) {
  // Implementation
}
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Mainteneur** : Équipe NashSoft
