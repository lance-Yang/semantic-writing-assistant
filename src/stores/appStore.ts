import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppState, Document, SemanticTerm, ConsistencyIssue, Suggestion, AIProvider, AppSettings } from '../types';
import type { Document as TauriDocument, StorageStats } from '../types/tauri';
import { tauriService } from '../services/tauriService';

interface AppStore extends AppState {
  // Storage stats
  storageStats: StorageStats | null;
  
  // Document actions
  setCurrentDocument: (document: Document | null) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  loadDocuments: () => Promise<void>;
  
  // Tauri document actions
  createTauriDocument: (title: string, content: string) => Promise<string>;
  updateTauriDocument: (id: string, title?: string, content?: string) => Promise<void>;
  loadTauriDocument: (id: string) => Promise<Document | null>;
  deleteTauriDocument: (id: string) => Promise<void>;
  
  // File operations
  importDocument: (filePath?: string) => Promise<void>;
  exportDocument: (id: string, exportPath?: string) => Promise<void>;
  
  // Semantic analysis actions
  setSemanticTerms: (terms: SemanticTerm[]) => void;
  addSemanticTerm: (term: SemanticTerm) => void;
  updateSemanticTerm: (id: string, updates: Partial<SemanticTerm>) => void;
  loadSemanticTerms: (documentId: string) => Promise<void>;
  
  // Consistency issues actions
  setConsistencyIssues: (issues: ConsistencyIssue[]) => void;
  addConsistencyIssue: (issue: ConsistencyIssue) => void;
  resolveConsistencyIssue: (id: string) => void;
  
  // Suggestions actions
  setSuggestions: (suggestions: Suggestion[]) => void;
  addSuggestion: (suggestion: Suggestion) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  
  // AI Provider actions
  setAIProviders: (providers: AIProvider[]) => void;
  addAIProvider: (provider: AIProvider) => void;
  updateAIProvider: (id: string, updates: Partial<AIProvider>) => void;
  deleteAIProvider: (id: string) => void;
  setActiveAIProvider: (providerId: string | null) => void;
  
  // Analysis state actions
  setAnalyzing: (analyzing: boolean) => void;
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Storage management
  loadStorageStats: () => Promise<void>;
  clearCache: () => Promise<void>;
  
  // Backup operations
  createBackup: (documentId: string) => Promise<string>;
  restoreFromBackup: (backupPath?: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  autoSave: true,
  autoAnalysis: true,
  aiEnabled: false,
  notifications: true,
  shortcuts: {
    'save': 'Cmd+S',
    'analyze': 'Cmd+Shift+A',
    'find': 'Cmd+F',
    'replace': 'Cmd+R',
  },
};

// Helper function to convert Tauri document to app document
const convertTauriDocument = (tauriDoc: TauriDocument): Document => ({
  id: tauriDoc.id,
  title: tauriDoc.title,
  content: tauriDoc.content,
  createdAt: new Date(tauriDoc.created_at),
  updatedAt: new Date(tauriDoc.updated_at),
  format: 'markdown' as const,
  metadata: {
    wordCount: tauriDoc.word_count,
    characterCount: tauriDoc.content.length,
    tags: [],
    language: 'en'
  }
});

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentDocument: null,
        documents: [],
        semanticTerms: [],
        consistencyIssues: [],
        suggestions: [],
        aiProviders: [],
        activeAIProvider: null,
        isAnalyzing: false,
        settings: defaultSettings,
        storageStats: null,

        // Document actions
        setCurrentDocument: (document) => 
          set({ currentDocument: document }, false, 'setCurrentDocument'),
        
        addDocument: (document) =>
          set((state) => ({ 
            documents: [...state.documents, document] 
          }), false, 'addDocument'),
        
        updateDocument: (id, updates) =>
          set((state) => ({
            documents: state.documents.map(doc => 
              doc.id === id ? { ...doc, ...updates } : doc
            ),
            currentDocument: state.currentDocument?.id === id 
              ? { ...state.currentDocument, ...updates }
              : state.currentDocument
          }), false, 'updateDocument'),
        
        deleteDocument: (id) =>
          set((state) => ({
            documents: state.documents.filter(doc => doc.id !== id),
            currentDocument: state.currentDocument?.id === id 
              ? null 
              : state.currentDocument
          }), false, 'deleteDocument'),

        loadDocuments: async () => {
          try {
            const tauriDocs = await tauriService.listDocuments();
            const documents = tauriDocs.map(convertTauriDocument);
            set({ documents }, false, 'loadDocuments');
          } catch (error) {
            console.error('Failed to load documents:', error);
            await tauriService.showErrorDialog('Error', 'Failed to load documents');
          }
        },

