import { 
  ModuleAPI, 
  ModuleStatus, 
  TranslationRequest, 
  TranslationResponse,
  ServiceResponse 
} from '../../types/platform';

export class TranslationModule implements ModuleAPI {
  private status: ModuleStatus;
  private apiKey: string | null = null;
  private dictionaryCache: Map<string, Map<string, string>> = new Map();

  constructor() {
    this.status = {
      loaded: false,
      ready: false,
      lastUpdate: new Date(),
      performance: {
        averageResponseTime: 0,
        successRate: 0,
        errorCount: 0
      }
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.loadBasicDictionaries();
      this.apiKey = this.getApiKey();
      this.status.loaded = true;
      this.status.ready = true;
      this.status.lastUpdate = new Date();
    } catch (error) {
      this.status.error = `Initialization failed: ${error}`;
      throw error;
    }
  }

  async process(request: TranslationRequest): Promise<ServiceResponse<TranslationResponse>> {
    const startTime = Date.now();

    try {
      if (!this.status.ready) {
        throw new Error('Module not ready');
      }

      let response: TranslationResponse;

      if (this.apiKey && this.shouldUseAPI(request)) {
        response = await this.translateWithAPI(request);
      } else {
        response = await this.translateLocally(request);
      }

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, true);

      return {
        success: true,
        data: response,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, false);

      return {
        success: false,
        error: {
          code: 'TRANSLATION_FAILED',
          message: 'Failed to translate text',
          details: error
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    this.status.loaded = false;
    this.status.ready = false;
    this.dictionaryCache.clear();
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  private async loadBasicDictionaries(): Promise<void> {
    // 加载基础词典
    const chineseToEnglish = new Map([
      // 常用词汇
      ['你好', 'hello'],
      ['谢谢', 'thank you'],
      ['再见', 'goodbye'],
      ['是的', 'yes'],
      ['不是', 'no'],
      ['请', 'please'],
      ['对不起', 'sorry'],
      ['没关系', 'no problem'],
      
      // 商务词汇
      ['公司', 'company'],
      ['企业', 'enterprise'],
      ['业务', 'business'],
      ['项目', 'project'],
      ['管理', 'management'],
      ['发展', 'development'],
      ['市场', 'market'],
      ['客户', 'customer'],
      ['服务', 'service'],
      ['产品', 'product'],
      ['质量', 'quality'],
      ['技术', 'technology'],
      ['创新', 'innovation'],
      ['解决方案', 'solution'],
      ['合作', 'cooperation'],
      ['团队', 'team'],
      ['领导', 'leadership'],
      ['策略', 'strategy'],
      ['目标', 'goal'],
      ['成功', 'success'],
      
      // 技术词汇
      ['软件', 'software'],
      ['硬件', 'hardware'],
      ['系统', 'system'],
      ['网络', 'network'],
      ['数据', 'data'],
      ['信息', 'information'],
      ['安全', 'security'],
      ['性能', 'performance'],
      ['效率', 'efficiency'],
      ['优化', 'optimization'],
      ['算法', 'algorithm'],
      ['程序', 'program'],
      ['应用', 'application'],
      ['平台', 'platform'],
      ['接口', 'interface'],
      
      // 学术词汇
      ['研究', 'research'],
      ['分析', 'analysis'],
      ['方法', 'method'],
      ['理论', 'theory'],
      ['实验', 'experiment'],
      ['结果', 'result'],
      ['结论', 'conclusion'],
      ['证据', 'evidence'],
      ['假设', 'hypothesis'],
      ['模型', 'model'],
      ['数据', 'data'],
      ['统计', 'statistics'],
      ['评估', 'evaluation'],
      ['测试', 'test'],
      ['验证', 'verification'],
      
      // 形容词
      ['重要', 'important'],
      ['主要', 'main'],
      ['基本', 'basic'],
      ['特殊', 'special'],
      ['一般', 'general'],
      ['具体', 'specific'],
      ['详细', 'detailed'],
      ['简单', 'simple'],
      ['复杂', 'complex'],
      ['困难', 'difficult'],
      ['容易', 'easy'],
      ['快速', 'fast'],
      ['缓慢', 'slow'],
      ['大', 'big'],
      ['小', 'small'],
      ['高', 'high'],
      ['低', 'low'],
      ['新', 'new'],
      ['旧', 'old'],
      ['好', 'good'],
      ['坏', 'bad'],
      
      // 动词
      ['是', 'is'],
      ['有', 'have'],
      ['做', 'do'],
      ['说', 'say'],
      ['去', 'go'],
      ['来', 'come'],
      ['看', 'see'],
      ['听', 'hear'],
      ['想', 'think'],
      ['知道', 'know'],
      ['学习', 'learn'],
      ['工作', 'work'],
      ['生活', 'live'],
      ['使用', 'use'],
      ['创建', 'create'],
      ['建立', 'establish'],
      ['发现', 'discover'],
      ['解决', 'solve'],
      ['改进', 'improve'],
      ['增加', 'increase'],
      ['减少', 'decrease'],
      ['开始', 'start'],
      ['结束', 'end'],
      ['继续', 'continue'],
      ['停止', 'stop']
    ]);

    const englishToChinese = new Map([
      // 反向映射
      ['hello', '你好'],
      ['thank you', '谢谢'],
      ['goodbye', '再见'],
      ['yes', '是的'],
      ['no', '不是'],
      ['please', '请'],
      ['sorry', '对不起'],
      ['company', '公司'],
      ['business', '业务'],
      ['project', '项目'],
      ['management', '管理'],
      ['development', '发展'],
      ['market', '市场'],
      ['customer', '客户'],
      ['service', '服务'],
      ['product', '产品'],
      ['quality', '质量'],
      ['technology', '技术'],
      ['innovation', '创新'],
      ['solution', '解决方案'],
      ['cooperation', '合作'],
      ['team', '团队'],
      ['leadership', '领导'],
      ['strategy', '策略'],
      ['goal', '目标'],
      ['success', '成功'],
      ['software', '软件'],
      ['hardware', '硬件'],
      ['system', '系统'],
      ['network', '网络'],
      ['data', '数据'],
      ['information', '信息'],
      ['security', '安全'],
      ['performance', '性能'],
      ['efficiency', '效率'],
      ['optimization', '优化'],
      ['algorithm', '算法'],
      ['program', '程序'],
      ['application', '应用'],
      ['platform', '平台'],
      ['interface', '接口'],
      ['research', '研究'],
      ['analysis', '分析'],
      ['method', '方法'],
      ['theory', '理论'],
      ['experiment', '实验'],
      ['result', '结果'],
      ['conclusion', '结论'],
      ['evidence', '证据'],
      ['hypothesis', '假设'],
      ['model', '模型'],
      ['statistics', '统计'],
      ['evaluation', '评估'],
      ['test', '测试'],
      ['verification', '验证'],
      ['important', '重要'],
      ['main', '主要'],
      ['basic', '基本'],
      ['special', '特殊'],
      ['general', '一般'],
      ['specific', '具体'],
      ['detailed', '详细'],
      ['simple', '简单'],
      ['complex', '复杂'],
      ['difficult', '困难'],
      ['easy', '容易'],
      ['fast', '快速'],
      ['slow', '缓慢'],
      ['big', '大'],
      ['small', '小'],
      ['high', '高'],
      ['low', '低'],
      ['new', '新'],
      ['old', '旧'],
      ['good', '好'],
      ['bad', '坏']
    ]);

    this.dictionaryCache.set('zh-en', chineseToEnglish);
    this.dictionaryCache.set('en-zh', englishToChinese);
  }

  private shouldUseAPI(request: TranslationRequest): boolean {
    // 对于复杂文本或不常见语言对，使用API
    const { text, fromLanguage, toLanguage } = request;
    
    // 文本长度超过500字符时使用API
    if (text.length > 500) return true;
    
    // 非中英文互译时使用API
    const supportedPairs = ['zh-en', 'en-zh'];
    const languagePair = `${fromLanguage}-${toLanguage}`;
    if (!supportedPairs.includes(languagePair)) return true;
    
    // 包含复杂句式时使用API
    if (this.hasComplexStructure(text)) return true;
    
    return false;
  }

  private hasComplexStructure(text: string): boolean {
    // 检查是否包含复杂句式
    const complexPatterns = [
      /[，。；：！？]{2,}/, // 多个标点符号
      /\([^)]{10,}\)/, // 长括号内容
      /\d+[%‰]/, // 百分比
      /\d{4}-\d{2}-\d{2}/, // 日期
      /[A-Z]{2,}/, // 大写缩写
      /https?:\/\//, // URL
      /\w+@\w+\.\w+/ // 邮箱
    ];
    
    return complexPatterns.some(pattern => pattern.test(text));
  }

  private async translateWithAPI(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildTranslationPrompt(request);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，能够准确翻译各种语言，保持原文的语调和含义。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content || '';

    return this.createTranslationResponse(request, translatedText, 'api');
  }

  private async translateLocally(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, fromLanguage, toLanguage, style } = request;
    
    const languagePair = `${fromLanguage}-${toLanguage}`;
    const dictionary = this.dictionaryCache.get(languagePair);
    
    if (!dictionary) {
      throw new Error(`Unsupported language pair: ${languagePair}`);
    }

    let translatedText = text;
    const translationPairs: Array<{original: string, translated: string}> = [];

    // 词汇级翻译
    for (const [original, translated] of dictionary) {
      const regex = new RegExp(`\\b${this.escapeRegex(original)}\\b`, 'gi');
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length > 0) {
        translationPairs.push({ original, translated });
        translatedText = translatedText.replace(regex, translated);
      }
    }

    // 句式调整
    translatedText = this.adjustSentenceStructure(translatedText, fromLanguage, toLanguage);
    
    // 应用风格
    if (style) {
      translatedText = this.applyTranslationStyle(translatedText, style, toLanguage);
    }

    // 后处理
    translatedText = this.postProcessTranslation(translatedText, fromLanguage, toLanguage);

    return this.createTranslationResponse(request, translatedText, 'local', translationPairs);
  }

