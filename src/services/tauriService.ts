import { invoke } from '@tauri-apps/api/core';
import type { 
  Document, 
  SemanticTerm, 
  ConsistencyRule, 
  AnalysisCache, 
  FileInfo, 
  ImportResult, 
  StorageStats,
  TauriAPI 
} from '../types/tauri';

class TauriService implements TauriAPI {
  // Document management
  async createDocument(title: string, content: string): Promise<string> {
    return await invoke('create_document', { title, content });
  }

  async updateDocument(id: string, title?: string, content?: string): Promise<void> {
    return await invoke('update_document', { id, title, content });
  }

  async getDocument(id: string): Promise<Document | null> {
    return await invoke('get_document', { id });
  }

  async listDocuments(): Promise<Document[]> {
    return await invoke('list_documents');
  }

  async deleteDocument(id: string): Promise<void> {
    return await invoke('delete_document', { id });
  }

  // File operations
  async importDocument(filePath: string): Promise<ImportResult> {
    return await invoke('import_document', { filePath });
  }

  async exportDocument(id: string, exportPath: string): Promise<void> {
    return await invoke('export_document', { id, exportPath });
  }

  async saveFile(path: string, contents: string): Promise<void> {
    return await invoke('save_file', { path, contents });
  }

  async readFile(path: string): Promise<string> {
    return await invoke('read_file', { path });
  }

  async listFiles(dirPath: string): Promise<string[]> {
    return await invoke('list_files', { dirPath });
  }

  // Semantic analysis
  async saveSemanticTerms(documentId: string, terms: SemanticTerm[]): Promise<void> {
    return await invoke('save_semantic_terms', { documentId, terms });
  }

  async getSemanticTerms(documentId: string): Promise<SemanticTerm[]> {
    return await invoke('get_semantic_terms', { documentId });
  }

  // Consistency rules
  async saveConsistencyRule(rule: ConsistencyRule): Promise<void> {
    return await invoke('save_consistency_rule', { rule });
  }

  async getConsistencyRules(): Promise<ConsistencyRule[]> {
    return await invoke('get_consistency_rules');
  }

  // Analysis cache
  async saveAnalysisCache(cache: AnalysisCache): Promise<void> {
    return await invoke('save_analysis_cache', { cache });
  }

  async getAnalysisCache(documentId: string, contentHash: string): Promise<AnalysisCache | null> {
    return await invoke('get_analysis_cache', { documentId, contentHash });
  }

  // Backup operations
  async createBackup(documentId: string): Promise<string> {
    return await invoke('create_backup', { documentId });
  }

  async listBackups(): Promise<FileInfo[]> {
    return await invoke('list_backups');
  }

  async restoreFromBackup(backupPath: string): Promise<ImportResult> {
    return await invoke('restore_from_backup', { backupPath });
  }

  // Utilities
  async calculateContentHash(content: string): Promise<string> {
    return await invoke('calculate_content_hash', { content });
  }

  async getStorageStats(): Promise<StorageStats> {
    return await invoke('get_storage_stats');
  }

  async clearDocumentCache(): Promise<void> {
    return await invoke('clear_document_cache');
  }

  // Helper methods
  async openFileDialog(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const result = await open({
        multiple: false,
        filters: filters || [
          { name: 'Text Files', extensions: ['txt', 'md', 'markdown'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Failed to open file dialog:', error);
      return null;
    }
  }

  async saveFileDialog(defaultPath?: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const result = await save({
        defaultPath,
        filters: filters || [
          { name: 'Markdown Files', extensions: ['md'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      return result;
    } catch (error) {
      console.error('Failed to open save dialog:', error);
      return null;
    }
  }

  async showErrorDialog(title: string, message: string): Promise<void> {
    try {
      const { message: showMessage } = await import('@tauri-apps/plugin-dialog');
      await showMessage(message, { title, kind: 'error' });
    } catch (error) {
      console.error('Failed to show error dialog:', error);
      // Fallback to browser alert
      alert(`${title}: ${message}`);
    }
  }

  async showInfoDialog(title: string, message: string): Promise<void> {
    try {
      const { message: showMessage } = await import('@tauri-apps/plugin-dialog');
      await showMessage(message, { title, kind: 'info' });
    } catch (error) {
      console.error('Failed to show info dialog:', error);
      // Fallback to browser alert
      alert(`${title}: ${message}`);
    }
  }

  async confirmDialog(title: string, message: string): Promise<boolean> {
    try {
      const { ask } = await import('@tauri-apps/plugin-dialog');
      return await ask(message, { title, kind: 'warning' });
    } catch (error) {
      console.error('Failed to show confirm dialog:', error);
      // Fallback to browser confirm
      return confirm(`${title}: ${message}`);
    }
  }
}

// Create singleton instance
export const tauriService = new TauriService();

// Export for testing
export { TauriService };