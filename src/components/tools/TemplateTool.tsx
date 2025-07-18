import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Search, Star, Clock, Users, Plus, Copy, Download } from 'lucide-react';
import { Template, TemplateRequest, TemplateResponse, TemplateVariable } from '../../types/platform';
import { platformService } from '../../services/core/platformService';

export const TemplateTool: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [customizations, setCustomizations] = useState<{
    style?: string;
    tone?: string;
    length?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TemplateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // 模拟获取模板数据
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // 在实际应用中，这里会从模板模块获取数据
    const mockTemplates: Template[] = [
      {
        id: 'news_template',
        name: '新闻稿模板',
        category: '新闻媒体',
        description: '标准新闻稿格式，适用于企业新闻发布',
        variables: [
          { name: 'title', type: 'text', label: '新闻标题', required: true },
          { name: 'company', type: 'text', label: '公司名称', required: true },
          { name: 'content', type: 'multiline', label: '新闻内容', required: true }
        ],
        content: '# {{title}}\n\n{{content}}\n\n关于{{company}}：\n{{company}}是一家专注于创新的企业。',
        tags: ['新闻', '媒体', '企业'],
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: 156,
        rating: 4.8
      },
      {
        id: 'product_template',
        name: '产品介绍模板',
        category: '营销推广',
        description: '产品功能介绍和卖点展示模板',
        variables: [
          { name: 'product_name', type: 'text', label: '产品名称', required: true },
          { name: 'features', type: 'multiline', label: '主要功能', required: true },
          { name: 'target_audience', type: 'text', label: '目标用户', required: true }
        ],
        content: '# {{product_name}}\n\n## 产品概述\n{{product_name}}专为{{target_audience}}设计。\n\n## 核心功能\n{{features}}',
        tags: ['产品', '营销', '介绍'],
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: 89,
        rating: 4.6
      }
    ];
    setTemplates(mockTemplates);
  };

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // 初始化变量值
    const initialVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        initialVariables[variable.name] = variable.defaultValue;
      } else {
        initialVariables[variable.name] = '';
      }
    });
    setVariables(initialVariables);
    setActiveTab('generate');
  };

  const handleVariableChange = (name: string, value: any) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    // 验证必需字段
    const missingRequired = selectedTemplate.variables
      .filter(v => v.required && !variables[v.name])
      .map(v => v.label);

    if (missingRequired.length > 0) {
      setError(`请填写必需字段: ${missingRequired.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: TemplateRequest = {
        templateId: selectedTemplate.id,
        variables,
        customizations
      };

      const response = await platformService.processRequest('template', request);
      
      if (response.success && response.data) {
        setResult(response.data as TemplateResponse);
        setActiveTab('result');
      } else {
        setError(response.error?.message || '生成失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variables[variable.name] || '';

    switch (variable.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
          />
        );
      case 'multiline':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
            className="min-h-[100px]"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value))}
            placeholder={variable.description}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">请选择...</option>
            {variable.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={variable.description}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">写作模板</h1>
          <p className="text-gray-600 dark:text-gray-400">使用专业模板快速创建高质量内容</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">浏览模板</TabsTrigger>
          <TabsTrigger value="generate" disabled={!selectedTemplate}>生成内容</TabsTrigger>
          <TabsTrigger value="result" disabled={!result}>生成结果</TabsTrigger>
        </TabsList>

        {/* 浏览模板 */}
        <TabsContent value="browse" className="space-y-6">
          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索模板..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">所有分类</option>
                    {categories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 模板列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.usage} 次使用
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {template.variables.length} 个变量
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                  >
                    使用此模板
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">没有找到匹配的模板</p>
            </div>
          )}
        </TabsContent>

        {/* 生成内容 */}
        <TabsContent value="generate" className="space-y-6">
          {selectedTemplate && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>模板信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-medium">{selectedTemplate.name}</h3>
                    <Badge variant="secondary">{selectedTemplate.category}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTemplate.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 变量输入 */}
                <Card>
                  <CardHeader>
                    <CardTitle>填写变量</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable.name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {variable.label}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderVariableInput(variable)}
                        {variable.description && (
                          <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 自定义设置 */}
                <Card>
                  <CardHeader>
                    <CardTitle>自定义设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        写作风格
                      </label>
                      <select
                        value={customizations.style || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, style: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">默认</option>
                        <option value="formal">正式</option>
                        <option value="casual">随意</option>
                        <option value="professional">专业</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        语调
                      </label>
                      <select
                        value={customizations.tone || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, tone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">默认</option>
                        <option value="friendly">友好</option>
                        <option value="authoritative">权威</option>
                        <option value="persuasive">说服性</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        内容长度
                      </label>
                      <select
                        value={customizations.length || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, length: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">默认</option>
                        <option value="short">简短</option>
                        <option value="long">详细</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? '生成中...' : '生成内容'}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* 生成结果 */}
        <TabsContent value="result" className="space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>生成结果</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(result.generatedContent)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([result.generatedContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'generated-content.txt';
                          a.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {result.generatedContent}
                    </pre>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {result.metadata.wordCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">字数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.metadata.estimatedReadingTime}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">分钟阅读</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {result.metadata.generationTime}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">生成时间</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('generate')}
                >
                  重新生成
                </Button>
                <Button 
                  onClick={() => setActiveTab('browse')}
                >
                  选择其他模板
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};