'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Save,
  Copy,
  Trash2,
  Eye,
  Settings,
  Undo2,
  Redo2,
  FileText,
  BarChart3,
  Users,
  Home,
} from 'lucide-react';

interface CommandPaletteProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCommand?: (command: string) => void;
}

export function CommandPalette({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCommand,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Toggle avec Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Raccourcis globaux même quand fermé
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey && onUndo && canUndo) {
          e.preventDefault();
          onUndo();
        }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          if (onRedo && canRedo) {
            e.preventDefault();
            onRedo();
          }
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onUndo, onRedo, canUndo, canRedo]);

  const handleCommand = useCallback(
    (command: string) => {
      setOpen(false);
      setSearch('');
      
      switch (command) {
        case 'undo':
          onUndo?.();
          break;
        case 'redo':
          onRedo?.();
          break;
        default:
          onCommand?.(command);
      }
    },
    [onUndo, onRedo, onCommand]
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <Command
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
                value={search}
                onValueChange={setSearch}
              >
                <div className="flex items-center border-b border-gray-200 dark:border-gray-800 px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Command.Input
                    placeholder="Rechercher une commande..."
                    className="flex-1 py-4 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  />
                  <kbd className="hidden sm:inline-flex h-6 px-2 items-center gap-1 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-gray-500">
                    Aucun résultat trouvé.
                  </Command.Empty>

                  {/* Actions d'édition */}
                  <Command.Group
                    heading="Édition"
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2"
                  >
                    <CommandItem
                      onSelect={() => handleCommand('undo')}
                      disabled={!canUndo}
                      icon={<Undo2 className="w-4 h-4" />}
                      shortcut="⌘Z"
                    >
                      Annuler
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('redo')}
                      disabled={!canRedo}
                      icon={<Redo2 className="w-4 h-4" />}
                      shortcut="⌘⇧Z"
                    >
                      Refaire
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('copy')}
                      icon={<Copy className="w-4 h-4" />}
                      shortcut="⌘C"
                    >
                      Copier
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('delete')}
                      icon={<Trash2 className="w-4 h-4" />}
                      shortcut="⌫"
                    >
                      Supprimer
                    </CommandItem>
                  </Command.Group>

                  {/* Navigation */}
                  <Command.Group
                    heading="Navigation"
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2"
                  >
                    <CommandItem
                      onSelect={() => handleCommand('go-home')}
                      icon={<Home className="w-4 h-4" />}
                    >
                      Accueil
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('go-funnels')}
                      icon={<FileText className="w-4 h-4" />}
                    >
                      Funnels
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('go-leads')}
                      icon={<Users className="w-4 h-4" />}
                    >
                      Leads
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('go-analytics')}
                      icon={<BarChart3 className="w-4 h-4" />}
                    >
                      Analytics
                    </CommandItem>
                  </Command.Group>

                  {/* Actions rapides */}
                  <Command.Group
                    heading="Actions"
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2"
                  >
                    <CommandItem
                      onSelect={() => handleCommand('new-funnel')}
                      icon={<Plus className="w-4 h-4" />}
                      shortcut="⌘N"
                    >
                      Nouveau funnel
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('save')}
                      icon={<Save className="w-4 h-4" />}
                      shortcut="⌘S"
                    >
                      Sauvegarder
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('preview')}
                      icon={<Eye className="w-4 h-4" />}
                      shortcut="⌘P"
                    >
                      Prévisualiser
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleCommand('settings')}
                      icon={<Settings className="w-4 h-4" />}
                    >
                      Paramètres
                    </CommandItem>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
}

function CommandItem({ children, onSelect, icon, shortcut, disabled }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800'
      }`}
    >
      <div className="text-gray-600 dark:text-gray-400">{icon}</div>
      <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{children}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-flex h-6 px-2 items-center gap-1 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 font-mono">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

