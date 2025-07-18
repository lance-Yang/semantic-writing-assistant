# API 文档

本文档详细描述了 Semantic Writing Assistant 的 API 接口，包括前端服务、Tauri 后端接口以及外部 AI 服务集成。

## 目录

- [前端 API](#前端-api)
- [Tauri 后端 API](#tauri-后端-api)
- [AI 服务集成](#ai-服务集成)
- [数据库接口](#数据库接口)
- [错误处理](#错误处理)
- [认证和安全](#认证和安全)

## 前端 API

### 文档服务 (DocumentService)

#### 创建文档
```typescript
interface CreateDocumentRequest {
  title: string;
  content?: string;
  type?: 'markdown' | 'richtext' | 'plain';
  metadata?: DocumentMetadata;
}

interface DocumentMetadata {
  tags?: string[];
  category?: string;
  author?: string;
  description?: string;
}

// 使用示例
const document = await documentService.create({
  title: "新文档",
  content: "# 标题\n\n内容...",
  type: "markdown",
  metadata: {
    tags: ["技术文档", "API"],
    category: "开发",
    author: "用户名"
  }
});
```

#### 更新文档
```typescript
interface UpdateDocumentRequest {
  id: string;
  title?: string;
  content?: string;
  metadata?: Partial<DocumentMetadata>;
}

// 使用示例
await documentService.update({
  id: "doc-123",
  content: "更新的内容",
  metadata: {
    tags: ["更新", "修订"]
  }
});
```

#### 获取文档列表
```typescript
interface ListDocumentsRequest {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'size';
  order?: 'asc' | 'desc';
  filter?: {
    category?: string;
    tags?: string[];
    author?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  search?: string;
}

interface ListDocumentsResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 使用示例
const result = await documentService.list({
  page: 1,
  limit: 20,
  sortBy: 'updatedAt',
  order: 'desc',
  filter: {
    category: '技术文档',
    tags: ['API']
  },
  search: 'React'
});
```

#### 删除文档
```typescript
// 软删除（移到回收站）
await documentService.softDelete(documentId);

// 永久删除
await documentService.delete(documentId);

// 恢复删除的文档
await documentService.restore(documentId);
```

### AI 服务 (AIService)

#### 文本生成
```typescript
interface GenerateTextRequest {
  prompt: string;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'claude-3' | 'deepseek';
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

interface GenerateTextResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter';
  metadata?: {
    processingTime: number;
    requestId: string;
  };
}

// 使用示例
const response = await aiService.generateText({
  prompt: "写一篇关于人工智能的文章",
  model: "gpt-4",
  maxTokens: 2000,
  temperature: 0.7,
  stream: false
});
```

#### 流式文本生成
```typescript
interface StreamGenerateTextRequest extends GenerateTextRequest {
  stream: true;
}

// 使用示例
const stream = aiService.generateTextStream({
  prompt: "写一篇关于人工智能的文章",
  model: "gpt-4",
  maxTokens: 2000,
  temperature: 0.7,
  stream: true
});

for await (const chunk of stream) {
  console.log(chunk.text);
  // 更新UI显示生成的文本
}
```

#### 语义分析
```typescript
interface AnalyzeTextRequest {
  text: string;
  analysisTypes: AnalysisType[];
  options?: AnalysisOptions;
}

type AnalysisType = 
  | 'grammar'
  | 'style'
  | 'sentiment'
  | 'keywords'
  | 'readability'
  | 'consistency'
  | 'structure';

interface AnalysisOptions {
  language?: 'zh' | 'en' | 'auto';
  domain?: 'general' | 'technical' | 'academic' | 'business';
  strictness?: 'low' | 'medium' | 'high';
}

interface AnalyzeTextResponse {
  suggestions: Suggestion[];
  semanticTerms: SemanticTerm[];
  sentiment: SentimentAnalysis;
  readabilityScore: number;
  consistencyIssues: ConsistencyIssue[];
  metadata: {
    processingTime: number;
    confidence: number;
    language: string;
  };
}

// 使用示例
const analysis = await aiService.analyzeText({
  text: "这是需要分析的文本内容...",
  analysisTypes: ['grammar', 'style', 'sentiment', 'keywords'],
  options: {
    language: 'zh',
    domain: 'technical',
    strictness: 'medium'
  }
});
```

#### 翻译服务
```typescript
interface TranslateRequest {
  text: string;
  sourceLanguage?: string; // 'auto' for auto-detection
  targetLanguage: string;
  model?: 'google' | 'deepl' | 'azure' | 'ai-powered';
  options?: {
    preserveFormatting?: boolean;
    glossary?: Record<string, string>;
    domain?: 'general' | 'technical' | 'medical' | 'legal';
  };
}

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
  confidence: number;
  alternatives?: string[];
  usage?: {
    charactersTranslated: number;
  };
}

// 使用示例
const translation = await aiService.translate({
  text: "Hello, world!",
  sourceLanguage: 'en',
  targetLanguage: 'zh',
  model: 'ai-powered',
  options: {
    preserveFormatting: true,
    domain: 'technical'
  }
});
```

### 语义分析服务 (SemanticService)

#### 术语提取
```typescript
interface ExtractTermsRequest {
  text: string;
  options?: {
    minFrequency?: number;
    maxTerms?: number;
    includeCompounds?: boolean;
    filterStopWords?: boolean;
    language?: string;
  };
}

interface SemanticTerm {
  id: string;
  term: string;
  variants: string[];
  category: 'technical' | 'domain' | 'general';
  frequency: number;
  importance: number;
  context: string[];
  positions: Array<{
    start: number;
    end: number;
    line: number;
  }>;
}

// 使用示例
const terms = await semanticService.extractTerms({
  text: "API是应用程序编程接口...",
  options: {
    minFrequency: 2,
    maxTerms: 50,
    includeCompounds: true,
    language: 'zh'
  }
});
```

#### 一致性检查
```typescript
interface CheckConsistencyRequest {
  text: string;
  options?: {
    checkTerminology?: boolean;
    checkStyle?: boolean;
    checkFormatting?: boolean;
    customRules?: ConsistencyRule[];
  };
}

interface ConsistencyRule {
  id: string;
  name: string;
  pattern: string | RegExp;
  replacement?: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
}

interface ConsistencyIssue {
  id: string;
  type: 'terminology' | 'style' | 'formatting';
  severity: 'error' | 'warning' | 'info';
  message: string;
  position: {
    start: number;
    end: number;
    line: number;
    column: number;
  };
  originalText: string;
  suggestedText?: string;
  rule?: string;
  confidence: number;
}

// 使用示例
const issues = await semanticService.checkConsistency({
  text: "API和api在文档中混用...",
  options: {
    checkTerminology: true,
    checkStyle: true,
    customRules: [
      {
        id: 'api-consistency',
        name: 'API术语一致性',
        pattern: /\bapi\b/gi,
        replacement: 'API',
        severity: 'warning',
        category: 'terminology'
      }
    ]
  }
});
```

### 协作服务 (CollaborationService)

#### 实时协作
```typescript
interface JoinSessionRequest {
  documentId: string;
  userId: string;
  userInfo: {
    name: string;
    avatar?: string;
    color?: string;
  };
}

interface CollaborationSession {
  id: string;
  documentId: string;
  participants: Participant[];
  cursors: Record<string, CursorPosition>;
  selections: Record<string, SelectionRange>;
}

interface Participant {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  permissions: Permission[];
}

// 使用示例
const session = await collaborationService.joinSession({
  documentId: "doc-123",
  userId: "user-456",
  userInfo: {
    name: "张三",
    avatar: "https://example.com/avatar.jpg",
    color: "#3b82f6"
  }
});
```

#### 操作同步
```typescript
interface Operation {
  id: string;
  type: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
  userId: string;
  timestamp: Date;
}

interface ApplyOperationRequest {
  sessionId: string;
  operation: Operation;
  revision: number;
}

// 使用示例
await collaborationService.applyOperation({
  sessionId: "session-123",
  operation: {
    id: "op-789",
    type: "insert",
    position: 100,
    content: "新插入的文本",
    userId: "user-456",
    timestamp: new Date()
  },
  revision: 15
});
```

## Tauri 后端 API

### 文件系统操作

#### 读取文件
```rust
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e))
    }
}
```

```typescript
// 前端调用
const content = await invoke<string>('read_file', { path: '/path/to/file.txt' });
```

#### 写入文件
```rust
#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e))
    }
}
```

```typescript
// 前端调用
await invoke('write_file', { 
  path: '/path/to/file.txt', 
  content: '文件内容' 
});
```

#### 文件对话框
```rust
#[tauri::command]
async fn open_file_dialog(
    window: tauri::Window,
    filters: Vec<FileFilter>
) -> Result<Option<String>, String> {
    let file_path = FileDialogBuilder::new()
        .add_filters(&filters)
        .pick_file();
    
    Ok(file_path.map(|p| p.to_string_lossy().to_string()))
}
```

```typescript
// 前端调用
const filePath = await invoke<string | null>('open_file_dialog', {
  filters: [
    { name: 'Text Files', extensions: ['txt', 'md'] },
    { name: 'All Files', extensions: ['*'] }
  ]
});
```

### 数据库操作

#### 初始化数据库
```rust
#[tauri::command]
async fn init_database(app_handle: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;
    
    let db_path = app_dir.join("database.sqlite");
    let conn = Connection::open(db_path)
        .map_err(|e| format!("Failed to open database: {}", e))?;
    
    // 创建表结构
    conn.execute(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| format!("Failed to create table: {}", e))?;
    
    Ok(())
}
```

#### 文档CRUD操作
```rust
#[derive(Serialize, Deserialize)]
struct Document {
    id: String,
    title: String,
    content: String,
    created_at: String,
    updated_at: String,
}

#[tauri::command]
async fn create_document(
    state: tauri::State<'_, DatabaseState>,
    document: Document
) -> Result<Document, String> {
    let conn = state.connection.lock().unwrap();
    
    conn.execute(
        "INSERT INTO documents (id, title, content) VALUES (?1, ?2, ?3)",
        params![document.id, document.title, document.content],
    ).map_err(|e| format!("Failed to insert document: {}", e))?;
    
    Ok(document)
}

#[tauri::command]
async fn get_document(
    state: tauri::State<'_, DatabaseState>,
    id: String
) -> Result<Option<Document>, String> {
    let conn = state.connection.lock().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at FROM documents WHERE id = ?1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let document = stmt.query_row(params![id], |row| {
        Ok(Document {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }).optional()
    .map_err(|e| format!("Failed to query document: {}", e))?;
    
    Ok(document)
}
```

### 系统集成

#### 系统通知
```rust
#[tauri::command]
async fn show_notification(
    title: String,
    body: String,
    icon: Option<String>
) -> Result<(), String> {
    Notification::new(&title)
        .body(&body)
        .icon(icon.as_deref().unwrap_or(""))
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))?;
    
    Ok(())
}
```

#### 系统菜单
```rust
fn create_menu() -> Menu {
    let file_menu = Submenu::new("文件", Menu::new()
        .add_item(MenuItem::new("新建", "new", Some("CmdOrCtrl+N")))
        .add_item(MenuItem::new("打开", "open", Some("CmdOrCtrl+O")))
        .add_item(MenuItem::new("保存", "save", Some("CmdOrCtrl+S")))
        .add_separator()
        .add_item(MenuItem::new("退出", "quit", Some("CmdOrCtrl+Q")))
    );
    
    let edit_menu = Submenu::new("编辑", Menu::new()
        .add_item(MenuItem::new("撤销", "undo", Some("CmdOrCtrl+Z")))
        .add_item(MenuItem::new("重做", "redo", Some("CmdOrCtrl+Shift+Z")))
        .add_separator()
        .add_item(MenuItem::new("复制", "copy", Some("CmdOrCtrl+C")))
        .add_item(MenuItem::new("粘贴", "paste", Some("CmdOrCtrl+V")))
    );
    
    Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
}
```

## AI 服务集成

### OpenAI API 集成

#### GPT 文本生成
```typescript
class OpenAIService implements AIProvider {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        stream: request.stream
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0].finish_reason,
      metadata: {
        processingTime: Date.now() - startTime,
        requestId: response.headers.get('x-request-id') || ''
      }
    };
  }

  async generateTextStream(request: StreamGenerateTextRequest): AsyncGenerator<TextChunk> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield { text: content };
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }
}
```

### Google Gemini API 集成

```typescript
class GeminiService implements AIProvider {
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta';

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const response = await fetch(
      `${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: request.prompt }]
          }],
          generationConfig: {
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
            topP: request.topP,
            stopSequences: request.stop
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates[0];
    
    return {
      text: candidate.content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      },
      model: 'gemini-pro',
      finishReason: candidate.finishReason?.toLowerCase() || 'stop'
    };
  }
}
```

### Claude API 集成

```typescript
class ClaudeService implements AIProvider {
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1';

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model || 'claude-3-sonnet-20240229',
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
        messages: [
          { role: 'user', content: request.prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.content[0].text,
      usage: data.usage,
      model: data.model,
      finishReason: data.stop_reason || 'stop'
    };
  }
}
```

## 数据库接口

### 数据库架构

```sql
-- 文档表
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'markdown',
    metadata TEXT, -- JSON格式的元数据
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    version INTEGER DEFAULT 1
);

