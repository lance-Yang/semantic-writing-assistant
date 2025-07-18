// ============ 核心平台类型 ============
export interface PlatformState {
  currentModule: string;
  activeDocument: Document | null;
  isProcessing: boolean;
  lastOperation: string | null;
  settings: PlatformSettings;
  modules: Record<string, PlatformModule>;
}

export interface PlatformSettings {
  modules: {
    textGeneration: boolean;
    grammarCheck: boolean;
    rewriting: boolean;
    translation: boolean;
    seo: boolean;
    templates: boolean;
  };
  textGeneration: {
    model: string;
    temperature: number;
    maxTokens: number;
    style: string;
    language: string;
  };
  grammarCheck: {
    enabled: boolean;
    realTime: boolean;
    language: string;
    strictness: 'low' | 'medium' | 'high';
  };
  translation: {
    defaultSourceLanguage: string;
    defaultTargetLanguage: string;
    provider: string;
  };
  seo: {
    enabled: boolean;
    targetKeywords: string[];
    targetAudience: string;
    contentType: string;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    compactMode: boolean;
    showPreview: boolean;
  };
}

export interface PlatformModule {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    wordCount: number;
    characterCount: number;
    tags: string[];
    language: string;
  };
}

// ============ 模块接口 ============
export interface ModuleAPI {
  initialize(): Promise<void>;
  process(request: any): Promise<ServiceResponse>;
  cleanup(): Promise<void>;
  getStatus(): ModuleStatus;
}

export interface ModuleStatus {
  loaded: boolean;
  ready: boolean;
  error?: string;
  lastUpdate: Date;
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorCount: number;
  };
}

// ============ 服务响应类型 ============
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

// ============ 文本生成模块类型 ============
export interface TextGenerationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  style: string;
  language: string;
}

export interface TextGenerationRequest {
  prompt: string;
  type: 'news' | 'advertisement' | 'product_description' | 'blog_post' | 'email' | 'social_media';
  style?: 'formal' | 'casual' | 'professional' | 'creative';
  tone?: 'neutral' | 'positive' | 'negative' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
  language?: string;
  keywords?: string[];
  targetAudience?: string;
  config?: TextGenerationConfig;
  outline?: string[];
}

export interface TextGenerationResponse {
  content: string;
  metadata: {
    wordCount: number;
    readabilityScore: number;
    keywords: string[];
    estimatedReadingTime: number;
    keywordDensity?: Record<string, number>;
    suggestions?: string[];
  };
}

// ============ 语法检查模块类型 ============
export interface GrammarCheckResult {
  text: string;
  language: 'zh-CN' | 'en-US';
  checkTypes?: ('grammar' | 'spelling' | 'punctuation' | 'style')[];
  strictness?: 'low' | 'medium' | 'high';
}

export interface GrammarCheckRequest {
  text: string;
  language: 'zh-CN' | 'en-US';
  checkTypes?: ('grammar' | 'spelling' | 'style' | 'clarity')[];
  strictness?: 'low' | 'medium' | 'high';
}

export interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'style' | 'clarity';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  position: {
    start: number;
    end: number;
  };
  suggestions: string[];
  rule?: string;
}

export interface GrammarCheckResponse {
  originalText: string;
  issues: GrammarIssue[];
  correctedText: string;
  metadata: {
    totalIssues: number;
    issuesByType: Record<string, number>;
    overallScore: number;
  };
}

// ============ 改写降重模块类型 ============
export interface RewritingRequest {
  text: string;
  mode: 'paraphrase' | 'simplify' | 'formal' | 'casual' | 'reduce_similarity';
  intensity: number; // 0-1，改写强度
  preserveLength?: boolean; // 是否保持原文长度
  targetAudience?: string; // 目标受众
  context?: string; // 上下文信息
}

export interface TextChange {
  type: 'addition' | 'deletion' | 'modification';
  original: string;
  modified: string;
  position: {
    start: number;
    end: number;
  };
  reason: string; // 修改原因
}

export interface RewritingResponse {
  originalText: string;
  rewrittenText: string;
  changes: TextChange[];
  similarityScore: number; // 与原文的相似度 0-1
  metadata: {
    wordCountChange: number;
    readabilityChange: number;
    preservedMeaning: number; // 意思保持度 0-1
  };
}

