'use client';

/**
 * Page de démonstration des composants mobiles et de la command palette
 * 
 * Accessible via /example-mobile-ui
 * 
 * Cette page montre:
 * - BottomSheet avec snap points
 * - SwipeDrawer gauche et droite
 * - PullToRefresh
 * - Command Palette (Cmd+K)
 * - Système undo/redo
 */

import { useState } from 'react';
import { BottomSheet, SwipeDrawer, PullToRefresh } from '@/components/ui/mobile';
import { CommandPalette } from '@/components/command-palette';
import { useUndoRedo } from '@/lib/hooks/use-undo-redo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Undo2, Redo2, Menu, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AppState {
  title: string;
  content: string;
}

export default function ExampleMobileUIPage() {
  // État avec undo/redo
  const {
    state,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<AppState>({
    title: 'Mon titre',
    content: 'Mon contenu initial',
  });

  // États pour les composants mobiles
  const [sheetOpen, setSheetOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Handler pour la command palette
  const handleCommand = (command: string) => {
    switch (command) {
      case 'save':
        toast.success('Sauvegardé !');
        break;
      case 'go-home':
        toast.info('Navigation vers l\'accueil');
        break;
      case 'settings':
        setSheetOpen(true);
        break;
      default:
        toast.info(`Commande: ${command}`);
    }
  };

  // Simulation de refresh
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshCount((c) => c + 1);
    toast.success('Données rafraîchies !');
  };

  return (
    <>
      {/* Command Palette - Appuyez sur Cmd+K */}
      <CommandPalette
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCommand={handleCommand}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-white dark:bg-gray-950 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftDrawerOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <h1 className="text-lg font-semibold">Démo Mobile UI</h1>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightDrawerOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content avec Pull to Refresh */}
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Info */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Tirez vers le bas pour rafraîchir
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Nombre de rafraîchissements: {refreshCount}
                  </p>
                </div>
              </div>
            </Card>

            {/* Undo/Redo */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Système Undo/Redo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <Input
                    value={state.title}
                    onChange={(e) => set({ ...state, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contenu</label>
                  <Input
                    value={state.content}
                    onChange={(e) => set({ ...state, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                  >
                    <Redo2 className="w-4 h-4 mr-2" />
                    Refaire
                  </Button>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Composants mobiles</h2>
              <div className="grid gap-3">
                <Button
                  onClick={() => setSheetOpen(true)}
                  className="w-full"
                >
                  Ouvrir Bottom Sheet
                </Button>
                <Button
                  onClick={() => setLeftDrawerOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  Ouvrir Drawer (gauche)
                </Button>
                <Button
                  onClick={() => setRightDrawerOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  Ouvrir Drawer (droite)
                </Button>
              </div>
            </Card>

            {/* Raccourcis clavier */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Raccourcis clavier</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Ouvrir la palette de commandes</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ⌘K
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Annuler</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ⌘Z
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Refaire</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ⌘⇧Z
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sauvegarder</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    ⌘S
                  </kbd>
                </div>
              </div>
            </Card>

            {/* Placeholder content pour tester le scroll */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold mb-2">Contenu {i + 1}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </Card>
            ))}
          </div>
        </PullToRefresh>

        {/* Bottom Sheet - Paramètres */}
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Paramètres"
          snapPoints={[0.4, 0.7, 0.95]}
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">État actuel</h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-sm">
                  <strong>Titre:</strong> {state.title}
                </p>
                <p className="text-sm mt-1">
                  <strong>Contenu:</strong> {state.content}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Actions</h3>
              <Button
                onClick={() => {
                  toast.success('Paramètres sauvegardés !');
                  setSheetOpen(false);
                }}
                className="w-full"
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </BottomSheet>

        {/* Left Drawer - Navigation */}
        <SwipeDrawer
          isOpen={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          title="Navigation"
          position="left"
        >
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                toast.info('Accueil');
                setLeftDrawerOpen(false);
              }}
            >
              Accueil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                toast.info('Funnels');
                setLeftDrawerOpen(false);
              }}
            >
              Funnels
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                toast.info('Leads');
                setLeftDrawerOpen(false);
              }}
            >
              Leads
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                toast.info('Analytics');
                setLeftDrawerOpen(false);
              }}
            >
              Analytics
            </Button>
          </nav>
        </SwipeDrawer>

        {/* Right Drawer - Paramètres rapides */}
        <SwipeDrawer
          isOpen={rightDrawerOpen}
          onClose={() => setRightDrawerOpen(false)}
          title="Paramètres rapides"
          position="right"
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Historique</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Peut annuler: {canUndo ? 'Oui' : 'Non'}</p>
                <p>Peut refaire: {canRedo ? 'Oui' : 'Non'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    undo();
                    toast.success('Annulé !');
                  }}
                  disabled={!canUndo}
                >
                  Annuler la dernière action
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    redo();
                    toast.success('Refait !');
                  }}
                  disabled={!canRedo}
                >
                  Refaire l'action annulée
                </Button>
              </div>
            </div>
          </div>
        </SwipeDrawer>
      </div>
    </>
  );
}

