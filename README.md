# 🚀 Semantic Writing Assistant

一个基于AI的智能写作助手，提供全方位的文本创作、编辑和优化功能。支持多种AI模型，具备语义分析、智能建议、多语言翻译等强大功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.5+-FFC131.svg)

## ✨ 主要特性

### 🤖 AI智能写作
- **多模型支持**：集成Google Gemini、DeepSeek、Claude等主流AI模型
- **写作模板**：提供文章、创意、商务、学术、营销、社交媒体等6种专业模板
- **智能标题生成**：基于内容自动生成吸引人的标题
- **实时预览**：所见即所得的编辑体验

### 📝 富文本编辑
- **现代化编辑器**：支持Markdown、富文本等多种格式
- **实时协作**：多人同时编辑，实时同步
- **版本管理**：自动保存，支持历史版本回溯
- **快捷操作**：丰富的键盘快捷键支持

### 🔍 语义分析
- **智能建议**：基于语义分析提供写作建议
- **语法检查**：实时语法和拼写检查
- **风格优化**：文本风格和语调建议
- **关键词提取**：自动识别和标注关键概念

### 🌍 多语言支持
- **智能翻译**：支持多种语言间的高质量翻译
- **本地化界面**：完整的中文界面支持
- **语言检测**：自动识别文本语言

### 📊 数据分析
- **写作统计**：字数、段落、阅读时间等详细统计
- **质量评分**：基于AI的内容质量评估
- **趋势分析**：写作习惯和效率分析
- **导出报告**：多格式数据导出

### 🎨 现代化UI
- **响应式设计**：完美适配桌面和移动设备
- **主题系统**：支持多种主题切换
- **动画效果**：流畅的交互动画
- **无障碍支持**：符合WCAG标准

## 🛠️ 技术架构

### 前端技术栈
```
React 18.2.0          # 现代化UI框架
TypeScript 5.0+       # 类型安全的JavaScript
Vite 4.5+             # 快速构建工具
Tailwind CSS 3.3+     # 原子化CSS框架
Lucide React          # 现代图标库
Zustand               # 轻量级状态管理
React Router 6        # 路由管理
```

### 后端技术栈
```
Tauri 1.5+            # 跨平台桌面应用框架
Rust                  # 高性能系统编程语言
SQLite                # 轻量级数据库
```

### AI集成
```
OpenAI API            # GPT系列模型
Google Gemini API     # Google多模态AI
Anthropic Claude API  # Claude系列模型
DeepSeek API          # 深度求索模型
```

### 开发工具
```
ESLint                # 代码质量检查
Prettier              # 代码格式化
Vitest                # 单元测试框架
TypeScript ESLint     # TypeScript代码检查
```

## 🚀 快速开始

### 环境要求
- Node.js 18.0+
- Rust 1.70+
- pnpm 8.0+ (推荐) 或 npm 9.0+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/semantic-writing-assistant.git
cd semantic-writing-assistant
```

2. **安装依赖**
```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量文件
nano .env
```

4. **启动开发服务器**
```bash
# 启动前端开发服务器
pnpm dev

# 或启动Tauri开发环境
pnpm tauri dev
```

5. **构建生产版本**
```bash
# 构建Web版本
pnpm build