  private adjustSentenceStructure(text: string, fromLang: string, toLang: string): string {
    let result = text;

    if (fromLang === 'zh' && toLang === 'en') {
      // 中文到英文的句式调整
      result = this.adjustChineseToEnglish(result);
    } else if (fromLang === 'en' && toLang === 'zh') {
      // 英文到中文的句式调整
      result = this.adjustEnglishToChinese(result);
    }

    return result;
  }

  private adjustChineseToEnglish(text: string): string {
    let result = text;

    // 添加冠词
    result = result.replace(/\b(company|project|system|method)\b/gi, (match) => {
      if (!/\b(the|a|an)\s+/i.test(text.substring(text.indexOf(match) - 10, text.indexOf(match)))) {
        return `the ${match.toLowerCase()}`;
      }
      return match;
    });

    // 调整语序
    result = result.replace(/(\w+)\s+的\s+(\w+)/g, '$2 of $1');
    
    // 添加be动词
    result = result.replace(/(\w+)\s+(important|good|bad|big|small)/gi, '$1 is $2');

    return result;
  }

  private adjustEnglishToChinese(text: string): string {
    let result = text;

    // 移除多余的冠词
    result = result.replace(/\b(the|a|an)\s+/gi, '');
    
    // 调整语序
    result = result.replace(/(\w+)\s+of\s+(\w+)/g, '$2的$1');
    
    // 移除be动词
    result = result.replace(/(\w+)\s+is\s+(\w+)/gi, '$1$2');

    return result;
  }