-- 文档版本历史表
CREATE TABLE document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    FOREIGN KEY (document_id) REFERENCES documents (id)
);

-- 语义术语表
CREATE TABLE semantic_terms (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    term TEXT NOT NULL,
    variants TEXT, -- JSON数组
    category TEXT,
    frequency INTEGER DEFAULT 1,
    importance REAL DEFAULT 0.0,
    context TEXT, -- JSON数组
    positions TEXT, -- JSON数组，存储位置信息
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents (id)
);

-- 分析结果表
CREATE TABLE analysis_results (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    analysis_type TEXT NOT NULL,
    result TEXT, -- JSON格式的分析结果
    confidence REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents (id)
);

-- 用户设置表
CREATE TABLE user_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI 服务配置表
CREATE TABLE ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    api_key TEXT, -- 加密存储
    endpoint TEXT,
    model_config TEXT, -- JSON格式的模型配置
    is_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 数据库操作接口

```typescript
interface DatabaseService {
  // 文档操作
  createDocument(document: CreateDocumentRequest): Promise<Document>;
  getDocument(id: string): Promise<Document | null>;
  updateDocument(id: string, updates: UpdateDocumentRequest): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  listDocuments(options: ListDocumentsRequest): Promise<ListDocumentsResponse>;
  
  // 版本管理
  createVersion(documentId: string, version: DocumentVersion): Promise<DocumentVersion>;
  getVersions(documentId: string): Promise<DocumentVersion[]>;
  restoreVersion(documentId: string, version: number): Promise<Document>;
  
  // 语义术语
  saveSemanticTerms(documentId: string, terms: SemanticTerm[]): Promise<void>;
  getSemanticTerms(documentId: string): Promise<SemanticTerm[]>;
  
  // 分析结果
  saveAnalysisResult(result: AnalysisResult): Promise<void>;
  getAnalysisResults(documentId: string, type?: string): Promise<AnalysisResult[]>;
  
  // 设置管理
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  
  // AI 服务配置
  saveAIProvider(provider: AIProviderConfig): Promise<void>;
  getAIProviders(): Promise<AIProviderConfig[]>;
  updateAIProvider(id: string, updates: Partial<AIProviderConfig>): Promise<void>;
}
```

