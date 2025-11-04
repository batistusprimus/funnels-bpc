# 📱 Fonctionnalités Mobile UI & Command Palette

## ✅ Implémentations complétées

### 1. Composants Mobile (`src/components/ui/mobile/`)

#### BottomSheet
- ✅ Panneau inférieur avec animations fluides
- ✅ Gestion du swipe vers le bas pour fermer
- ✅ Snap points configurables (ex: 30%, 60%, 90%)
- ✅ Backdrop avec fermeture au clic
- ✅ Handle visuel pour indiquer la draggabilité
- ✅ Support dark mode

**Fichier:** `src/components/ui/mobile/bottom-sheet.tsx`

#### SwipeDrawer
- ✅ Tiroir latéral (gauche ou droite)
- ✅ Gestion du swipe horizontal pour fermer
- ✅ Animations fluides avec spring physics
- ✅ Header avec titre et bouton fermer
- ✅ Support dark mode

**Fichier:** `src/components/ui/mobile/swipe-drawer.tsx`

#### PullToRefresh
- ✅ Pull-to-refresh natif
- ✅ Indicateur visuel rotatif
- ✅ Animation fluide du refresh
- ✅ Threshold configurable
- ✅ Support des fonctions async

**Fichier:** `src/components/ui/mobile/pull-to-refresh.tsx`

### 2. Command Palette (`src/components/command-palette.tsx`)

#### Fonctionnalités
- ✅ Ouverture avec `Cmd+K` / `Ctrl+K`
- ✅ Interface moderne avec animations
- ✅ Recherche fuzzy
- ✅ Groupes de commandes (Édition, Navigation, Actions)
- ✅ Affichage des raccourcis clavier
- ✅ Support dark mode
- ✅ Intégration undo/redo

#### Raccourcis intégrés
- `⌘K` - Ouvrir la palette
- `⌘Z` - Annuler (undo)
- `⌘⇧Z` - Refaire (redo)
- `⌘S` - Sauvegarder
- `⌘N` - Nouveau funnel
- `⌘P` - Prévisualiser
- `ESC` - Fermer la palette

### 3. Système Undo/Redo (`src/lib/hooks/use-undo-redo.ts`)

#### Hook useUndoRedo
- ✅ Gestion de l'historique des modifications
- ✅ Stack past/present/future
- ✅ Méthodes: `undo()`, `redo()`, `set()`, `reset()`
- ✅ État: `canUndo`, `canRedo`
- ✅ TypeScript générique pour tous types d'état

## 📦 Dépendances installées

```json
{
  "cmdk": "^latest",           // Command palette
  "framer-motion": "^12.23.24" // Animations (déjà présent)
}
```

## 🎨 Structure des fichiers

```
bpc-funnels/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── mobile/
│   │   │       ├── bottom-sheet.tsx      ✅ Nouveau
│   │   │       ├── swipe-drawer.tsx      ✅ Nouveau
│   │   │       ├── pull-to-refresh.tsx   ✅ Nouveau
│   │   │       ├── index.ts              ✅ Nouveau
│   │   │       └── README.md             ✅ Documentation
│   │   ├── command-palette.tsx           ✅ Nouveau
│   │   ├── builder-with-undo.tsx         ✅ Exemple d'intégration
│   │   └── README.md                     ✅ Documentation
│   ├── lib/
│   │   └── hooks/
│   │       └── use-undo-redo.ts          ✅ Nouveau
│   └── app/
│       └── example-mobile-ui/
│           └── page.tsx                  ✅ Page de démonstration
└── MOBILE_UI_FEATURES.md                 ✅ Ce fichier
```

## 🚀 Utilisation

### Composants Mobile

```tsx
import { BottomSheet, SwipeDrawer, PullToRefresh } from '@/components/ui/mobile';

function MyComponent() {
  return (
    <>
      <PullToRefresh onRefresh={async () => { /* refresh */ }}>
        {/* Contenu */}
      </PullToRefresh>

      <BottomSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        snapPoints={[0.4, 0.9]}
      >
        {/* Contenu */}
      </BottomSheet>

      <SwipeDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        position="right"
      >
        {/* Contenu */}
      </SwipeDrawer>
    </>
  );
}
```

### Command Palette + Undo/Redo

```tsx
import { CommandPalette } from '@/components/command-palette';
import { useUndoRedo } from '@/lib/hooks/use-undo-redo';

function Editor() {
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);

  return (
    <>
      <CommandPalette
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCommand={(cmd) => {
          // Gérer les commandes
        }}
      />
      {/* Votre UI */}
    </>
  );
}
```

## 🧪 Page de démonstration

Une page complète de démonstration est disponible:

**URL:** `/example-mobile-ui`

Cette page montre:
- ✅ Tous les composants mobiles en action
- ✅ Command palette avec raccourcis
- ✅ Système undo/redo fonctionnel
- ✅ Pull-to-refresh avec compteur
- ✅ Intégration complète

## 🔧 Intégration dans le builder existant

Pour intégrer dans `src/app/(dashboard)/funnels/[id]/builder/page.tsx`:

### Étape 1: Importer les composants

```tsx
import { CommandPalette } from '@/components/command-palette';
import { useUndoRedo } from '@/lib/hooks/use-undo-redo';
```

### Étape 2: Remplacer useState par useUndoRedo

```tsx
// ❌ Avant
const [funnel, setFunnel] = useState<Funnel | null>(null);

// ✅ Après
const { 
  state: funnel, 
  set: setFunnel, 
  undo, 
  redo, 
  canUndo, 
  canRedo 
} = useUndoRedo<Funnel | null>(null);
```

### Étape 3: Ajouter la CommandPalette

```tsx
return (
  <>
    <CommandPalette
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      onCommand={handleCommand}
    />
    {/* Reste du builder */}
  </>
);
```

### Étape 4: Ajouter les boutons Undo/Redo (optionnel)

```tsx
import { Undo2, Redo2 } from 'lucide-react';

<div className="flex gap-2">
  <Button onClick={undo} disabled={!canUndo} variant="outline" size="sm">
    <Undo2 className="w-4 h-4" />
  </Button>
  <Button onClick={redo} disabled={!canRedo} variant="outline" size="sm">
    <Redo2 className="w-4 h-4" />
  </Button>
</div>
```

## 📚 Documentation

- **Composants Mobile:** `src/components/ui/mobile/README.md`
- **Command Palette & Undo/Redo:** `src/components/README.md`
- **Exemple d'intégration:** `src/components/builder-with-undo.tsx`

## ✨ Fonctionnalités clés

### Expérience mobile native
- Gestes tactiles naturels (swipe, pull)
- Animations fluides et performantes
- Snap points pour le bottom sheet
- Threshold configurables

### Command Palette moderne
- Recherche instantanée
- Groupes de commandes
- Raccourcis clavier visuels
- Navigation rapide

### Système Undo/Redo robuste
- Stack illimité
- État persistant
- Type-safe avec TypeScript
- Compatible avec tout type de données

## 🎯 Prochaines étapes suggérées

1. ✅ Tester la page de démonstration `/example-mobile-ui`
2. ⏭️ Intégrer la command palette dans le builder
3. ⏭️ Ajouter le système undo/redo au builder
4. ⏭️ Utiliser les composants mobiles dans les vues appropriées
5. ⏭️ Personnaliser les commandes selon vos besoins

## 💡 Notes

- Tous les composants supportent le dark mode
- Les animations utilisent Framer Motion pour des performances optimales
- Le code suit les principes KISS (Keep It Simple, Stupid)
- TypeScript pour une sécurité de type complète
- Compatible avec Next.js App Router

