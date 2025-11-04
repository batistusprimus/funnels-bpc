# Composants Mobile

Composants UI optimisés pour mobile avec animations fluides via Framer Motion.

## BottomSheet

Panneau inférieur avec gestion du swipe et snap points.

### Utilisation

\`\`\`tsx
import { BottomSheet } from '@/components/ui/mobile';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Mon panneau"
      snapPoints={[0.3, 0.6, 0.9]} // 30%, 60%, 90% de hauteur
    >
      <p>Contenu du panneau</p>
    </BottomSheet>
  );
}
\`\`\`

### Props

- `isOpen` (boolean) - État d'ouverture
- `onClose` (function) - Callback de fermeture
- `children` (ReactNode) - Contenu
- `title` (string, optionnel) - Titre du panneau
- `snapPoints` (number[], optionnel) - Points d'accroche (défaut: [0.4, 0.9])

## SwipeDrawer

Tiroir latéral avec gestion du swipe.

### Utilisation

\`\`\`tsx
import { SwipeDrawer } from '@/components/ui/mobile';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SwipeDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Menu"
      position="right" // ou "left"
    >
      <nav>
        {/* Contenu du menu */}
      </nav>
    </SwipeDrawer>
  );
}
\`\`\`

### Props

- `isOpen` (boolean) - État d'ouverture
- `onClose` (function) - Callback de fermeture
- `children` (ReactNode) - Contenu
- `title` (string, optionnel) - Titre du tiroir
- `position` ('left' | 'right', optionnel) - Position (défaut: 'right')

## PullToRefresh

Gestion du pull-to-refresh avec indicateur visuel.

### Utilisation

\`\`\`tsx
import { PullToRefresh } from '@/components/ui/mobile';

function MyComponent() {
  const handleRefresh = async () => {
    // Logique de rafraîchissement
    await fetchData();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} threshold={80}>
      <div>
        {/* Contenu scrollable */}
      </div>
    </PullToRefresh>
  );
}
\`\`\`

### Props

- `onRefresh` (function) - Fonction async appelée lors du refresh
- `children` (ReactNode) - Contenu
- `threshold` (number, optionnel) - Distance de déclenchement en pixels (défaut: 80)

## Exemple d'intégration dans le builder

\`\`\`tsx
import { BottomSheet, SwipeDrawer, PullToRefresh } from '@/components/ui/mobile';
import { useState } from 'react';

function MobileBuilder() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <PullToRefresh onRefresh={async () => {
        // Recharger les données
      }}>
        <div className="p-4">
          {/* Contenu principal */}
          <button onClick={() => setSettingsOpen(true)}>
            Ouvrir paramètres
          </button>
          <button onClick={() => setMenuOpen(true)}>
            Ouvrir menu
          </button>
        </div>
      </PullToRefresh>

      {/* Paramètres en bottom sheet */}
      <BottomSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Paramètres"
        snapPoints={[0.5, 0.9]}
      >
        {/* Formulaire de paramètres */}
      </BottomSheet>

      {/* Menu en drawer */}
      <SwipeDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Navigation"
        position="left"
      >
        {/* Menu de navigation */}
      </SwipeDrawer>
    </>
  );
}
\`\`\`

