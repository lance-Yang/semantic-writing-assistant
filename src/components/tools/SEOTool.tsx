import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, TrendingUp, Target, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { SEORequest, SEOResponse, SEOSuggestion } from '../../types/platform';
import { platformService } from '../../services/core/platformService';

export const SEOTool: React.FC = () => {
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [contentType, setContentType] = useState<'article' | 'product' | 'landing_page' | 'blog_post'>('article');
  const [targetAudience, setTargetAudience] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !targetKeywords.includes(keywordInput.trim())) {
      setTargetKeywords([...targetKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setTargetKeywords(targetKeywords.filter(k => k !== keyword));
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('请输入要分析的内容');
      return;
    }

    if (targetKeywords.length === 0) {
      setError('请至少添加一个目标关键词');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const request: SEORequest = {
        content,
        targetKeywords,
        contentType,
        targetAudience: targetAudience || undefined
      };

      const response = await platformService.processRequest('seo', request);
      
      if (response.success && response.data) {
        setResult(response.data as SEOResponse);
      } else {
        setError(response.error?.message || 'SEO分析失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEO分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <Target className="h-4 w-4" />;
      case 'structure': return <BarChart3 className="h-4 w-4" />;
      case 'content': return <Search className="h-4 w-4" />;
      case 'technical': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO优化工具</h1>
          <p className="text-gray-600 dark:text-gray-400">分析内容SEO表现，获取优化建议</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 输入区域 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                内容分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 内容输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  待分析内容
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入或粘贴要进行SEO分析的内容..."
                  className="min-h-[200px]"
                />
              </div>

              {/* 目标关键词 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  目标关键词
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="输入关键词"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} variant="outline">
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetKeywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 内容类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容类型
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="article">文章</option>
                  <option value="product">产品页面</option>
                  <option value="landing_page">落地页</option>
                  <option value="blog_post">博客文章</option>
                </select>
              </div>

              {/* 目标受众 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  目标受众（可选）
                </label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="例如：年轻专业人士、技术爱好者等"
                />
              </div>

              {/* 分析按钮 */}
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim() || targetKeywords.length === 0}
                className="w-full"
              >
                {isAnalyzing ? '分析中...' : '开始SEO分析'}
              </Button>

              {/* 错误信息 */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 结果区域 */}
        <div className="space-y-6">
          {result && (
            <>
              {/* SEO评分 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">SEO评分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {result.metadata.seoScore}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">满分100分</div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${result.metadata.seoScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 快速统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>内容统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">字数</span>
                    <span className="font-medium">{result.metadata.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">可读性</span>
                    <span className="font-medium">{result.metadata.readabilityScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">阅读时间</span>
                    <span className="font-medium">{result.metadata.estimatedReadingTime}分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">建议数量</span>
                    <span className="font-medium">{result.suggestions.length}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* 详细结果 */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>分析结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions">优化建议</TabsTrigger>
                <TabsTrigger value="keywords">关键词分析</TabsTrigger>
                <TabsTrigger value="optimized">优化内容</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestions" className="space-y-4">
                {result.suggestions.length > 0 ? (
                  result.suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <Badge variant={getPriorityColor(suggestion.priority) as any}>
                              {suggestion.priority === 'high' ? '高' : 
                               suggestion.priority === 'medium' ? '中' : '低'}优先级
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {suggestion.description}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            <strong>实施方法：</strong>{suggestion.implementation}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            <strong>预期效果：</strong>{suggestion.expectedImpact}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    暂无优化建议
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="keywords" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 关键词密度 */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">关键词密度</h4>
                    <div className="space-y-2">
                      {Object.entries(result.keywordAnalysis.density).map(([keyword, density]) => (
                        <div key={keyword} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{keyword}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(density * 20, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                              {density.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 相关建议 */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">相关关键词建议</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordAnalysis.suggestions.map((suggestion, index) => (
                        <Badge key={index} variant="outline">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="optimized">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">优化后内容</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {result.optimizedContent}
                    </pre>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigator.clipboard.writeText(result.optimizedContent)}
                    >
                      复制优化内容
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};