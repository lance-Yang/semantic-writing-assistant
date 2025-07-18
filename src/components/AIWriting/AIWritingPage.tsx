import React, { useState, useRef } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Settings, 
  Send, 
  Copy, 
  Download, 
  RefreshCw, 
  Clock, 
  Eye, 
  Trash2,
  ChevronDown,
  Key,
  Globe,
  Zap,
  Brain,
  FileText,
  Wand2,
  MessageSquare,
  History,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Grid3X3,
  List,
  Calendar,
  Search,
  Star,
  Bookmark,
  Filter,
  SortDesc,
  MoreHorizontal,
  Share2,
  Edit3,
  TrendingUp,
  Award,
  Target,
  Layers
} from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  requiresApiKey: boolean;
  description: string;
  color: string;
  status?: 'online' | 'offline' | 'error';
}

interface GenerationResult {
  id: string;
  title: string;
  prompt: string;
  result: string;
  provider: string;
  timestamp: Date;
  wordCount: number;
  category?: string;
  rating?: number;
  tags?: string[];
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'custom',
    name: '自定义API',
    icon: <Settings className="h-4 w-4" />,
    requiresApiKey: true,
    description: '使用自定义API端点',
    color: 'from-gray-500 to-gray-600',
    status: 'offline'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: <Globe className="h-4 w-4" />,
    requiresApiKey: true,
    description: 'Google的多模态AI模型',
    color: 'from-blue-500 to-blue-600',
    status: 'online'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: <Zap className="h-4 w-4" />,
    requiresApiKey: true,
    description: '深度求索AI模型',
    color: 'from-purple-500 to-purple-600',
    status: 'online'
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: <Brain className="h-4 w-4" />,
    requiresApiKey: true,
    description: 'Anthropic Claude AI助手',
    color: 'from-orange-500 to-orange-600',
    status: 'online'
  }
];

const WRITING_TEMPLATES = [
  { id: 'article', name: '文章写作', icon: <FileText className="h-4 w-4" />, description: '新闻文章、博客文章等' },
  { id: 'creative', name: '创意写作', icon: <Sparkles className="h-4 w-4" />, description: '小说、故事、诗歌等' },
  { id: 'business', name: '商务写作', icon: <TrendingUp className="h-4 w-4" />, description: '报告、提案、邮件等' },
  { id: 'academic', name: '学术写作', icon: <Award className="h-4 w-4" />, description: '论文、研究报告等' },
  { id: 'marketing', name: '营销文案', icon: <Target className="h-4 w-4" />, description: '广告文案、产品描述等' },
  { id: 'social', name: '社交媒体', icon: <Share2 className="h-4 w-4" />, description: '微博、朋友圈、短视频文案等' }
];