        // Tauri document actions
        createTauriDocument: async (title, content) => {
          try {
            const id = await tauriService.createDocument(title, content);
            // Reload documents to get the updated list
            await get().loadDocuments();
            return id;
          } catch (error) {
            console.error('Failed to create document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to create document');
            throw error;
          }
        },

        updateTauriDocument: async (id, title, content) => {
          try {
            await tauriService.updateDocument(id, title, content);
            // Update local state
            const updates: Partial<Document> = {};
            if (title !== undefined) updates.title = title;
            if (content !== undefined) {
              updates.content = content;
              updates.metadata = {
                wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
                characterCount: content.length,
                tags: get().currentDocument?.metadata?.tags || [],
                language: get().currentDocument?.metadata?.language || 'en'
              };
              updates.updatedAt = new Date();
            }
            get().updateDocument(id, updates);
          } catch (error) {
            console.error('Failed to update document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to update document');
            throw error;
          }
        },

        loadTauriDocument: async (id) => {
          try {
            const tauriDoc = await tauriService.getDocument(id);
            if (tauriDoc) {
              const document = convertTauriDocument(tauriDoc);
              get().setCurrentDocument(document);
              return document;
            }
            return null;
          } catch (error) {
            console.error('Failed to load document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to load document');
            return null;
          }
        },

        deleteTauriDocument: async (id) => {
          try {
            const confirmed = await tauriService.confirmDialog(
              'Confirm Delete', 
              'Are you sure you want to delete this document? This action cannot be undone.'
            );
            if (confirmed) {
              await tauriService.deleteDocument(id);
              get().deleteDocument(id);
              await tauriService.showInfoDialog('Success', 'Document deleted successfully');
            }
          } catch (error) {
            console.error('Failed to delete document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to delete document');
          }
        },

        // File operations
        importDocument: async (filePath) => {
          try {
            const path = filePath || await tauriService.openFileDialog([
              { name: 'Text Files', extensions: ['txt', 'md', 'markdown', 'docx'] },
              { name: 'All Files', extensions: ['*'] }
            ]);
            
            if (path) {
              const result = await tauriService.importDocument(path);
              if (result.success) {
                await get().loadDocuments();
                await tauriService.showInfoDialog('Success', result.message);
              } else {
                await tauriService.showErrorDialog('Import Failed', result.message);
              }
            }
          } catch (error) {
            console.error('Failed to import document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to import document');
          }
        },

        exportDocument: async (id, exportPath) => {
          try {
            const path = exportPath || await tauriService.saveFileDialog(undefined, [
              { name: 'Markdown Files', extensions: ['md'] },
              { name: 'Text Files', extensions: ['txt'] },
              { name: 'All Files', extensions: ['*'] }
            ]);
            
            if (path) {
              await tauriService.exportDocument(id, path);
              await tauriService.showInfoDialog('Success', 'Document exported successfully');
            }
          } catch (error) {
            console.error('Failed to export document:', error);
            await tauriService.showErrorDialog('Error', 'Failed to export document');
          }
        },

        // Semantic analysis actions
        setSemanticTerms: (terms) =>
          set({ semanticTerms: terms }, false, 'setSemanticTerms'),
        
        addSemanticTerm: (term) =>
          set((state) => ({
            semanticTerms: [...state.semanticTerms, term]
          }), false, 'addSemanticTerm'),
        
        updateSemanticTerm: (id, updates) =>
          set((state) => ({
            semanticTerms: state.semanticTerms.map(term =>
              term.id === id ? { ...term, ...updates } : term
            )
          }), false, 'updateSemanticTerm'),

        loadSemanticTerms: async (documentId) => {
          try {
            const tauriTerms = await tauriService.getSemanticTerms(documentId);
            const terms: SemanticTerm[] = tauriTerms.map(tauriTerm => ({
              id: tauriTerm.id,
              term: tauriTerm.term,
              variants: [], // Initialize empty array
              category: 'general', // Default category
              context: [tauriTerm.context], // Convert single context to array
              frequency: 1, // Default frequency
              positions: [{
                start: tauriTerm.position,
                end: tauriTerm.position + tauriTerm.term.length,
                line: 0, // Default line
                column: 0 // Default column
              }]
            }));
            set({ semanticTerms: terms }, false, 'loadSemanticTerms');
          } catch (error) {
            console.error('Failed to load semantic terms:', error);
          }
        },

        // Consistency issues actions
        setConsistencyIssues: (issues) =>
          set({ consistencyIssues: issues }, false, 'setConsistencyIssues'),
        
        addConsistencyIssue: (issue) =>
          set((state) => ({
            consistencyIssues: [...state.consistencyIssues, issue]
          }), false, 'addConsistencyIssue'),
        
