import { 
  ModuleAPI, 
  ModuleStatus, 
  SummarizationRequest, 
  SummarizationResponse,
  ExpansionRequest,
  ExpansionResponse,
  ServiceResponse 
} from '../../types/platform';

export class SummarizationModule implements ModuleAPI {
  private status: ModuleStatus;
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
      this.apiKey = this.getApiKey();
      this.status.loaded = true;
      this.status.ready = true;
      this.status.lastUpdate = new Date();
    } catch (error) {
      this.status.error = `Initialization failed: ${error}`;
      throw error;
    }
  }

  async process(request: SummarizationRequest | ExpansionRequest): Promise<ServiceResponse<SummarizationResponse | ExpansionResponse>> {
    const startTime = Date.now();

    try {
      if (!this.status.ready) {
        throw new Error('Module not ready');
      }

      let response: SummarizationResponse | ExpansionResponse;

      if ('summaryType' in request) {
        // 摘要请求
        response = await this.processSummarization(request as SummarizationRequest);
      } else {
        // 扩展请求
        response = await this.processExpansion(request as ExpansionRequest);
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
          code: 'SUMMARIZATION_FAILED',
          message: 'Failed to process text',
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
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  private async processSummarization(request: SummarizationRequest): Promise<SummarizationResponse> {
    const { text, summaryType, length, language, includeKeyPoints } = request;

    if (this.apiKey) {
      return await this.summarizeWithAPI(request);
    } else {
      return await this.summarizeLocally(request);
    }
  }

  private async processExpansion(request: ExpansionRequest): Promise<ExpansionResponse> {
    const { text, expansionType, targetLength, style, addExamples } = request;

    if (this.apiKey) {
      return await this.expandWithAPI(request);
    } else {
      return await this.expandLocally(request);
    }
  }

  private async summarizeWithAPI(request: SummarizationRequest): Promise<SummarizationResponse> {
    const prompt = this.buildSummarizationPrompt(request);
    
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
            content: '你是一个专业的文本摘要助手，能够根据要求生成不同类型的摘要。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0]?.message?.content || '';

    return this.createSummarizationResponse(request, summaryText);
  }

  private async summarizeLocally(request: SummarizationRequest): Promise<SummarizationResponse> {
    const { text, summaryType, length, includeKeyPoints } = request;
    
    // 分句处理
    const sentences = this.splitIntoSentences(text);
    
    // 计算句子重要性分数
    const sentenceScores = this.calculateSentenceScores(sentences, text);
    
    // 根据摘要类型和长度选择句子
    const selectedSentences = this.selectSentences(sentences, sentenceScores, summaryType, length);
    
    // 生成摘要
    let summaryText = selectedSentences.join(' ');
    
    // 根据摘要类型进行后处理
    summaryText = this.postProcessSummary(summaryText, summaryType);
    
    // 提取关键点
    const keyPoints = includeKeyPoints ? this.extractKeyPoints(text) : [];
    
    return this.createSummarizationResponse(request, summaryText, keyPoints);
  }

  private async expandWithAPI(request: ExpansionRequest): Promise<ExpansionResponse> {
    const prompt = this.buildExpansionPrompt(request);
    
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
            content: '你是一个专业的文本扩展助手，能够根据要求对文本进行详细扩展。'
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
    const expandedText = data.choices[0]?.message?.content || '';

    return this.createExpansionResponse(request, expandedText);
  }

  private async expandLocally(request: ExpansionRequest): Promise<ExpansionResponse> {
    const { text, expansionType, targetLength, style, addExamples } = request;
    
    let expandedText = text;
    
    switch (expansionType) {
      case 'detailed':
        expandedText = this.addDetailedExplanations(text);
        break;
      case 'examples':
        expandedText = this.addExamples(text);
        break;
      case 'background':
        expandedText = this.addBackgroundInfo(text);
        break;
      case 'analysis':
        expandedText = this.addAnalysis(text);
        break;
    }
    
    // 调整长度
    if (targetLength) {
      expandedText = this.adjustToTargetLength(expandedText, targetLength);
    }
    
    // 应用样式
    if (style) {
      expandedText = this.applyStyle(expandedText, style);
    }
    
    return this.createExpansionResponse(request, expandedText);
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[。！？.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private calculateSentenceScores(sentences: string[], fullText: string): number[] {
    const wordFreq = this.calculateWordFrequency(fullText);
    
    return sentences.map(sentence => {
      const words = sentence.split(/\s+/);
      let score = 0;
      
      // 基于词频的分数
      for (const word of words) {
        score += wordFreq.get(word.toLowerCase()) || 0;
      }
      
      // 位置权重（开头和结尾的句子更重要）
      const position = sentences.indexOf(sentence);
      const positionWeight = position < 2 || position >= sentences.length - 2 ? 1.2 : 1.0;
      
      // 长度权重（适中长度的句子更重要）
      const lengthWeight = sentence.length > 20 && sentence.length < 100 ? 1.1 : 0.9;
      
      return score * positionWeight * lengthWeight;
    });
  }

  private calculateWordFrequency(text: string): Map<string, number> {
    const words = text.toLowerCase().split(/\s+/);
    const freq = new Map<string, number>();
    
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
    
    return freq;
  }

  private selectSentences(
    sentences: string[], 
    scores: number[], 
    summaryType: string, 
    length: 'short' | 'medium' | 'long'
  ): string[] {
    const lengthRatios = {
      short: 0.2,
      medium: 0.4,
      long: 0.6
    };
    
    const targetCount = Math.max(1, Math.floor(sentences.length * lengthRatios[length]));
    
    // 根据分数排序并选择
    const indexedSentences = sentences.map((sentence, index) => ({
      sentence,
      score: scores[index],
      index
    }));
    
    indexedSentences.sort((a, b) => b.score - a.score);
    
    const selected = indexedSentences
      .slice(0, targetCount)
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);
    
    return selected;
  }

  private postProcessSummary(summary: string, summaryType: string): string {
    switch (summaryType) {
      case 'abstract':
        return `摘要：${summary}`;
      case 'executive':
        return `执行摘要：${summary}`;
      case 'bullet_points':
        const points = summary.split(/[。！？]/).filter(s => s.trim().length > 0);
        return points.map(point => `• ${point.trim()}`).join('\n');
      case 'outline':
        return this.createOutline(summary);
      default:
        return summary;
    }
  }

  private createOutline(text: string): string {
    const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);
    let outline = '';
    
    sentences.forEach((sentence, index) => {
      outline += `${index + 1}. ${sentence.trim()}\n`;
    });
    
    return outline;
  }

  private extractKeyPoints(text: string): string[] {
    // 简单的关键点提取
    const sentences = this.splitIntoSentences(text);
    const keywordPatterns = [
      /重要|关键|核心|主要|首要/,
      /因此|所以|总之|综上/,
      /第一|首先|其次|最后|最终/,
      /需要|必须|应该|建议/
    ];
    
    const keyPoints: string[] = [];
    
    for (const sentence of sentences) {
      for (const pattern of keywordPatterns) {
        if (pattern.test(sentence) && keyPoints.length < 5) {
          keyPoints.push(sentence.trim());
          break;
        }
      }
    }
    
    return keyPoints;
  }

  private addDetailedExplanations(text: string): string {
    const sentences = this.splitIntoSentences(text);
    const expandedSentences: string[] = [];
    
    for (const sentence of sentences) {
      expandedSentences.push(sentence);
      
      // 为某些句子添加详细解释
      if (this.shouldAddExplanation(sentence)) {
        const explanation = this.generateExplanation(sentence);
        expandedSentences.push(explanation);
      }
    }
    
    return expandedSentences.join('。');
  }

  private addExamples(text: string): string {
    const sentences = this.splitIntoSentences(text);
    const expandedSentences: string[] = [];
    
    for (const sentence of sentences) {
      expandedSentences.push(sentence);
      
      // 为某些句子添加例子
      if (this.shouldAddExample(sentence)) {
        const example = this.generateExample(sentence);
        expandedSentences.push(example);
      }
    }
    
    return expandedSentences.join('。');
  }

  private addBackgroundInfo(text: string): string {
    const introduction = this.generateIntroduction(text);
    return `${introduction} ${text}`;
  }

  private addAnalysis(text: string): string {
    const analysis = this.generateAnalysis(text);
    return `${text} ${analysis}`;
  }

  private shouldAddExplanation(sentence: string): boolean {
    const explanationTriggers = ['因为', '由于', '原因', '导致', '影响'];
    return explanationTriggers.some(trigger => sentence.includes(trigger));
  }

  private shouldAddExample(sentence: string): boolean {
    const exampleTriggers = ['例如', '比如', '包括', '如', '等'];
    return exampleTriggers.some(trigger => sentence.includes(trigger)) && Math.random() > 0.5;
  }

  private generateExplanation(sentence: string): string {
    // 简单的解释生成
    const explanations = [
      '这主要是因为相关因素的综合作用',
      '具体来说，这涉及到多个方面的考虑',
      '从技术角度来看，这需要考虑实际应用场景',
      '进一步分析可以发现其深层原因',
      '这种情况在实践中比较常见'
    ];
    
    return explanations[Math.floor(Math.random() * explanations.length)];
  }

  private generateExample(sentence: string): string {
    // 简单的例子生成
    const examples = [
      '例如，在实际应用中我们可以看到类似的情况',
      '比如说，相关领域的研究也证实了这一点',
      '具体而言，这在多个案例中都有体现',
      '举例来说，业界的最佳实践也支持这种观点',
      '实际案例表明，这种方法确实有效'
    ];
    
    return examples[Math.floor(Math.random() * examples.length)];
  }

  private generateIntroduction(text: string): string {
    const keywords = this.extractKeywords(text);
    const mainTopic = keywords[0] || '该主题';
    
    return `关于${mainTopic}，我们需要从多个角度进行深入了解。`;
  }

  private generateAnalysis(text: string): string {
    return '综合分析以上内容，我们可以看出这些要点之间存在密切联系，对于理解整体情况具有重要意义。进一步的研究和实践将有助于深化我们的认识。';
  }

  private adjustToTargetLength(text: string, targetLength: number): string {
    const currentLength = text.length;
    const ratio = targetLength / currentLength;
    
    if (ratio > 1.2) {
      // 需要大幅扩展
      return this.expandSignificantly(text, ratio);
    } else if (ratio < 0.8) {
      // 需要压缩
      return this.compressText(text, ratio);
    }
    
    return text;
  }

  private expandSignificantly(text: string, ratio: number): string {
    const sentences = this.splitIntoSentences(text);
    const expandedSentences: string[] = [];
    
    for (const sentence of sentences) {
      expandedSentences.push(sentence);
      
      // 添加补充说明
      if (Math.random() < 0.6) {
        expandedSentences.push('这一点在实际应用中具有重要意义');
      }
      
      // 添加更多细节
      if (Math.random() < 0.4) {
        expandedSentences.push('相关研究表明，这种方法的有效性已得到验证');
      }
    }
    
    return expandedSentences.join('。');
  }

  private compressText(text: string, ratio: number): string {
    const sentences = this.splitIntoSentences(text);
    const targetCount = Math.max(1, Math.floor(sentences.length * ratio));
    
    // 保留最重要的句子
    const scores = this.calculateSentenceScores(sentences, text);
    const indexedSentences = sentences.map((sentence, index) => ({
      sentence,
      score: scores[index],
      index
    }));
    
    indexedSentences.sort((a, b) => b.score - a.score);
    
    return indexedSentences
      .slice(0, targetCount)
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence)
      .join('。');
  }

  private applyStyle(text: string, style: string): string {
    switch (style) {
      case 'formal':
        return this.makeFormal(text);
      case 'casual':
        return this.makeCasual(text);
      case 'academic':
        return this.makeAcademic(text);
      case 'business':
        return this.makeBusiness(text);
      default:
        return text;
    }
  }

  private makeFormal(text: string): string {
    // 正式化处理
    return text.replace(/很/g, '非常')
               .replace(/挺/g, '相当')
               .replace(/不错/g, '良好');
  }

  private makeCasual(text: string): string {
    // 随意化处理
    return text.replace(/非常/g, '很')
               .replace(/相当/g, '挺')
               .replace(/良好/g, '不错');
  }

  private makeAcademic(text: string): string {
    // 学术化处理
    return `根据相关研究，${text}。这一观点在学术界得到了广泛认同。`;
  }

  private makeBusiness(text: string): string {
    // 商务化处理
    return `从商业角度来看，${text}。这对企业发展具有重要的战略意义。`;
  }

  private buildSummarizationPrompt(request: SummarizationRequest): string {
    const { text, summaryType, length, language, includeKeyPoints } = request;
    
    let prompt = `请对以下文本进行摘要：\n\n"${text}"\n\n`;
    
    prompt += `摘要类型：${this.getSummaryTypeDescription(summaryType)}\n`;
    prompt += `摘要长度：${this.getLengthDescription(length)}\n`;
    
    if (language) {
      prompt += `输出语言：${language}\n`;
    }
    
    if (includeKeyPoints) {
      prompt += '请同时提取关键要点。\n';
    }
    
    return prompt;
  }

  private buildExpansionPrompt(request: ExpansionRequest): string {
    const { text, expansionType, targetLength, style, addExamples } = request;
    
    let prompt = `请对以下文本进行扩展：\n\n"${text}"\n\n`;
    
    prompt += `扩展类型：${this.getExpansionTypeDescription(expansionType)}\n`;
    
    if (targetLength) {
      prompt += `目标长度：约${targetLength}字\n`;
    }
    
    if (style) {
      prompt += `写作风格：${style}\n`;
    }
    
    if (addExamples) {
      prompt += '请添加相关例子和说明。\n';
    }
    
    return prompt;
  }

  private getSummaryTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      abstract: '学术摘要',
      executive: '执行摘要',
      bullet_points: '要点列表',
      outline: '大纲形式'
    };
    return descriptions[type] || '一般摘要';
  }

  private getLengthDescription(length: string): string {
    const descriptions: Record<string, string> = {
      short: '简短（原文20%左右）',
      medium: '中等（原文40%左右）',
      long: '详细（原文60%左右）'
    };
    return descriptions[length] || '中等长度';
  }

  private getExpansionTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      detailed: '详细解释',
      examples: '添加例子',
      background: '背景信息',
      analysis: '深入分析'
    };
    return descriptions[type] || '一般扩展';
  }

  private createSummarizationResponse(
    request: SummarizationRequest, 
    summaryText: string, 
    keyPoints: string[] = []
  ): SummarizationResponse {
    const compressionRatio = summaryText.length / request.text.length;
    const wordCount = summaryText.split(/\s+/).length;
    const readabilityScore = this.calculateReadability(summaryText);

    return {
      originalText: request.text,
      summaryText,
      keyPoints,
      metadata: {
        compressionRatio,
        wordCount,
        readabilityScore
      }
    };
  }

  private createExpansionResponse(
    request: ExpansionRequest, 
    expandedText: string
  ): ExpansionResponse {
    const expansionRatio = expandedText.length / request.text.length;
    const wordCount = expandedText.split(/\s+/).length;
    const readabilityScore = this.calculateReadability(expandedText);

    return {
      originalText: request.text,
      expandedText,
      metadata: {
        expansionRatio,
        wordCount,
        readabilityScore
      }
    };
  }

  private calculateReadability(text: string): number {
    // 简化的可读性评分
    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\s+/);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = text.length / words.length;
    
    // 简化的可读性公式
    return Math.max(0, Math.min(100, 100 - avgWordsPerSentence - avgCharsPerWord));
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['的', '了', '在', '是', '和', '与', '或', '但', '因为', '所以']);
    
    const wordFreq = new Map<string, number>();
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 1) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
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
    return `sum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default SummarizationModule;