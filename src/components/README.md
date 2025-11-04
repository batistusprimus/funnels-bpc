# Composants

## Command Palette

Palette de commandes avec raccourcis clavier (Cmd+K) et système undo/redo.

### Installation

La palette nécessite `cmdk` et `framer-motion` (déjà installés).

### Utilisation

\`\`\`tsx
import { CommandPalette } from '@/components/command-palette';
import { useUndoRedo } from '@/lib/hooks/use-undo-redo';

function MyApp() {
  // Utiliser le hook undo/redo
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);

  const handleCommand = (command: string) => {
    switch (command) {
      case 'save':
        // Sauvegarder
        break;
      case 'go-home':
        router.push('/');
        break;
      // ... autres commandes
    }
  };

  return (
    <>
      <CommandPalette
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCommand={handleCommand}
      />
      
      {/* Votre application */}
    </>
  );
}
\`\`\`

### Raccourcis clavier

- `Cmd+K` / `Ctrl+K` - Ouvrir/fermer la palette
- `Cmd+Z` / `Ctrl+Z` - Annuler (undo)
- `Cmd+Shift+Z` / `Ctrl+Y` - Refaire (redo)
- `Cmd+S` / `Ctrl+S` - Sauvegarder (via palette)
- `Cmd+N` / `Ctrl+N` - Nouveau (via palette)
- `Cmd+P` / `Ctrl+P` - Prévisualiser (via palette)
- `ESC` - Fermer la palette

### Hook useUndoRedo

Système de gestion d'historique avec undo/redo.

\`\`\`tsx
import { useUndoRedo } from '@/lib/hooks/use-undo-redo';

function Editor() {
  const { state, set, undo, redo, canUndo, canRedo, reset } = useUndoRedo({
    content: 'Initial content',
  });

  // Modifier le state (ajoute à l'historique)
  const updateContent = (newContent: string) => {
    set({ ...state, content: newContent });
  };

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Annuler</button>
      <button onClick={redo} disabled={!canRedo}>Refaire</button>
      
      <textarea
        value={state.content}
        onChange={(e) => updateContent(e.target.value)}
      />
    </div>
  );
}
\`\`\`

### Intégration dans le builder

Voir `src/components/builder-with-undo.tsx` pour un exemple complet d'intégration.

Pour intégrer dans le builder existant (`src/app/(dashboard)/funnels/[id]/builder/page.tsx`):

1. Remplacer `useState` par `useUndoRedo`:
\`\`\`tsx
// Avant
const [funnel, setFunnel] = useState<Funnel | null>(null);

// Après
const { state: funnel, set: setFunnel, undo, redo, canUndo, canRedo } = useUndoRedo<Funnel | null>(null);
\`\`\`

2. Ajouter la CommandPalette au composant:
\`\`\`tsx
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
\`\`\`

3. Implémenter le handler de commandes:
\`\`\`tsx
const handleCommand = (command: string) => {
  switch (command) {
    case 'save':
      saveFunnel();
      break;
    case 'preview':
      window.open(\`/f/\${funnel.slug}\`, '_blank');
      break;
    // ... autres commandes
  }
};
\`\`\`

## Composants Mobile

Voir `src/components/ui/mobile/README.md` pour la documentation des composants mobiles.