# 构建桌面应用
pnpm tauri build
```

### 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# AI API配置
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key

# 应用配置
VITE_APP_NAME=Semantic Writing Assistant
VITE_APP_VERSION=1.0.0

# 开发配置
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

## 📖 使用指南

### 1. AI智能写作

#### 配置AI服务
1. 点击右上角的"API配置"按钮
2. 选择要使用的AI服务商
3. 输入对应的API密钥
4. 点击保存配置

#### 选择写作模板
1. 在写作页面选择合适的模板类型
2. 系统会自动填充相应的提示词模板
3. 根据需要修改和完善提示词

#### 生成内容
1. 在提示词输入框中详细描述写作需求
2. 点击"生成标题"创建吸引人的标题
3. 点击"开始创作"生成内容
4. 对生成的内容进行编辑和优化

### 2. 文档编辑

#### 创建新文档
```
快捷键: Ctrl/Cmd + N
```
1. 点击"新建文档"按钮
2. 选择文档模板或从空白开始
3. 开始编写内容

#### 保存文档
```
快捷键: Ctrl/Cmd + S
```
- 支持自动保存功能
- 手动保存：点击保存按钮或使用快捷键
- 支持导出为多种格式（PDF、Word、Markdown等）

#### 协作编辑
1. 点击"分享"按钮获取协作链接
2. 邀请团队成员加入编辑
3. 实时查看其他人的编辑内容
4. 使用评论功能进行讨论

### 3. 语义分析

#### 启用智能分析
1. 在编辑器中选中文本
2. 点击"AI分析"按钮
3. 查看语义分析结果和建议
4. 应用推荐的优化建议

#### 查看分析报告
1. 进入"分析"页面
2. 查看详细的文档分析报告
3. 了解写作质量评分和改进建议
4. 导出分析报告

### 4. 翻译功能

#### 文本翻译
1. 选中需要翻译的文本
2. 点击"翻译"按钮
3. 选择目标语言
4. 查看翻译结果并应用

#### 批量翻译
1. 进入翻译工具页面
2. 上传需要翻译的文档
3. 选择源语言和目标语言
4. 开始批量翻译处理

### 5. 数据管理

#### 历史记录
- 查看所有创作历史
- 按时间、类型、质量等筛选
- 收藏重要的创作内容
- 批量导出历史数据

#### 设置同步
- 配置云端同步
- 设置自动备份
- 管理存储空间
- 导入/导出设置

## 🎯 核心功能详解

### AI写作引擎

#### 支持的AI模型
| 模型 | 特点 | 适用场景 |
|------|------|----------|
| GPT-4 | 通用性强，创意丰富 | 创意写作、文章创作 |
| Gemini Pro | 多模态支持 | 图文结合创作 |
| Claude 3 | 逻辑性强，准确度高 | 学术写作、商务文档 |
| DeepSeek | 中文优化 | 中文内容创作 |

#### 写作模板系统
```typescript
// 模板配置示例
const templates = {
  article: {
    name: "文章写作",
    prompt: "请写一篇关于{topic}的文章...",
    style: "客观、信息性强",
    structure: ["引言", "正文", "结论"]
  },
  creative: {
    name: "创意写作",
    prompt: "请创作一个关于{theme}的故事...",
    style: "富有想象力、情感丰富",
    structure: ["背景设定", "情节发展", "高潮", "结局"]
  }
  // ... 更多模板
}
```

### 语义分析系统

#### 分析维度
- **语法正确性**：语法错误检测和修正建议
- **语义连贯性**：段落间逻辑关系分析
- **风格一致性**：文本风格和语调统一性
- **可读性评估**：基于多项指标的可读性评分
- **关键词密度**：关键概念分布和重要性分析

#### 智能建议类型
```typescript
interface Suggestion {
  type: 'grammar' | 'style' | 'structure' | 'vocabulary';
  priority: 'high' | 'medium' | 'low';
  message: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  confidence: number;
}
```

### 协作系统

#### 实时协作特性
- **多人同时编辑**：支持多用户实时协作
- **冲突解决**：智能合并编辑冲突
- **权限管理**：细粒度的权限控制
- **版本控制**：完整的版本历史追踪

#### 评论和反馈
- **行内评论**：对特定文本段落添加评论
- **建议模式**：提出修改建议而不直接编辑
- **审批流程**：支持文档审批工作流
- **通知系统**：实时通知协作动态

## 🔧 开发指南

### 项目结构
```
semantic-writing-assistant/
├── src/                      # 前端源代码
│   ├── components/          # React组件
│   │   ├── AI/             # AI相关组件
│   │   ├── Editor/         # 编辑器组件
│   │   ├── Layout/         # 布局组件
│   │   └── ui/             # 通用UI组件
│   ├── hooks/              # 自定义Hook
│   ├── services/           # API服务
│   ├── stores/             # 状态管理
│   ├── styles/             # 样式文件
│   ├── types/              # TypeScript类型定义
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri后端代码
│   ├── src/                # Rust源代码
│   ├── Cargo.toml          # Rust依赖配置
│   └── tauri.conf.json     # Tauri配置
├── public/                 # 静态资源
├── docs/                   # 项目文档
└── tests/                  # 测试文件
```

### 代码规范

#### TypeScript规范
```typescript
// 使用严格的类型定义
interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

