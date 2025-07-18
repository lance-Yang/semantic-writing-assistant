import { useEffect, useCallback } from 'react';

export interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  category?: string;
}

interface UseShortcutsOptions {
  enabled?: boolean;
}

export const useShortcuts = (
  shortcuts: ShortcutAction[],
  options: UseShortcutsOptions = {}
) => {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const pressedKey = getKeyString(event);
      
      const matchedShortcut = shortcuts.find(
        (shortcut) => shortcut.key.toLowerCase() === pressedKey.toLowerCase()
      );

      if (matchedShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchedShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return { shortcuts };
};

// Helper function to convert KeyboardEvent to string representation
const getKeyString = (event: KeyboardEvent): string => {
  const parts: string[] = [];
  
  if (event.ctrlKey || event.metaKey) parts.push('Cmd');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  
  // Handle special keys
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Tab': 'Tab',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right',
  };
  
  const key = specialKeys[event.key] || event.key.toUpperCase();
  parts.push(key);
  
  return parts.join('+');
};

// Hook for registering global shortcuts
export const useGlobalShortcuts = () => {
  const registerShortcut = useCallback((
    key: string,
    action: () => void,
    description: string,
    category?: string
  ) => {
    const shortcut: ShortcutAction = { key, action, description, category };
    return shortcut;
  }, []);

  return { registerShortcut };
};

// Default shortcuts for the application
export const defaultShortcuts = {
  save: 'Cmd+S',
  analyze: 'Cmd+Shift+A',
  find: 'Cmd+F',
  replace: 'Cmd+R',
  newDocument: 'Cmd+N',
  openDocument: 'Cmd+O',
  toggleSidebar: 'Cmd+B',
  toggleTheme: 'Cmd+Shift+T',
  focusEditor: 'Cmd+E',
  showShortcuts: 'Cmd+/',
};