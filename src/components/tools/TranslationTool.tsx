import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Languages, ArrowRightLeft, Copy, Download, RefreshCw, Globe, Star } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { TranslationRequest, TranslationResponse } from '../../types/platform';
import platformService from '../../services/core/platformService';

interface TranslationToolProps {
  onResult?: (result: TranslationResponse) => void;
}

const TranslationTool: React.FC<TranslationToolProps> = ({ onResult }) => {
  const [inputText, setInputText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('zh');
  const [toLanguage, setToLanguage] = useState('en');
  const [style, setStyle] = useState<TranslationRequest['style']>('formal');
  const [context, setContext] = useState('');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const { toast } = useToast();

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const styleOptions = [
    { value: 'formal', label: '正式', description: '适合商务和学术场合' },
    { value: 'casual', label: '随意', description: '适合日常对话和非正式场合' },
    { value: 'technical', label: '技术', description: '适合技术文档和专业术语' },
    { value: 'literary', label: '文学', description: '适合文学作品和创意写作' },
    { value: 'business', label: '商务', description: '适合商业文档和合同' },
    { value: 'academic', label: '学术', description: '适合学术论文和研究报告' }
  ];

  const commonLanguagePairs = [
    { from: 'zh', to: 'en', label: '中文 → 英文' },
    { from: 'en', to: 'zh', label: '英文 → 中文' },
    { from: 'zh', to: 'ja', label: '中文 → 日文' },
    { from: 'zh', to: 'ko', label: '中文 → 韩文' },
    { from: 'en', to: 'ja', label: '英文 → 日文' },
    { from: 'en', to: 'fr', label: '英文 → 法文' }
  ];

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: '请输入文本',
        description: '请先输入需要翻译的文本内容',
        variant: 'destructive'
      });
      return;
    }

    if (fromLanguage === toLanguage) {
      toast({
        title: '语言设置错误',
        description: '源语言和目标语言不能相同',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const request: TranslationRequest = {
        text: inputText,
        fromLanguage,
        toLanguage,
        style,
        context: context || undefined,
        preserveFormatting
      };

      const translationModule = platformService.getModule('translation');
      if (!translationModule) {
        throw new Error('翻译模块未加载');
      }

      const response = await translationModule.process(request);
      
      if (response.success) {
        const translationResult = response.data as TranslationResponse;
        setResult(translationResult);
        setActiveTab('result');
        onResult?.(translationResult);
        
        toast({
          title: '翻译完成',
          description: `置信度: ${(translationResult.confidence * 100).toFixed(1)}%`
        });
      } else {
        throw new Error(response.error?.message || '翻译失败');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: '翻译失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, fromLanguage, toLanguage, style, context, preserveFormatting, onResult, toast]);

  const swapLanguages = useCallback(() => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  }, [fromLanguage, toLanguage]);

  const setLanguagePair = useCallback((from: string, to: string) => {
    setFromLanguage(from);
    setToLanguage(to);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '已复制',
        description: '文本已复制到剪贴板'
      });
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法复制到剪贴板',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const downloadResult = useCallback(() => {
    if (!result) return;

    const fromLang = languages.find(l => l.code === result.fromLanguage)?.name || result.fromLanguage;
    const toLang = languages.find(l => l.code === result.toLanguage)?.name || result.toLanguage;

    let content = `翻译结果 (${fromLang} → ${toLang})\n`;
    content += `=================================\n\n`;
    content += `原文：\n${result.originalText}\n\n`;
    content += `译文：\n${result.translatedText}\n\n`;
    
    if (result.alternatives.length > 0) {
      content += `备选翻译：\n${result.alternatives.map((alt, index) => `${index + 1}. ${alt}`).join('\n')}\n\n`;
    }
    
    content += `翻译信息：\n`;
    content += `- 置信度：${(result.confidence * 100).toFixed(1)}%\n`;
    content += `- 翻译方式：${result.metadata.method === 'api' ? 'AI翻译' : '本地翻译'}\n`;
    content += `- 处理时间：${result.metadata.processingTime}ms\n`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `翻译结果_${fromLang}到${toLang}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result, languages]);

  const getLanguageDisplay = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderTranslationPairs = () => {
    if (!result?.metadata.translationPairs || result.metadata.translationPairs.length === 0) {
      return <p className="text-muted-foreground">无详细翻译对照</p>;
    }

    return (
      <div className="space-y-2">
        {result.metadata.translationPairs.map((pair, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">原文：</p>
                <p className="p-2 bg-blue-50 border border-blue-200 rounded">
                  {pair.original}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">译文：</p>
                <p className="p-2 bg-green-50 border border-green-200 rounded">
                  {pair.translated}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">智能翻译</h1>
        <p className="text-muted-foreground">
          支持多语言互译，提供多种翻译风格和高质量翻译结果
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">翻译设置</TabsTrigger>
          <TabsTrigger value="result" disabled={!result}>翻译结果</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!result}>详细分析</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                语言设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">源语言</label>
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapLanguages}
                  className="mt-6"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">目标语言</label>
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">常用语言对</label>
                <div className="flex flex-wrap gap-2">
                  {commonLanguagePairs.map((pair) => (
                    <Button
                      key={`${pair.from}-${pair.to}`}
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguagePair(pair.from, pair.to)}
                      className={fromLanguage === pair.from && toLanguage === pair.to ? 'bg-blue-50 border-blue-300' : ''}
                    >
                      {pair.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">翻译风格</label>
                  <Select value={style || ''} onValueChange={(value) => setStyle(value as TranslationRequest['style'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="preserve-formatting"
                    checked={preserveFormatting}
                    onCheckedChange={setPreserveFormatting}
                  />
                  <label htmlFor="preserve-formatting" className="text-sm font-medium">
                    保持格式
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">上下文信息（可选）</label>
                <Textarea
                  placeholder="提供相关背景信息以获得更准确的翻译结果"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>翻译文本</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {getLanguageDisplay(fromLanguage)}
                  </label>
                  <Textarea
                    placeholder="请输入需要翻译的文本..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={10}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">
                      字数: {inputText.length}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {getLanguageDisplay(toLanguage)}
                  </label>
                  <div className="h-[250px] p-3 border border-dashed border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      翻译结果将显示在这里
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button 
                  onClick={handleTranslate} 
                  disabled={isProcessing || !inputText.trim()}
                  className="flex items-center gap-2 px-8"
                  size="lg"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4" />
                  )}
                  {isProcessing ? '翻译中...' : '开始翻译'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      翻译结果
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(result.confidence)}>
                        置信度: {(result.confidence * 100).toFixed(1)}%
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.translatedText)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadResult}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </Button>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {getLanguageDisplay(result.fromLanguage)}
                      </h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        {result.originalText}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {getLanguageDisplay(result.toLanguage)}
                      </h3>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        {result.translatedText}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.alternatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>备选翻译</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.alternatives.map((alternative, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="flex-1">{alternative}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(alternative)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>翻译信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">置信度</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.metadata.method === 'api' ? 'AI' : '本地'}
                      </div>
                      <div className="text-sm text-muted-foreground">翻译方式</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.metadata.processingTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">处理时间</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {result.alternatives.length}
                      </div>
                      <div className="text-sm text-muted-foreground">备选方案</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>翻译对照分析</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTranslationPairs()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationTool;