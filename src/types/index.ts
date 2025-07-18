// Global type definitions for the Semantic Writing Assistant

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  format: DocumentFormat;
  metadata: DocumentMetadata;
}

export type DocumentFormat = 'markdown' | 'txt' | 'docx' | 'html';

export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
  tags: string[];
  language: string;
}

export interface SemanticTerm {
  id: string;
  term: string;
  variants: string[];
  category: string;
  context: string[];
  frequency: number;
  positions: TermPosition[];
}

export interface TermPosition {
  start: number;
  end: number;
  line: number;
  column: number;
}

export interface ConsistencyIssue {
  id: string;
  type: 'terminology' | 'style' | 'structure' | 'logic';
  severity: 'low' | 'medium' | 'high';
  message: string;
  position: TermPosition;
  suggestions: string[];
  relatedTerms: string[];
}

export interface Suggestion {
  id: string;
  type: 'replace' | 'restructure' | 'clarify' | 'enhance';
  title: string;
  description: string;
  originalText: string;
  suggestedText: string;
  confidence: number;
  source: 'semantic' | 'ai' | 'user';
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai' | 'claude' | 'baidu' | 'alibaba' | 'zhipu' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  config: AIProviderConfig;
}

export interface AIProviderConfig {
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeout: number;
  retryAttempts: number;
}

export interface AIAnalysisResult {
  id: string;
  documentId: string;
  providerId: string;
  type: 'structure' | 'style' | 'logic' | 'terminology' | 'enhancement';
  insights: AIInsight[];
  suggestions: Suggestion[];
  createdAt: Date;
  confidence: number;
}

export interface AIInsight {
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface AppState {
  currentDocument: Document | null;
  documents: Document[];
  semanticTerms: SemanticTerm[];
  consistencyIssues: ConsistencyIssue[];
  suggestions: Suggestion[];
  aiProviders: AIProvider[];
  activeAIProvider: string | null;
  isAnalyzing: boolean;
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoSave: boolean;
  autoAnalysis: boolean;
  aiEnabled: boolean;
  notifications: boolean;
  shortcuts: Record<string, string>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface DatabaseSchema {
  documents: Document;
  semantic_terms: SemanticTerm;
  consistency_rules: ConsistencyRule;
  analysis_cache: AnalysisCache;
  ai_providers: AIProvider;
  ai_analysis_cache: AIAnalysisCache;
}

export interface ConsistencyRule {
  id: string;
  pattern: string;
  replacement: string;
  category: string;
  enabled: boolean;
  userDefined: boolean;
}

export interface AnalysisCache {
  id: string;
  documentId: string;
  contentHash: string;
  results: SemanticTerm[];
  createdAt: Date;
}

export interface AIAnalysisCache {
  id: string;
  documentId: string;
  providerId: string;
  contentHash: string;
  results: AIAnalysisResult;
  createdAt: Date;
}