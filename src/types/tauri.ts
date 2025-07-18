// Tauri backend types
export interface Document {
  id: string;
  title: string;
  content: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
  word_count: number;
}

export interface SemanticTerm {
  id: string;
  document_id: string;
  term: string;
  context: string;
  position: number;
  confidence: number;
  created_at: string;
}

export interface ConsistencyRule {
  id: string;
  term: string;
  preferred_form: string;
  alternatives: string; // JSON array of alternative forms
  is_active: boolean;
  created_at: string;
}

export interface AnalysisCache {
  id: string;
  document_id: string;
  content_hash: string;
  analysis_result: string; // JSON serialized analysis result
  created_at: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension?: string;
}

export interface ImportResult {
  success: boolean;
  document_id?: string;
  message: string;
}

export interface StorageStats {
  total_documents: number;
  total_words: number;
  total_characters: number;
  cached_documents: number;
  database_path: string;
  app_data_dir: string;
}

// Tauri command interfaces
export interface TauriAPI {
  // Document management
  createDocument: (title: string, content: string) => Promise<string>;
  updateDocument: (id: string, title?: string, content?: string) => Promise<void>;
  getDocument: (id: string) => Promise<Document | null>;
  listDocuments: () => Promise<Document[]>;
  deleteDocument: (id: string) => Promise<void>;

  // File operations
  importDocument: (filePath: string) => Promise<ImportResult>;
  exportDocument: (id: string, exportPath: string) => Promise<void>;
  saveFile: (path: string, contents: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  listFiles: (dirPath: string) => Promise<string[]>;

  // Semantic analysis
  saveSemanticTerms: (documentId: string, terms: SemanticTerm[]) => Promise<void>;
  getSemanticTerms: (documentId: string) => Promise<SemanticTerm[]>;

  // Consistency rules
  saveConsistencyRule: (rule: ConsistencyRule) => Promise<void>;
  getConsistencyRules: () => Promise<ConsistencyRule[]>;

  // Analysis cache
  saveAnalysisCache: (cache: AnalysisCache) => Promise<void>;
  getAnalysisCache: (documentId: string, contentHash: string) => Promise<AnalysisCache | null>;

  // Backup operations
  createBackup: (documentId: string) => Promise<string>;
  listBackups: () => Promise<FileInfo[]>;
  restoreFromBackup: (backupPath: string) => Promise<ImportResult>;

  // Utilities
  calculateContentHash: (content: string) => Promise<string>;
  getStorageStats: () => Promise<StorageStats>;
  clearDocumentCache: () => Promise<void>;
}