## 错误处理

### 错误类型定义

```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  
  // 文档相关错误
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  DOCUMENT_LOCKED = 'DOCUMENT_LOCKED',
  DOCUMENT_VERSION_CONFLICT = 'DOCUMENT_VERSION_CONFLICT',
  
  // AI 服务错误
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_INVALID_API_KEY = 'AI_INVALID_API_KEY',
  AI_CONTENT_FILTERED = 'AI_CONTENT_FILTERED',
  
  // 文件系统错误
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // 数据库错误
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

interface APIError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}
```

### 错误处理中间件

```typescript
class ErrorHandler {
  static handle(error: Error): APIError {
    if (error instanceof APIError) {
      return error;
    }

    // 根据错误类型转换为标准 API 错误
    if (error.message.includes('fetch')) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: '网络连接失败',
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    if (error.message.includes('timeout')) {
      return {
        code: ErrorCode.TIMEOUT_ERROR,
        message: '请求超时',
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }

    // 默认未知错误
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: '发生未知错误',
      details: { originalError: error.message },
      timestamp: new Date()
    };
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw this.handle(lastError);
        }

        // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }

    throw this.handle(lastError!);
  }
}
```

## 认证和安全

### API 密钥管理

```typescript
interface APIKeyManager {
  // 加密存储 API 密钥
  storeAPIKey(provider: string, apiKey: string): Promise<void>;
  
  // 获取解密后的 API 密钥
  getAPIKey(provider: string): Promise<string | null>;
  
  // 删除 API 密钥
  removeAPIKey(provider: string): Promise<void>;
  
  // 验证 API 密钥有效性
  validateAPIKey(provider: string, apiKey: string): Promise<boolean>;
}

class SecureAPIKeyManager implements APIKeyManager {
  private encryptionKey: string;

  constructor() {
    // 从系统密钥链或安全存储获取加密密钥
    this.encryptionKey = this.getSystemEncryptionKey();
  }

  async storeAPIKey(provider: string, apiKey: string): Promise<void> {
    const encryptedKey = await this.encrypt(apiKey);
    await invoke('store_encrypted_setting', {
      key: `api_key_${provider}`,
      value: encryptedKey
    });
  }

  async getAPIKey(provider: string): Promise<string | null> {
    const encryptedKey = await invoke<string | null>('get_encrypted_setting', {
      key: `api_key_${provider}`
    });

    if (!encryptedKey) {
      return null;
    }

    return await this.decrypt(encryptedKey);
  }

  private async encrypt(data: string): Promise<string> {
    // 使用 Web Crypto API 进行加密
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const keyBuffer = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.encryptionKey),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyBuffer,
      dataBuffer
    );

    // 将 IV 和加密数据组合并转换为 base64
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const encoder = new TextEncoder();
    const keyBuffer = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.encryptionKey),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyBuffer,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  private getSystemEncryptionKey(): string {
    // 在实际应用中，这应该从系统密钥链或安全存储获取
    // 这里仅作为示例
    return 'your-secure-encryption-key-32-chars';
  }
}
```

### 请求验证和限流

```typescript
interface RateLimiter {
  checkLimit(key: string, limit: number, window: number): Promise<boolean>;
  getRemainingRequests(key: string): Promise<number>;
  resetLimit(key: string): Promise<void>;
}

class MemoryRateLimiter implements RateLimiter {
  private requests: Map<string, Array<{ timestamp: number; count: number }>> = new Map();

  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - window * 1000;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const keyRequests = this.requests.get(key)!;
    
    // 清理过期的请求记录
    const validRequests = keyRequests.filter(req => req.timestamp > windowStart);
    this.requests.set(key, validRequests);

    // 计算当前窗口内的请求总数
    const totalRequests = validRequests.reduce((sum, req) => sum + req.count, 0);

    if (totalRequests >= limit) {
      return false;
    }

    // 记录新请求
    validRequests.push({ timestamp: now, count: 1 });
    return true;
  }

  async getRemainingRequests(key: string): Promise<number> {
    // 实现获取剩余请求数的逻辑
    return 100; // 示例值
  }

  async resetLimit(key: string): Promise<void> {
    this.requests.delete(key);
  }
}
```

### 数据验证

```typescript
import { z } from 'zod';

// 文档验证模式
const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  type: z.enum(['markdown', 'richtext', 'plain']).default('markdown'),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    description: z.string().optional()
  }).optional()
});

// AI 请求验证模式
const GenerateTextRequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'gemini-pro', 'claude-3']).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional()
});

// 验证中间件
function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new APIError({
          code: ErrorCode.INVALID_REQUEST,
          message: '请求参数验证失败',
          details: { validationErrors: error.errors },
          timestamp: new Date()
        });
      }
      throw error;
    }
  };
}

// 使用示例
const validateDocument = validateRequest(DocumentSchema);
const validateGenerateTextRequest = validateRequest(GenerateTextRequestSchema);
```