  private applyTranslationStyle(text: string, style: string, targetLanguage: string): string {
    switch (style) {
      case 'formal':
        return this.makeFormalTranslation(text, targetLanguage);
      case 'casual':
        return this.makeCasualTranslation(text, targetLanguage);
      case 'technical':
        return this.makeTechnicalTranslation(text, targetLanguage);
      case 'literary':
        return this.makeLiteraryTranslation(text, targetLanguage);
      default:
        return text;
    }
  }

  private makeFormalTranslation(text: string, language: string): string {
    if (language === 'en') {
      return text.replace(/\bcan't\b/g, 'cannot')
                 .replace(/\bwon't\b/g, 'will not')
                 .replace(/\bdon't\b/g, 'do not');
    } else if (language === 'zh') {
      return text.replace(/很/g, '非常')
                 .replace(/挺/g, '相当')
                 .replace(/不错/g, '良好');
    }
    return text;
  }

  private makeCasualTranslation(text: string, language: string): string {
    if (language === 'en') {
      return text.replace(/\bcannot\b/g, "can't")
                 .replace(/\bwill not\b/g, "won't")
                 .replace(/\bdo not\b/g, "don't");
    } else if (language === 'zh') {
      return text.replace(/非常/g, '很')
                 .replace(/相当/g, '挺')
                 .replace(/良好/g, '不错');
    }
    return text;
  }

  private makeTechnicalTranslation(text: string, language: string): string {
    // 保持技术术语的准确性
    const technicalTerms: Record<string, Record<string, string>> = {
      en: {
        '算法': 'algorithm',
        '数据结构': 'data structure',
        '接口': 'interface',
        '协议': 'protocol'
      },
      zh: {
        'algorithm': '算法',
        'data structure': '数据结构',
        'interface': '接口',
        'protocol': '协议'
      }
    };

    const terms = technicalTerms[language] || {};
    let result = text;

    for (const [original, technical] of Object.entries(terms)) {
      const regex = new RegExp(`\\b${this.escapeRegex(original)}\\b`, 'gi');
      result = result.replace(regex, technical);
    }

    return result;
  }

  private makeLiteraryTranslation(text: string, language: string): string {
    // 增加文学性表达
    if (language === 'zh') {
      return text.replace(/很美/g, '美不胜收')
                 .replace(/很好/g, '极佳')
                 .replace(/很大/g, '硕大无比');
    } else if (language === 'en') {
      return text.replace(/\bvery beautiful\b/g, 'breathtakingly beautiful')
                 .replace(/\bvery good\b/g, 'excellent')
                 .replace(/\bvery big\b/g, 'enormous');
    }
    return text;
  }

  private postProcessTranslation(text: string, fromLang: string, toLang: string): string {
    let result = text;

    // 清理多余的空格
    result = result.replace(/\s+/g, ' ').trim();
    
    // 修正标点符号
    if (toLang === 'zh') {
      result = result.replace(/\s*,\s*/g, '，')
                     .replace(/\s*\.\s*/g, '。')
                     .replace(/\s*\?\s*/g, '？')
                     .replace(/\s*!\s*/g, '！')
                     .replace(/\s*:\s*/g, '：')
                     .replace(/\s*;\s*/g, '；');
    } else if (toLang === 'en') {
      result = result.replace(/，/g, ', ')
                     .replace(/。/g, '. ')
                     .replace(/？/g, '? ')
                     .replace(/！/g, '! ')
                     .replace(/：/g, ': ')
                     .replace(/；/g, '; ');
    }

    // 首字母大写（英文）
    if (toLang === 'en') {
      result = result.replace(/^\w/, (c) => c.toUpperCase());
      result = result.replace(/\.\s+\w/g, (match) => 
        match.substring(0, match.length - 1) + match.charAt(match.length - 1).toUpperCase()
      );
    }

    return result;
  }

  private buildTranslationPrompt(request: TranslationRequest): string {
    const { text, fromLanguage, toLanguage, style, context } = request;
    
    let prompt = `请将以下文本从${this.getLanguageName(fromLanguage)}翻译成${this.getLanguageName(toLanguage)}：\n\n"${text}"\n\n`;
    
    if (style) {
      prompt += `翻译风格：${this.getStyleDescription(style)}\n`;
    }
    
    if (context) {
      prompt += `上下文：${context}\n`;
    }
    
    prompt += '请保持原文的语调和含义，确保翻译准确自然。';
    
    return prompt;
  }

  private getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'zh': '中文',
      'en': '英文',
      'ja': '日文',
      'ko': '韩文',
      'fr': '法文',
      'de': '德文',
      'es': '西班牙文',
      'ru': '俄文'
    };
    return names[code] || code;
  }

  private getStyleDescription(style: string): string {
    const descriptions: Record<string, string> = {
      'formal': '正式',
      'casual': '随意',
      'technical': '技术',
      'literary': '文学',
      'business': '商务',
      'academic': '学术'
    };
    return descriptions[style] || style;
  }

  private createTranslationResponse(
    request: TranslationRequest,
    translatedText: string,
    method: 'api' | 'local',
    translationPairs?: Array<{original: string, translated: string}>
  ): TranslationResponse {
    const confidence = this.calculateConfidence(request, method);
    const alternatives = this.generateAlternatives(request, translatedText);

    return {
      originalText: request.text,
      translatedText,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      confidence,
      alternatives,
      metadata: {
        method,
        translationPairs: translationPairs || [],
        processingTime: Date.now()
      }
    };
  }

  private calculateConfidence(request: TranslationRequest, method: 'api' | 'local'): number {
    let confidence = method === 'api' ? 0.9 : 0.7;
    
    // 根据文本复杂度调整置信度
    const complexity = this.calculateTextComplexity(request.text);
    confidence *= (1 - complexity * 0.3);
    
    // 根据语言对调整置信度
    const supportedPairs = ['zh-en', 'en-zh'];
    const languagePair = `${request.fromLanguage}-${request.toLanguage}`;
    if (!supportedPairs.includes(languagePair)) {
      confidence *= 0.8;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private calculateTextComplexity(text: string): number {
    let complexity = 0;
    
    // 长度复杂度
    if (text.length > 1000) complexity += 0.3;
    else if (text.length > 500) complexity += 0.2;
    else if (text.length > 200) complexity += 0.1;
    
    // 句式复杂度
    const sentences = text.split(/[.!?。！？]/).length;
    const avgSentenceLength = text.length / sentences;
    if (avgSentenceLength > 100) complexity += 0.2;
    else if (avgSentenceLength > 50) complexity += 0.1;
    
    // 特殊字符复杂度
    if (/[^\w\s\u4e00-\u9fff.,!?。，！？]/.test(text)) complexity += 0.1;
    
    return Math.min(1.0, complexity);
  }

  private generateAlternatives(request: TranslationRequest, primaryTranslation: string): string[] {
    // 生成简单的替代翻译
    const alternatives: string[] = [];
    
    // 基于同义词的替代
    const synonyms: Record<string, string[]> = {
      'good': ['excellent', 'great', 'fine'],
      'bad': ['poor', 'terrible', 'awful'],
      'big': ['large', 'huge', 'enormous'],
      'small': ['tiny', 'little', 'minor'],
      '好': ['优秀', '不错', '良好'],
      '坏': ['差', '糟糕', '不好'],
      '大': ['巨大', '庞大', '宽广'],
      '小': ['微小', '细小', '狭小']
    };
    
    let alternative = primaryTranslation;
    for (const [word, syns] of Object.entries(synonyms)) {
      if (alternative.includes(word) && syns.length > 0) {
        alternative = alternative.replace(word, syns[0]);
        break;
      }
    }
    
    if (alternative !== primaryTranslation) {
      alternatives.push(alternative);
    }
    
    return alternatives.slice(0, 3); // 最多返回3个替代翻译
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getApiKey(): string | null {
    return import.meta.env.VITE_OPENAI_API_KEY || 
           localStorage.getItem('openai_api_key') || 
           null;
  }

  private updatePerformanceMetrics(processingTime: number, success: boolean): void {
    const perf = this.status.performance;
    
    perf.averageResponseTime = (perf.averageResponseTime + processingTime) / 2;
    
    if (!success) {
      perf.errorCount++;
    }
    
    const totalRequests = perf.errorCount + 1;
    perf.successRate = success ? 
      ((perf.successRate * (totalRequests - 1)) + 100) / totalRequests :
      (perf.successRate * (totalRequests - 1)) / totalRequests;
    
    this.status.lastUpdate = new Date();
  }

  private generateRequestId(): string {
    return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default TranslationModule;