// 使用泛型提高代码复用性
function createAPIClient<T>(config: APIConfig): APIClient<T> {
  // 实现
}

// 使用枚举定义常量
enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}
```

#### React组件规范
```tsx
// 使用函数组件和Hooks
const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onSave,
  onClose
}) => {
  // 状态管理
  const [content, setContent] = useState(document.content);
  const [isLoading, setIsLoading] = useState(false);

  // 副作用处理
  useEffect(() => {
    // 自动保存逻辑
  }, [content]);

  // 事件处理
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave(content);
    } finally {
      setIsLoading(false);
    }
  }, [content, onSave]);

  return (
    <div className="document-editor">
      {/* 组件内容 */}
    </div>
  );
};
```

### 测试策略

#### 单元测试
```typescript
// 组件测试示例
describe('DocumentEditor', () => {
  it('should save document when save button is clicked', async () => {
    const mockOnSave = jest.fn();
    const { getByRole } = render(
      <DocumentEditor document={mockDocument} onSave={mockOnSave} />
    );

    fireEvent.click(getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
```

#### 集成测试
```typescript
// API集成测试
describe('AI Service Integration', () => {
  it('should generate content using OpenAI API', async () => {
    const aiService = new AIService({
      provider: 'openai',
      apiKey: process.env.TEST_OPENAI_API_KEY
    });

    const result = await aiService.generateText({
      prompt: 'Write a short story about AI',
      maxTokens: 100
    });

    expect(result).toHaveProperty('text');
    expect(result.text.length).toBeGreaterThan(0);
  });
});
```

### 性能优化

#### 代码分割
```typescript
// 路由级别的代码分割
const AIWritingPage = lazy(() => import('./components/AIWriting/AIWritingPage'));
const EditorPage = lazy(() => import('./components/Editor/EditorPage'));

// 组件级别的懒加载
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));
```

#### 状态管理优化
```typescript
// 使用Zustand进行状态管理
interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
}

const useAppStore = create<AppState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  
  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document]
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    )
  }))
}));
```

## 🔌 API参考

### AI服务API

#### 文本生成
```typescript
interface GenerateTextRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

interface GenerateTextResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 使用示例
const response = await aiService.generateText({
  prompt: "写一篇关于人工智能的文章",
  maxTokens: 1000,
  temperature: 0.7
});
```

#### 语义分析
```typescript
interface AnalyzeTextRequest {
  text: string;
  analysisTypes: ('grammar' | 'style' | 'sentiment' | 'keywords')[];
}

interface AnalyzeTextResponse {
  suggestions: Suggestion[];
  semanticTerms: SemanticTerm[];
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  readabilityScore: number;
}
```

### 文档API

#### 文档操作
```typescript
// 创建文档
const document = await documentService.create({
  title: "新文档",
  content: "",
  type: "markdown"
});

// 更新文档
await documentService.update(document.id, {
  content: "更新的内容",
  lastModified: new Date()
});

// 删除文档
await documentService.delete(document.id);

// 获取文档列表
const documents = await documentService.list({
  page: 1,
  limit: 20,
  sortBy: 'lastModified',
  order: 'desc'
});
```

## 🚀 部署指南

### Web版本部署

#### 使用Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod
```

#### 使用Netlify部署
```bash
# 构建项目
npm run build

# 上传dist目录到Netlify
```

#### 使用Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 桌面应用部署

#### 构建桌面应用
```bash
# 构建所有平台
npm run tauri build

# 构建特定平台
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux
```

#### 应用签名和分发
```bash
# macOS应用签名
codesign --force --deep --sign "Developer ID Application: Your Name" ./target/release/bundle/macos/Semantic\ Writing\ Assistant.app

# Windows应用签名
signtool sign /f certificate.pfx /p password ./target/release/bundle/msi/Semantic\ Writing\ Assistant_1.0.0_x64_en-US.msi
```