## 使用示例

### 完整的文档创建和分析流程

```typescript
async function createAndAnalyzeDocument() {
  try {
    // 1. 创建新文档
    const document = await documentService.create({
      title: "API 文档示例",
      content: "# API 文档\n\n这是一个 api 接口的说明...",
      type: "markdown",
      metadata: {
        tags: ["API", "文档"],
        category: "技术文档"
      }
    });

    console.log('文档创建成功:', document.id);

    // 2. 进行语义分析
    const analysis = await aiService.analyzeText({
      text: document.content,
      analysisTypes: ['grammar', 'consistency', 'keywords'],
      options: {
        language: 'zh',
        domain: 'technical'
      }
    });

    console.log('分析完成:', analysis);

    // 3. 处理一致性问题
    for (const issue of analysis.consistencyIssues) {
      if (issue.severity === 'error') {
        console.log(`发现严重问题: ${issue.message}`);
        // 自动修复或提示用户
      }
    }

    // 4. 保存分析结果
    await databaseService.saveAnalysisResult({
      id: generateId(),
      documentId: document.id,
      analysisType: 'full',
      result: JSON.stringify(analysis),
      confidence: 0.85,
      createdAt: new Date()
    });

    // 5. 生成改进建议
    if (analysis.suggestions.length > 0) {
      console.log('改进建议:');
      analysis.suggestions.forEach(suggestion => {
        console.log(`- ${suggestion.message}`);
      });
    }

    return document;

  } catch (error) {
    const apiError = ErrorHandler.handle(error as Error);
    console.error('操作失败:', apiError);
    throw apiError;
  }
}
```

