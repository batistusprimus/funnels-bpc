'use client';

/**
 * Exemple d'intégration du système undo/redo avec la Command Palette
 * 
 * Ce composant montre comment utiliser:
 * - useUndoRedo pour gérer l'historique des modifications
 * - CommandPalette pour les raccourcis clavier
 * 
 * Pour l'utiliser dans le builder existant:
 * 1. Remplacer useState par useUndoRedo pour le state du funnel
 * 2. Utiliser .set() au lieu de setState
 * 3. Ajouter le composant CommandPalette
 */

import { useUndoRedo } from '@/lib/hooks/use-undo-redo';
import { CommandPalette } from '@/components/command-palette';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import type { Funnel } from '@/types';

interface BuilderWithUndoProps {
  initialFunnel: Funnel;
  onSave: (funnel: Funnel) => void;
  onNavigate: (route: string) => void;
}

export function BuilderWithUndo({ initialFunnel, onSave, onNavigate }: BuilderWithUndoProps) {
  // Remplacer useState par useUndoRedo
  const {
    state: funnel,
    set: setFunnel,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<Funnel>(initialFunnel);

  // Handler pour les commandes de la palette
  const handleCommand = (command: string) => {
    switch (command) {
      case 'save':
        onSave(funnel);
        break;
      case 'new-funnel':
        onNavigate('/funnels/new');
        break;
      case 'go-home':
        onNavigate('/');
        break;
      case 'go-funnels':
        onNavigate('/funnels');
        break;
      case 'go-leads':
        onNavigate('/leads');
        break;
      case 'go-analytics':
        onNavigate(`/funnels/${funnel.id}/analytics`);
        break;
      case 'preview':
        window.open(`/f/${funnel.slug}`, '_blank');
        break;
      // Ajoutez d'autres commandes selon vos besoins
      default:
        console.log('Commande non gérée:', command);
    }
  };

  // Exemple de modification avec historique
  const updateFunnelName = (name: string) => {
    setFunnel({ ...funnel, name });
  };

  return (
    <>
      {/* Command Palette avec Cmd+K */}
      <CommandPalette
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCommand={handleCommand}
      />

      {/* UI avec boutons Undo/Redo */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Annuler (⌘Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Refaire (⌘⇧Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="ml-4 text-sm text-gray-600">
          Utilisez <kbd className="px-2 py-1 bg-gray-100 rounded">⌘K</kbd> pour ouvrir la palette de commandes
        </div>
      </div>

      {/* Votre UI de builder ici */}
      <div className="mt-6">
        {/* ... */}
      </div>
    </>
  );
}

