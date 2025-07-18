import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';

export const useAutoSave = (content: string, title: string) => {
  const { currentDocument, updateDocument, settings } = useAppStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!settings.autoSave || !currentDocument) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      if (currentDocument.content !== content || currentDocument.title !== title) {
        updateDocument(currentDocument.id, {
          content,
          title,
          updatedAt: new Date()
        });
        console.log('Document auto-saved');
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, currentDocument?.id, currentDocument?.content, currentDocument?.title, updateDocument, settings.autoSave]);
};