## 🔒 安全性

### API密钥安全
- 所有API密钥在本地加密存储
- 不会将密钥发送到任何第三方服务器
- 支持环境变量配置，避免硬编码

### 数据隐私
- 用户数据完全在本地处理
- 可选的云端同步采用端到端加密
- 符合GDPR和其他隐私法规要求

### 安全更新
- 定期更新依赖包以修复安全漏洞
- 使用GitHub Security Advisories监控安全问题
- 支持自动安全更新

## 🤝 贡献指南

### 如何贡献

1. **Fork项目**
```bash
git clone https://github.com/your-username/semantic-writing-assistant.git
```

2. **创建功能分支**
```bash
git checkout -b feature/amazing-feature
```

3. **提交更改**
```bash
git commit -m 'Add some amazing feature'
```

4. **推送到分支**
```bash
git push origin feature/amazing-feature
```

5. **创建Pull Request**

### 代码贡献规范

#### 提交信息格式
```
type(scope): description

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

#### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 包含必要的测试
- [ ] 文档已更新
- [ ] 没有破坏性更改（或已标注）
- [ ] 性能影响已评估

## 📋 更新日志

### v1.0.0 (2024-01-15)
#### 新增功能
- ✨ AI智能写作功能
- ✨ 多模型支持（GPT-4、Gemini、Claude、DeepSeek）
- ✨ 写作模板系统
- ✨ 智能标题生成
- ✨ 富文本编辑器
- ✨ 语义分析和智能建议
- ✨ 多语言翻译
- ✨ 实时协作
- ✨ 现代化UI设计

#### 技术改进
- 🔧 基于Tauri的跨平台架构
- 🔧 TypeScript严格模式
- 🔧 完整的测试覆盖
- 🔧 性能优化和代码分割

## 🆘 故障排除

### 常见问题

#### Q: AI服务无法连接
**A:** 检查以下项目：
1. 确认API密钥正确配置
2. 检查网络连接
3. 验证API配额是否充足
4. 查看控制台错误信息

#### Q: 应用启动失败
**A:** 尝试以下解决方案：
1. 清除node_modules并重新安装依赖
2. 检查Node.js和Rust版本是否符合要求
3. 清除应用缓存和配置文件
4. 查看详细错误日志

#### Q: 文档同步问题
**A:** 解决步骤：
1. 检查网络连接状态
2. 验证同步服务配置
3. 手动触发同步操作
4. 检查存储空间是否充足

### 日志和调试

#### 启用调试模式
```bash
# 设置环境变量
export VITE_LOG_LEVEL=debug
export RUST_LOG=debug

# 启动应用
npm run tauri dev
```

#### 查看日志文件
```bash
# macOS
~/Library/Logs/Semantic Writing Assistant/

# Windows
%APPDATA%\Semantic Writing Assistant\logs\

# Linux
~/.local/share/semantic-writing-assistant/logs/
```

## 📞 支持和联系

### 获取帮助
- 📖 [文档中心](https://docs.semantic-writing-assistant.com)
- 💬 [社区论坛](https://community.semantic-writing-assistant.com)
- 🐛 [问题反馈](https://github.com/your-username/semantic-writing-assistant/issues)
- 📧 [邮件支持](mailto:support@semantic-writing-assistant.com)

### 社交媒体
- 🐦 [Twitter](https://twitter.com/semantic_writer)
- 📘 [Facebook](https://facebook.com/semanticwriter)
- 💼 [LinkedIn](https://linkedin.com/company/semantic-writer)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情。

## 🙏 致谢

感谢以下开源项目和服务：
- [React](https://reactjs.org/) - 用户界面框架
- [Tauri](https://tauri.app/) - 跨平台应用框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide](https://lucide.dev/) - 图标库
- [Vite](https://vitejs.dev/) - 构建工具

---

<div align="center">
  <p>用 ❤️ 和 ☕ 制作</p>
  <p>© 2024 Semantic Writing Assistant. All rights reserved.</p>
</div>