        resolveConsistencyIssue: (id) =>
          set((state) => ({
            consistencyIssues: state.consistencyIssues.filter(issue => issue.id !== id)
          }), false, 'resolveConsistencyIssue'),

        // Suggestions actions
        setSuggestions: (suggestions) =>
          set({ suggestions }, false, 'setSuggestions'),
        
        addSuggestion: (suggestion) =>
          set((state) => ({
            suggestions: [...state.suggestions, suggestion]
          }), false, 'addSuggestion'),
        
        applySuggestion: async (id) => {
          const suggestion = get().suggestions.find(s => s.id === id);
          if (suggestion && get().currentDocument) {
            const currentDoc = get().currentDocument!;
            const updatedContent = currentDoc.content.replace(
              suggestion.originalText,
              suggestion.suggestedText
            );
            
            // Update both local state and Tauri backend
            try {
              await get().updateTauriDocument(currentDoc.id, undefined, updatedContent);
            } catch (error) {
              console.error('Failed to apply suggestion:', error);
              return;
            }
          }
          
          // Remove the applied suggestion
          set((state) => ({
            suggestions: state.suggestions.filter(s => s.id !== id)
          }), false, 'applySuggestion');
        },
        
        dismissSuggestion: (id) =>
          set((state) => ({
            suggestions: state.suggestions.filter(s => s.id !== id)
          }), false, 'dismissSuggestion'),

        // AI Provider actions
        setAIProviders: (providers) =>
          set({ aiProviders: providers }, false, 'setAIProviders'),
        
        addAIProvider: (provider) =>
          set((state) => ({
            aiProviders: [...state.aiProviders, provider]
          }), false, 'addAIProvider'),
        
        updateAIProvider: (id, updates) =>
          set((state) => ({
            aiProviders: state.aiProviders.map(provider =>
              provider.id === id ? { ...provider, ...updates } : provider
            )
          }), false, 'updateAIProvider'),
        
        deleteAIProvider: (id) =>
          set((state) => ({
            aiProviders: state.aiProviders.filter(provider => provider.id !== id),
            activeAIProvider: state.activeAIProvider === id ? null : state.activeAIProvider
          }), false, 'deleteAIProvider'),
        
        setActiveAIProvider: (providerId) =>
          set({ activeAIProvider: providerId }, false, 'setActiveAIProvider'),

        // Analysis state actions
        setAnalyzing: (analyzing) =>
          set({ isAnalyzing: analyzing }, false, 'setAnalyzing'),

        // Settings actions
        updateSettings: (updates) =>
          set((state) => ({
            settings: { ...state.settings, ...updates }
          }), false, 'updateSettings'),

        // Storage management
        loadStorageStats: async () => {
          try {
            const stats = await tauriService.getStorageStats();
            set({ storageStats: stats }, false, 'loadStorageStats');
          } catch (error) {
            console.error('Failed to load storage stats:', error);
          }
        },

        clearCache: async () => {
          try {
            await tauriService.clearDocumentCache();
            await tauriService.showInfoDialog('Success', 'Cache cleared successfully');
          } catch (error) {
            console.error('Failed to clear cache:', error);
            await tauriService.showErrorDialog('Error', 'Failed to clear cache');
          }
        },

        // Backup operations
        createBackup: async (documentId) => {
          try {
            const backupPath = await tauriService.createBackup(documentId);
            await tauriService.showInfoDialog('Success', `Backup created: ${backupPath}`);
            return backupPath;
          } catch (error) {
            console.error('Failed to create backup:', error);
            await tauriService.showErrorDialog('Error', 'Failed to create backup');
            throw error;
          }
        },

        restoreFromBackup: async (backupPath) => {
          try {
            const path = backupPath || await tauriService.openFileDialog([
              { name: 'Backup Files', extensions: ['backup.md'] },
              { name: 'All Files', extensions: ['*'] }
            ]);
            
            if (path) {
              const result = await tauriService.restoreFromBackup(path);
              if (result.success) {
                await get().loadDocuments();
                await tauriService.showInfoDialog('Success', result.message);
              } else {
                await tauriService.showErrorDialog('Restore Failed', result.message);
              }
            }
          } catch (error) {
            console.error('Failed to restore from backup:', error);
            await tauriService.showErrorDialog('Error', 'Failed to restore from backup');
          }
        },
      }),
      {
        name: 'semantic-writing-assistant-store',
        partialize: (state) => ({
          aiProviders: state.aiProviders.map(provider => ({
            ...provider,
            apiKey: '', // Don't persist API keys in localStorage
          })),
          settings: state.settings,
        }),
      }
    )
  )
);