// ============ 摘要扩展模块类型 ============
export interface SummarizationRequest {
  text: string;
  summaryType: 'abstract' | 'executive' | 'bullet_points' | 'outline';
  length: 'short' | 'medium' | 'long';
  language?: string;
  includeKeyPoints?: boolean;
  focusAreas?: string[]; // 重点关注的领域
}

export interface SummarizationResponse {
  originalText: string;
  summaryText: string;
  keyPoints: string[];
  metadata: {
    compressionRatio: number; // 压缩比例
    wordCount: number;
    readabilityScore: number;
  };
}

export interface ExpansionRequest {
  text: string;
  expansionType: 'detailed' | 'examples' | 'background' | 'analysis';
  targetLength?: number; // 目标字数
  style?: 'formal' | 'casual' | 'academic' | 'business';
  addExamples?: boolean;
  focusAreas?: string[];
}

export interface ExpansionResponse {
  originalText: string;
  expandedText: string;
  metadata: {
    expansionRatio: number; // 扩展比例
    wordCount: number;
    readabilityScore: number;
  };
}

// ============ 翻译模块类型 ============
export interface TranslationRequest {
  text: string;
  fromLanguage: string; // ISO 语言代码
  toLanguage: string;
  style?: 'formal' | 'casual' | 'technical' | 'literary' | 'business' | 'academic';
  context?: string; // 上下文信息
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number; // 翻译置信度 0-1
  alternatives: string[]; // 替代翻译
  metadata: {
    method: 'api' | 'local';
    translationPairs: Array<{
      original: string;
      translated: string;
    }>;
    processingTime: number;
  };
}

// ============ SEO优化模块类型 ============
export interface SEORequest {
  content: string;
  targetKeywords: string[];
  contentType: 'article' | 'product' | 'landing_page' | 'blog_post';
  targetAudience?: string;
  competitorUrls?: string[];
}

export interface SEOSuggestion {
  type: 'keyword' | 'structure' | 'meta' | 'content' | 'technical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface SEOResponse {
  originalContent: string;
  optimizedContent: string;
  suggestions: SEOSuggestion[];
  keywordAnalysis: {
    density: Record<string, number>;
    distribution: Record<string, number[]>;
    suggestions: string[];
  };
  metadata: {
    readabilityScore: number;
    wordCount: number;
    estimatedReadingTime: number;
    seoScore: number; // 0-100
  };
}

// ============ 模板系统类型 ============
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: TemplateVariable[];
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  usage: number;
  rating: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiline' | 'date';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select type
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface TemplateRequest {
  templateId: string;
  variables: Record<string, any>;
  customizations?: {
    style?: string;
    tone?: string;
    length?: string;
  };
}

export interface TemplateResponse {
  templateId: string;
  generatedContent: string;
  usedVariables: Record<string, any>;
  metadata: {
    wordCount: number;
    estimatedReadingTime: number;
    generationTime: number;
  };
}

// ============ 协作功能类型 ============
export interface CollaborationSession {
  id: string;
  name: string;
  createdBy: string;
  participants: Participant[];
  document: Document;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  lastActivity: Date;
}

export interface Participant {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'online' | 'offline';
  lastSeen: Date;
  permissions: Permission[];
}

export interface Permission {
  action: 'read' | 'write' | 'comment' | 'suggest' | 'approve';
  scope: 'document' | 'section' | 'paragraph';
  granted: boolean;
}

export interface Change {
  id: string;
  type: 'insert' | 'delete' | 'modify';
  content: string;
  position: {
    start: number;
    end: number;
  };
  author: string;
  timestamp: Date;
  approved: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  position: {
    start: number;
    end: number;
  };
  timestamp: Date;
  resolved: boolean;
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'content' | 'structure';
  original: string;
  suggested: string;
  reason: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
}

// ============ 事件系统类型 ============
export interface PlatformEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventHandler<T = any> {
  (event: PlatformEvent & { payload: T }): void | Promise<void>;
}

// ============ 扩展的服务响应类型 ============
export type ServiceRequest = 
  | TextGenerationRequest 
  | GrammarCheckRequest 
  | RewritingRequest 
  | SummarizationRequest 
  | ExpansionRequest 
  | TranslationRequest 
  | SEORequest 
  | TemplateRequest;

export type ServiceResponseData = 
  | TextGenerationResponse 
  | GrammarCheckResponse 
  | RewritingResponse 
  | SummarizationResponse 
  | ExpansionResponse 
  | TranslationResponse 
  | SEOResponse 
  | TemplateResponse;