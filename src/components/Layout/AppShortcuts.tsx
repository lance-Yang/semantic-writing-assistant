import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';

interface AppShortcutsProps {
  children: React.ReactNode;
}

export const AppShortcuts: React.FC<AppShortcutsProps> = ({ children }) => {
  const { settings, currentDocument, updateTauriDocument } = useAppStore();
  const navigate = useNavigate();

  // Save document
  useHotkeys(settings.shortcuts.save || 'cmd+s', (e) => {
    e.preventDefault();
    if (currentDocument) {
      updateTauriDocument(currentDocument.id, currentDocument.title, currentDocument.content);
    }
  }, [currentDocument]);

  // Quick analysis
  useHotkeys(settings.shortcuts.analyze || 'cmd+shift+a', (e) => {
    e.preventDefault();
    // Trigger analysis
    const event = new CustomEvent('trigger-analysis');
    window.dispatchEvent(event);
  });

  // Find
  useHotkeys(settings.shortcuts.find || 'cmd+f', (e) => {
    e.preventDefault();
    // Focus on search if available
    const searchInput = document.querySelector('[data-search]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  });

  // Navigation shortcuts
  useHotkeys('cmd+1', (e) => {
    e.preventDefault();
    navigate('/');
  });

  useHotkeys('cmd+2', (e) => {
    e.preventDefault();
    navigate('/editor');
  });

  useHotkeys('cmd+3', (e) => {
    e.preventDefault();
    navigate('/text-generation');
  });

  // New document
  useHotkeys('cmd+n', (e) => {
    e.preventDefault();
    const event = new CustomEvent('create-new-document');
    window.dispatchEvent(event);
  });

  // Show shortcuts panel
  useHotkeys('cmd+/', (e) => {
    e.preventDefault();
    const event = new CustomEvent('show-shortcuts');
    window.dispatchEvent(event);
  });

  return <>{children}</>;
};