export const AIWritingPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTitleGenerating, setIsTitleGenerating] = useState<boolean>(false);
  const [showApiConfig, setShowApiConfig] = useState<boolean>(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(null);
  const [currentView, setCurrentView] = useState<'writing' | 'history'>('writing');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'provider'>('date');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  const generateTitle = async () => {
    if (!prompt.trim()) return;
    
    setIsTitleGenerating(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      const titles = [
        '创意写作：探索无限可能',
        '智能文本生成助手',
        '高效内容创作工具',
        '专业写作解决方案',
        'AI驱动的文字创作',
        '数字时代的写作革命',
        '智能化内容生产平台',
        '创新写作体验之旅'
      ];
      setGeneratedTitle(titles[Math.floor(Math.random() * titles.length)]);
    } catch (error) {
      console.error('标题生成失败:', error);
    } finally {
      setIsTitleGenerating(false);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sampleResult = `基于您的提示"${prompt}"，我为您生成了以下高质量内容：

${selectedTemplate ? `【${WRITING_TEMPLATES.find(t => t.id === selectedTemplate)?.name}】` : ''}

这是一个精心设计的AI生成文本内容。在实际应用中，这里会显示来自${currentProvider?.name}的真实AI响应。

✨ 内容特点：
• 结构清晰，逻辑性强
• 语言流畅，表达准确
• 符合中文写作习惯
• 具有较强的可读性和吸引力

🎯 创作亮点：
• 针对性强，符合您的具体需求
• 风格统一，保持专业水准
• 内容丰富，信息量充实
• 易于理解，便于进一步编辑

您可以根据需要进一步编辑和完善这些内容，或者调整提示词重新生成。我们的AI助手将持续为您提供高质量的写作支持。`;

      setResult(sampleResult);
      
      // 添加到历史记录
      const newResult: GenerationResult = {
        id: Date.now().toString(),
        title: generatedTitle || '未命名文档',
        prompt,
        result: sampleResult,
        provider: currentProvider?.name || '',
        timestamp: new Date(),
        wordCount: sampleResult.length,
        category: selectedTemplate || 'general',
        rating: Math.floor(Math.random() * 2) + 4, // 4-5星评分
        tags: ['AI生成', selectedTemplate ? WRITING_TEMPLATES.find(t => t.id === selectedTemplate)?.name || '通用' : '通用']
      };
      
      setResults(prev => [newResult, ...prev]);
      
    } catch (error) {
      console.error('内容生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResult = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedTitle || 'AI生成内容'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
  };

  const viewResult = (result: GenerationResult) => {
    setSelectedResult(result);
    setPrompt(result.prompt);
    setGeneratedTitle(result.title);
    setResult(result.result);
    setSelectedTemplate(result.category || '');
    setCurrentView('writing');
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = WRITING_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const templatePrompts = {
        article: '请写一篇关于[主题]的新闻文章，要求结构清晰，观点明确，语言客观...',
        creative: '请创作一个关于[主题]的创意故事，要求情节生动，人物鲜明，富有想象力...',
        business: '请撰写一份关于[主题]的商务报告，要求数据详实，分析透彻，建议可行...',
        academic: '请写一篇关于[主题]的学术论文，要求论证严密，引用准确，结论可靠...',
        marketing: '请创作一份关于[产品/服务]的营销文案，要求吸引眼球，突出卖点，激发购买欲...',
        social: '请写一条关于[主题]的社交媒体文案，要求简洁有趣，易于传播，引发互动...'
      };
      setPrompt(templatePrompts[templateId as keyof typeof templatePrompts] || '');
    }
  };

  // 过滤和排序逻辑
  let filteredResults = results.filter(result => {
    const matchesSearch = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = filterProvider === 'all' || result.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  filteredResults.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'provider':
        return a.provider.localeCompare(b.provider);
      case 'date':
      default:
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 顶部标题栏 - 增强设计 */}
      <div className="flex-shrink-0 bg-gradient-to-r from-white/95 via-blue-50/80 to-indigo-50/95 dark:from-slate-800/95 dark:via-slate-700/80 dark:to-slate-800/95 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-blue-500/10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                  <PenTool className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white dark:border-slate-800 animate-pulse shadow-lg">
                  <div className="w-full h-full bg-white/30 rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  AI智能写作
                </h1>
                <p className="text-slate-600 dark:text-slate-300 flex items-center space-x-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>多平台AI写作助手，支持智能标题生成和专业内容创作</span>
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI服务在线</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                    <Layers className="h-3 w-3" />
                    <span>{AI_PROVIDERS.filter(p => p.status === 'online').length} 个可用模型</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 视图切换按钮 - 增强设计 */}
              <div className="flex items-center bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-700/80 dark:to-slate-600/80 rounded-2xl p-1.5 shadow-lg backdrop-blur-sm">
                <button
                  onClick={() => setCurrentView('writing')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    currentView === 'writing'
                      ? 'bg-gradient-to-r from-white to-blue-50 dark:from-slate-600 dark:to-slate-500 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/20 transform scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  <span>智能写作</span>
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    currentView === 'history'
                      ? 'bg-gradient-to-r from-white to-blue-50 dark:from-slate-600 dark:to-slate-500 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/20 transform scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span>创作历史</span>
                  {results.length > 0 && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 min-w-[24px] text-center font-bold shadow-lg">
                      {results.length}
                    </span>
                  )}
                </button>
              </div>
              
              {currentView === 'writing' && (
                <button
                  onClick={() => setShowApiConfig(!showApiConfig)}
                  className={`btn-primary transition-all duration-300 px-6 py-3 shadow-lg hover:shadow-xl ${showApiConfig ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : 'shadow-blue-500/30'}`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  API配置
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'writing' ? (
          /* 写作界面 - 全面优化 */
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8 max-w-6xl mx-auto">
              
              {/* API配置面板 - 增强设计 */}
              {showApiConfig && (
                <div className="bg-gradient-to-br from-white/90 via-blue-50/70 to-indigo-50/90 dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-blue-500/20 animate-slide-down">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Key className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">AI服务配置</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">选择并配置您的AI写作助手</p>
                    </div>
                  </div>
                  
                  {/* 服务商选择 - 网格布局 */}
                  <div className="space-y-6">
                    <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">选择AI服务商</label>
                    <div className="grid grid-cols-2 gap-6">
                      {AI_PROVIDERS.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => setSelectedProvider(provider.id)}
                          className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                            selectedProvider === provider.id
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-xl shadow-blue-500/20 scale-105'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:scale-102'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              {provider.icon}
                            </div>
                            <div className="text-left flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-lg">{provider.name}</div>
                                <div className={`w-2 h-2 rounded-full ${
                                  provider.status === 'online' ? 'bg-green-500 animate-pulse' :
                                  provider.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                                }`}></div>
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{provider.description}</div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center space-x-1">
                                <span>{provider.status === 'online' ? '✅ 在线' : provider.status === 'error' ? '❌ 错误' : '⚪ 离线'}</span>
                              </div>
                            </div>
                          </div>
                          {selectedProvider === provider.id && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="h-6 w-6 text-blue-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API密钥配置 */}
                  {currentProvider?.requiresApiKey && (
                    <div className="mt-8 space-y-4">
                      <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                        API密钥配置
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={`输入${currentProvider.name}的API密钥`}
                          className="w-full h-14 pl-12 pr-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-lg"
                        />
                        <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>您的API密钥将安全存储在本地，不会上传到服务器</span>
                      </p>
                    </div>
                  )}

                  {/* 自定义端点配置 */}
                  {selectedProvider === 'custom' && (
                    <div className="mt-8 space-y-4">
                      <label className="block text-lg font-semibold text-slate-700 dark:text-slate-300">
                        自定义API端点
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={customEndpoint}
                          onChange={(e) => setCustomEndpoint(e.target.value)}
                          placeholder="https://api.example.com/v1/chat/completions"
                          className="w-full h-14 pl-12 pr-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-lg"
                        />
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 写作模板选择 - 新增功能 */}
              <div className="bg-gradient-to-br from-white/90 via-purple-50/70 to-pink-50/90 dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">写作模板</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">选择适合的写作类型，获得更精准的AI助手</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {WRITING_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className={`group p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        selectedTemplate === template.id
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg shadow-purple-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          selectedTemplate === template.id
                            ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        } transition-all duration-300`}>
                          {template.icon}
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{template.name}</div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 标题生成区域 - 增强设计 */}
              <div className="bg-gradient-to-br from-white/90 via-yellow-50/70 to-orange-50/90 dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Wand2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">智能标题生成</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">AI将根据您的内容需求自动生成吸引人的标题</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={generatedTitle}
                      onChange={(e) => setGeneratedTitle(e.target.value)}
                      placeholder="AI将根据您的提示自动生成精彩标题..."
                      className="w-full min-h-[80px] p-4 pl-12 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 backdrop-blur-sm resize-none text-lg font-medium"
                      rows={3}
                    />
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  </div>
                  <button
                    onClick={generateTitle}
                    disabled={!prompt.trim() || isTitleGenerating}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-white rounded-2xl font-semibold disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 flex items-center space-x-3 min-w-[140px] justify-center"
                  >
                    {isTitleGenerating ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Wand2 className="h-5 w-5" />
                    )}
                    <span>{isTitleGenerating ? '生成中...' : '生成标题'}</span>
                  </button>
                </div>
              </div>

              {/* 提示词输入区域 - 增强设计 */}
              <div className="bg-gradient-to-br from-white/90 via-green-50/70 to-emerald-50/90 dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">创作提示</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">详细描述您的写作需求，获得更精准的AI创作</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="请详细描述您想要生成的内容类型、风格、主题、目标受众等要求..."
                      className="w-full min-h-[180px] p-6 pl-14 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 backdrop-blur-sm resize-y text-lg leading-relaxed"
                      rows={8}
                    />
                    <MessageSquare className="absolute left-5 top-6 h-6 w-6 text-slate-400" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{prompt.length} 字符</span>
                      </span>
                      {currentProvider && (
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 bg-gradient-to-r ${currentProvider.color} rounded-full shadow-sm`}></div>
                          <span className="font-medium">{currentProvider.name}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            currentProvider.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      )}
                      {selectedTemplate && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                          <span className="font-medium">{WRITING_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={generateContent}
                      disabled={!prompt.trim() || isGenerating}
                      className="px-10 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-2xl font-bold disabled:opacity-50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 flex items-center space-x-3 text-lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>AI创作中...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>开始创作</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 结果展示区域 - 增强设计 */}
              {result && (
                <div className="bg-gradient-to-br from-white/90 via-indigo-50/70 to-purple-50/90 dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">创作成果</h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">AI为您精心创作的高质量内容</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => copyToClipboard(result)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center space-x-2"
                        title="复制到剪贴板"
                      >
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </button>
                      <button
                        onClick={downloadResult}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 flex items-center space-x-2"
                        title="下载文件"
                      >
                        <Download className="h-4 w-4" />
                        <span>下载</span>
                      </button>
                      <button
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex items-center space-x-2"
                        title="分享内容"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>分享</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50/80 to-white/90 dark:from-slate-900/60 dark:to-slate-800/60 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
                    <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans text-slate-700 dark:text-slate-300">
                      {result}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{result.length} 字符</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <div className={`w-3 h-3 bg-gradient-to-r ${currentProvider?.color} rounded-full`}></div>
                        <span className="font-medium">{currentProvider?.name}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">质量评分:</span>
                      <div className="flex space-x-1">
                        {renderStars(5)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 历史记录界面 - 全面优化 */
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8 max-w-7xl mx-auto">
              
              {/* 搜索和筛选栏 - 增强设计 */}
              <div className="bg-gradient-to-r from-white/90 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/90 dark:via-slate-700/80 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-blue-500/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                      <History className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200">创作历史</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400">管理和回顾您的AI写作成果</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{results.length}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">总记录数</div>
                    </div>
                    {searchQuery && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredResults.length}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">匹配结果</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 搜索框 */}
                  <div className="lg:col-span-2 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索标题、提示词、AI服务商或标签..."
                      className="w-full h-14 pl-14 pr-12 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm text-lg"
                    />
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xl"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* 筛选和排序 */}
                  <div className="flex space-x-3">
                    <select
                      value={filterProvider}
                      onChange={(e) => setFilterProvider(e.target.value)}
                      className="flex-1 h-14 px-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      <option value="all">所有服务商</option>
                      {AI_PROVIDERS.map(provider => (
                        <option key={provider.id} value={provider.name}>{provider.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 h-14 px-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      <option value="date">按时间排序</option>
                      <option value="title">按标题排序</option>
                      <option value="provider">按服务商排序</option>
                    </select>
                    
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="h-14 px-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 backdrop-blur-sm"
                    >
                      {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 历史记录展示 */}
              {filteredResults.length === 0 ? (
                <div className="bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 dark:from-slate-800/90 dark:via-slate-700/80 dark:to-slate-800/90 backdrop-blur-2xl rounded-3xl p-20 border border-slate-200/60 dark:border-slate-700/60 shadow-xl text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-300/80 to-slate-400/80 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <History className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    {searchQuery ? '未找到匹配的记录' : '暂无创作历史'}
                  </h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {searchQuery 
                      ? '尝试使用不同的关键词搜索，或清空搜索条件查看所有记录' 
                      : '开始使用AI写作功能，您的创作历程将以精美的形式记录在这里，每一次创作都是一次成长的见证'
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                    >
                      清空搜索条件
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
                  {filteredResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={`group relative bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/95 dark:from-slate-800/95 dark:via-slate-700/80 dark:to-slate-800/95 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden ${
                        viewMode === 'list' ? 'flex items-start space-x-6' : ''
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => viewResult(result)}
                    >
                      {/* 装饰性渐变背景 */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-600/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      {/* 卡片内容 */}
                      <div className={`relative z-10 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                {result.title}
                              </h4>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                                {result.provider}
                              </span>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50">
                                {result.wordCount} 字符
                              </span>
                              {result.rating && (
                                <div className="flex items-center space-x-1">
                                  {renderStars(result.rating)}
                                </div>
                              )}
                            </div>
                            
                            {result.tags && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {result.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200/50 dark:border-purple-700/50"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(result.result);
                              }}
                              className="p-3 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-xl transition-all duration-200 hover:scale-110"
                              title="复制内容"
                            >
                              <Copy className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button
                              className="p-3 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-xl transition-all duration-200 hover:scale-110"
                              title="收藏"
                            >
                              <Bookmark className="h-5 w-5 text-yellow-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteResult(result.id);
                              }}
                              className="p-3 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110"
                              title="删除记录"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 mb-6 border border-slate-200/40 dark:border-slate-700/40 backdrop-blur-sm">
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">创作提示：</span>
                            {result.prompt}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{result.timestamp.toLocaleDateString('zh-CN')}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{result.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Eye className="h-5 w-5" />
                            <span className="text-sm font-semibold">查看详情</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 悬浮效果指示器 */}
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-3xl"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};