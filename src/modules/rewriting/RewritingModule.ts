import { 
  ModuleAPI, 
  ModuleStatus, 
  RewritingRequest, 
  RewritingResponse,
  TextChange,
  ServiceResponse 
} from '../../types/platform';

export class RewritingModule implements ModuleAPI {
  private status: ModuleStatus;
  private synonymDatabase: Map<string, string[]> = new Map();
  private apiKey: string | null = null;

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
      await this.loadSynonymDatabase();
      this.apiKey = this.getApiKey();
      this.status.loaded = true;
      this.status.ready = true;
      this.status.lastUpdate = new Date();
    } catch (error) {
      this.status.error = `Initialization failed: ${error}`;
      throw error;
    }
  }

  async process(request: RewritingRequest): Promise<ServiceResponse<RewritingResponse>> {
    const startTime = Date.now();

    try {
      if (!this.status.ready) {
        throw new Error('Module not ready');
      }

      let response: RewritingResponse;

      if (this.apiKey && request.mode !== 'reduce_similarity') {
        response = await this.rewriteWithAPI(request);
      } else {
        response = await this.rewriteLocally(request);
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
          code: 'REWRITING_FAILED',
          message: 'Failed to rewrite text',
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
    this.synonymDatabase.clear();
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  private async loadSynonymDatabase(): Promise<void> {
    // 加载同义词数据库
    const synonyms = [
      // 常用词汇同义词
      ['重要', ['关键', '核心', '主要', '重点', '关键性']],
      ['提高', ['增强', '改善', '提升', '优化', '强化']],
      ['方法', ['方式', '途径', '手段', '策略', '办法']],
      ['问题', ['难题', '挑战', '困难', '课题', '议题']],
      ['发展', ['进步', '成长', '壮大', '演进', '推进']],
      ['影响', ['作用', '效果', '冲击', '效应', '后果']],
      ['研究', ['调研', '探索', '分析', '考察', '钻研']],
      ['显示', ['表明', '揭示', '反映', '证明', '说明']],
      ['认为', ['觉得', '以为', '相信', '判断', '估计']],
      ['使用', ['运用', '采用', '利用', '应用', '使用']],
      ['创新', ['革新', '创造', '改革', '突破', '创举']],
      ['优秀', ['卓越', '杰出', '出色', '优异', '突出']],
      ['快速', ['迅速', '高速', '快捷', '敏捷', '急速']],
      ['有效', ['高效', '管用', '奏效', '起作用', '见效']],
      ['建设', ['构建', '建立', '创建', '打造', '营造']],
      
      // 形容词同义词
      ['美丽', ['漂亮', '美观', '秀丽', '优美', '精美']],
      ['聪明', ['智慧', '机智', '睿智', '明智', '聪慧']],
      ['困难', ['艰难', '复杂', '棘手', '不易', '艰辛']],
      ['简单', ['容易', '简易', '轻松', '便捷', '方便']],
      ['现代', ['当代', '现今', '当前', '时尚', '新式']],
      
      // 动词同义词
      ['获得', ['取得', '得到', '收获', '赢得', '获取']],
      ['完成', ['完毕', '结束', '达成', '实现', '做完']],
      ['开始', ['启动', '开启', '着手', '起步', '展开']],
      ['继续', ['持续', '延续', '保持', '维持', '坚持']],
      ['改变', ['转变', '变化', '改动', '调整', '修改']],
      
      // 名词同义词
      ['公司', ['企业', '机构', '组织', '单位', '集团']],
      ['产品', ['商品', '物品', '制品', '货物', '用品']],
      ['服务', ['服务项目', '业务', '帮助', '支持', '协助']],
      ['客户', ['用户', '顾客', '消费者', '买家', '委托人']],
      ['市场', ['市面', '商场', '集市', '销售市场', '交易场所']]
    ];

    synonyms.forEach(([word, syns]) => {
      this.synonymDatabase.set(word as string, syns as string[]);
    });
  }

  private async rewriteWithAPI(request: RewritingRequest): Promise<RewritingResponse> {
    const prompt = this.buildRewritingPrompt(request);
    
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
            content: '你是一个专业的文本改写助手，能够根据要求对文本进行改写，保持原意的同时改变表达方式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const rewrittenText = data.choices[0]?.message?.content || '';

    return this.createRewritingResponse(request.text, rewrittenText, request);
  }

  private async rewriteLocally(request: RewritingRequest): Promise<RewritingResponse> {
    const { text, mode, intensity, preserveLength } = request;
    let rewrittenText = text;
    const changes: TextChange[] = [];

    switch (mode) {
      case 'paraphrase':
        rewrittenText = await this.paraphraseText(text, intensity, changes);
        break;
      case 'simplify':
        rewrittenText = await this.simplifyText(text, intensity, changes);
        break;
      case 'formal':
        rewrittenText = await this.formalizeText(text, intensity, changes);
        break;
      case 'casual':
        rewrittenText = await this.casualizeText(text, intensity, changes);
        break;
      case 'reduce_similarity':
        rewrittenText = await this.reduceSimilarity(text, intensity, changes);
        break;
    }

    // 如果需要保持长度，进行调整
    if (preserveLength) {
      rewrittenText = this.adjustLength(rewrittenText, text.length, changes);
    }

    return this.createRewritingResponse(text, rewrittenText, request, changes);
  }

  private async paraphraseText(text: string, intensity: number, changes: TextChange[]): Promise<string> {
    let result = text;
    
    // 使用同义词替换
    for (const [word, synonyms] of this.synonymDatabase) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = Array.from(result.matchAll(regex));
      
      for (const match of matches) {
        if (Math.random() < intensity) {
          const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
          const start = match.index || 0;
          const end = start + word.length;
          
          changes.push({
            type: 'modification',
            original: word,
            modified: synonym,
            position: { start, end },
            reason: '同义词替换'
          });
          
          result = result.substring(0, start) + synonym + result.substring(end);
        }
      }
    }

    // 句式变换
    result = this.transformSentenceStructure(result, intensity, changes);
    
    return result;
  }

  private async simplifyText(text: string, intensity: number, changes: TextChange[]): Promise<string> {
    let result = text;
    
    // 简化复杂词汇
    const complexToSimple: Record<string, string> = {
      '因此': '所以',
      '然而': '但是',
      '尽管': '虽然',
      '此外': '另外',
      '例如': '比如',
      '显著': '明显',
      '充分': '足够',
      '迅速': '很快',
      '优化': '改进',
      '实施': '执行'
    };

    for (const [complex, simple] of Object.entries(complexToSimple)) {
      if (Math.random() < intensity) {
        const regex = new RegExp(`\\b${complex}\\b`, 'g');
        const matches = Array.from(result.matchAll(regex));
        
        for (const match of matches) {
          const start = match.index || 0;
          const end = start + complex.length;
          
          changes.push({
            type: 'modification',
            original: complex,
            modified: simple,
            position: { start, end },
            reason: '词汇简化'
          });
          
          result = result.replace(complex, simple);
        }
      }
    }

    // 简化句式结构
    result = this.simplifySentenceStructure(result, intensity, changes);
    
    return result;
  }

  private async formalizeText(text: string, intensity: number, changes: TextChange[]): Promise<string> {
    let result = text;
    
    // 正式化词汇替换
    const casualToFormal: Record<string, string> = {
      '很好': '优秀',
      '不错': '良好',
      '挺好': '相当不错',
      '厉害': '出色',
      '搞定': '完成',
      '弄清楚': '明确',
      '差不多': '大致',
      '挺多': '相当多',
      '蛮': '相当',
      '搞': '进行'
    };

    for (const [casual, formal] of Object.entries(casualToFormal)) {
      if (Math.random() < intensity) {
        const regex = new RegExp(`\\b${casual}\\b`, 'g');
        result = result.replace(regex, formal);
      }
    }

    return result;
  }

  private async casualizeText(text: string, intensity: number, changes: TextChange[]): Promise<string> {
    let result = text;
    
    // 随意化词汇替换
    const formalToCasual: Record<string, string> = {
      '优秀': '很棒',
      '良好': '不错',
      '出色': '厉害',
      '完成': '搞定',
      '明确': '弄清楚',
      '相当': '挺',
      '进行': '搞',
      '实现': '做到',
      '获得': '拿到',
      '提供': '给'
    };

    for (const [formal, casual] of Object.entries(formalToCasual)) {
      if (Math.random() < intensity) {
        const regex = new RegExp(`\\b${formal}\\b`, 'g');
        result = result.replace(regex, casual);
      }
    }

    return result;
  }

  private async reduceSimilarity(text: string, intensity: number, changes: TextChange[]): Promise<string> {
    let result = text;
    
    // 综合使用多种改写策略
    result = await this.paraphraseText(result, intensity * 0.8, changes);
    result = this.transformSentenceStructure(result, intensity * 0.6, changes);
    result = this.adjustWordOrder(result, intensity * 0.4, changes);
    
    return result;
  }

  private transformSentenceStructure(text: string, intensity: number, changes: TextChange[]): string {
    let result = text;
    
    // 简单的句式变换规则
    const transformations = [
      // 被动语态转主动语态
      {
        pattern: /(.+)被(.+)了/g,
        replacement: '$2$1',
        reason: '被动转主动'
      },
      // 调整句子顺序
      {
        pattern: /因为(.+)，所以(.+)/g,
        replacement: '$2，因为$1',
        reason: '调整因果顺序'
      }
    ];

    for (const transform of transformations) {
      if (Math.random() < intensity) {
        const matches = Array.from(result.matchAll(transform.pattern));
        for (const match of matches) {
          if (match.index !== undefined) {
            changes.push({
              type: 'modification',
              original: match[0],
              modified: match[0].replace(transform.pattern, transform.replacement),
              position: { start: match.index, end: match.index + match[0].length },
              reason: transform.reason
            });
          }
        }
        result = result.replace(transform.pattern, transform.replacement);
      }
    }

    return result;
  }

  private simplifySentenceStructure(text: string, intensity: number, changes: TextChange[]): string {
    let result = text;
    
    // 拆分长句
    const sentences = result.split(/[。！？]/).filter(s => s.trim().length > 0);
    const simplifiedSentences = sentences.map(sentence => {
      if (sentence.length > 50 && Math.random() < intensity) {
        // 尝试在逗号处拆分
        const parts = sentence.split('，');
        if (parts.length > 1) {
          return parts.join('。');
        }
      }
      return sentence;
    });
    
    return simplifiedSentences.join('。') + '。';
  }

  private adjustWordOrder(text: string, intensity: number, changes: TextChange[]): string {
    let result = text;
    
    // 简单的词序调整
    const patterns = [
      {
        pattern: /(\w+)和(\w+)/g,
        replacement: '$2和$1',
        reason: '调整词序'
      }
    ];

    for (const pattern of patterns) {
      if (Math.random() < intensity) {
        result = result.replace(pattern.pattern, pattern.replacement);
      }
    }

    return result;
  }

  private adjustLength(text: string, targetLength: number, changes: TextChange[]): string {
    const currentLength = text.length;
    const difference = targetLength - currentLength;
    
    if (Math.abs(difference) < targetLength * 0.1) {
      return text; // 差异在10%以内，不调整
    }
    
    if (difference > 0) {
      // 需要增加长度
      return this.expandText(text, difference, changes);
    } else {
      // 需要减少长度
      return this.compressText(text, Math.abs(difference), changes);
    }
  }

  private expandText(text: string, targetIncrease: number, changes: TextChange[]): string {
    // 简单的扩展策略：添加修饰词
    let result = text;
    const modifiers = ['非常', '十分', '相当', '极其', '特别'];
    
    let added = 0;
    const words = result.split(/\s+/);
    
    for (let i = 0; i < words.length && added < targetIncrease; i++) {
      if (Math.random() < 0.3) {
        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        words[i] = modifier + words[i];
        added += modifier.length;
      }
    }
    
    return words.join(' ');
  }

  private compressText(text: string, targetDecrease: number, changes: TextChange[]): string {
    // 简单的压缩策略：移除修饰词
    let result = text;
    const unnecessaryWords = ['非常', '十分', '相当', '极其', '特别', '很', '比较'];
    
    for (const word of unnecessaryWords) {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }
    
    return result.trim();
  }

  private buildRewritingPrompt(request: RewritingRequest): string {
    const { text, mode, intensity, preserveLength } = request;
    
    let prompt = `请对以下文本进行改写：\n\n"${text}"\n\n`;
    
    switch (mode) {
      case 'paraphrase':
        prompt += '改写要求：保持原意，但改变表达方式和词汇选择。';
        break;
      case 'simplify':
        prompt += '改写要求：简化表达，使用更简单易懂的词汇和句式。';
        break;
      case 'formal':
        prompt += '改写要求：使用更正式、专业的语言风格。';
        break;
      case 'casual':
        prompt += '改写要求：使用更轻松、随意的语言风格。';
        break;
      case 'reduce_similarity':
        prompt += '改写要求：大幅改变表达方式以降低相似度，但保持核心意思。';
        break;
    }
    
    prompt += `\n改写强度：${Math.round(intensity * 100)}%`;
    
    if (preserveLength) {
      prompt += '\n请保持与原文相近的长度。';
    }
    
    return prompt;
  }

  private createRewritingResponse(
    originalText: string, 
    rewrittenText: string, 
    request: RewritingRequest,
    changes: TextChange[] = []
  ): RewritingResponse {
    const similarityScore = this.calculateSimilarity(originalText, rewrittenText);
    const wordCountChange = rewrittenText.length - originalText.length;
    const readabilityChange = this.calculateReadabilityChange(originalText, rewrittenText);
    const preservedMeaning = this.calculateMeaningPreservation(originalText, rewrittenText);

    return {
      originalText,
      rewrittenText,
      changes,
      similarityScore,
      metadata: {
        wordCountChange,
        readabilityChange,
        preservedMeaning
      }
    };
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // 简化的相似度计算
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateReadabilityChange(text1: string, text2: string): number {
    // 简化的可读性变化计算
    const avgWordLength1 = text1.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text1.split(/\s+/).length;
    const avgWordLength2 = text2.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text2.split(/\s+/).length;
    
    return avgWordLength1 - avgWordLength2;
  }

  private calculateMeaningPreservation(text1: string, text2: string): number {
    // 简化的意思保持度计算
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    
    const preserved = keywords1.filter(kw => keywords2.includes(kw)).length;
    return keywords1.length > 0 ? preserved / keywords1.length : 1;
  }

  private extractKeywords(text: string): string[] {
    // 简单的关键词提取
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['的', '了', '在', '是', '和', '与', '或', '但', '因为', '所以', '如果', '那么']);
    
    return words
      .filter(word => word.length > 1 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index); // 去重
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
    return `rw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RewritingModule;