### AI 写作助手集成示例

```typescript
async function aiWritingAssistant() {
  // 1. 配置 AI 服务
  const aiKeyManager = new SecureAPIKeyManager();
  await aiKeyManager.storeAPIKey('openai', 'your-api-key');

  const openaiService = new OpenAIService();
  await openaiService.initialize({
    apiKey: await aiKeyManager.getAPIKey('openai')
  });

  // 2. 生成文章大纲
  const outlinePrompt = "请为'人工智能在教育中的应用'这个主题生成一个详细的文章大纲";
  const outline = await openaiService.generateText({
    prompt: outlinePrompt,
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  });

  console.log('文章大纲:', outline.text);

  // 3. 根据大纲生成内容
  const contentPrompt = `基于以下大纲，写一篇关于人工智能在教育中应用的文章：\n\n${outline.text}`;
  
  // 使用流式生成实时显示内容
  const contentStream = openaiService.generateTextStream({
    prompt: contentPrompt,
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    stream: true
  });

  let fullContent = '';
  for await (const chunk of contentStream) {
    fullContent += chunk.text;
    // 实时更新 UI
    updateEditorContent(fullContent);
  }

  // 4. 创建文档
  const document = await documentService.create({
    title: "人工智能在教育中的应用",
    content: fullContent,
    type: "markdown",
    metadata: {
      tags: ["AI", "教育", "技术"],
      category: "技术文章",
      author: "AI助手"
    }
  });

  // 5. 质量检查
  const qualityCheck = await aiService.analyzeText({
    text: fullContent,
    analysisTypes: ['readability', 'style', 'structure'],
    options: {
      language: 'zh',
      domain: 'academic'
    }
  });

  console.log('质量评分:', qualityCheck.readabilityScore);

  return document;
}
```

这个 API 文档提供了完整的接口说明和使用示例，开发者可以根据这些接口快速集成和扩展应用功能。