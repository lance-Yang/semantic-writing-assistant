import { 
  ModuleAPI, 
  ModuleStatus, 
  TextGenerationRequest, 
  TextGenerationResponse,
  ServiceResponse 
} from '../../types/platform';

export class TextGenerationModule implements ModuleAPI {
  private status: ModuleStatus;
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

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
      // 从环境变量或配置中获取API密钥
      this.apiKey = this.getApiKey();
      this.status.loaded = true;
      this.status.ready = !!this.apiKey;
      this.status.lastUpdate = new Date();
      
      if (!this.apiKey) {
        console.warn('Text Generation Module: No API key found. Module will work in demo mode.');
      }
    } catch (error) {
      this.status.error = `Initialization failed: ${error}`;
      throw error;
    }
  }

  async process(request: TextGenerationRequest): Promise<ServiceResponse<TextGenerationResponse>> {
    const startTime = Date.now();

    try {
      if (!this.status.ready && this.apiKey) {
        throw new Error('Module not ready');
      }

      let response: TextGenerationResponse;

      if (this.apiKey) {
        response = await this.generateWithAPI(request);
      } else {
        response = await this.generateDemo(request);
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
          code: 'TEXT_GENERATION_FAILED',
          message: 'Failed to generate text',
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
    this.apiKey = null;
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  private async generateWithAPI(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: request.config?.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type, request.config?.style || 'professional')
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';

    return this.createResponse(generatedContent, request);
  }

  private async generateDemo(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    // 演示模式：生成示例内容
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API延迟

    const demoContent = this.getDemoContent(request.type, request.prompt);
    return this.createResponse(demoContent, request);
  }

  private buildPrompt(request: TextGenerationRequest): string {
    let prompt = `请根据以下要求生成${this.getTypeLabel(request.type)}：\n\n`;
    prompt += `主题：${request.prompt}\n`;

    if (request.keywords && request.keywords.length > 0) {
      prompt += `关键词：${request.keywords.join(', ')}\n`;
    }

    if (request.outline && request.outline.length > 0) {
      prompt += `大纲：\n${request.outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}\n`;
    }

    prompt += `\n风格要求：${this.getStyleDescription(request.config?.style || 'professional')}\n`;
    prompt += `语言：${request.config?.language || 'zh-CN'}\n`;

    return prompt;
  }

  private getSystemPrompt(type: string, style: string): string {
    const basePrompt = '你是一个专业的写作助手，能够生成高质量的各类文本内容。';
    
    const typePrompts: Record<string, string> = {
      news: '请以新闻报道的形式写作，确保内容客观、准确、及时。',
      advertisement: '请以广告文案的形式写作，重点突出产品优势和吸引力。',
      product_description: '请以产品描述的形式写作，详细介绍产品特性和价值。',
      blog_post: '请以博客文章的形式写作，内容要有深度和可读性。',
      email: '请以邮件的形式写作，语言要专业且友好。',
      social_media: '请以社交媒体帖子的形式写作，内容要简洁有趣。'
    };

    const stylePrompts: Record<string, string> = {
      formal: '使用正式、专业的语言风格。',
      casual: '使用轻松、随意的语言风格。',
      academic: '使用学术性、严谨的语言风格。',
      creative: '使用创意性、生动的语言风格。'
    };

    return `${basePrompt} ${typePrompts[type] || ''} ${stylePrompts[style] || ''}`;
  }

  private createResponse(content: string, request: TextGenerationRequest): TextGenerationResponse {
    const wordCount = this.countWords(content);
    const readabilityScore = this.calculateReadabilityScore(content);
    const keywordDensity = this.calculateKeywordDensity(content, request.keywords || []);
    const suggestions = this.generateSuggestions(content, request);

    return {
      content,
      metadata: {
        wordCount,
        readabilityScore,
        keywords: request.keywords || [],
        estimatedReadingTime: Math.ceil(wordCount / 200), // 假设每分钟阅读200字
        keywordDensity,
        suggestions
      }
    };
  }

  private getDemoContent(type: string, prompt: string): string {
    const demoContents: Record<string, string> = {
      news: `【${prompt}】最新消息

据最新报道，${prompt}相关事件引起了广泛关注。专家表示，这一发展对行业具有重要意义。

详细分析显示，该事件的影响将在未来几个月内逐步显现。相关部门正在密切关注情况发展，并将采取必要措施确保稳定。

业内人士认为，这是一个积极的信号，预示着行业将迎来新的发展机遇。`,

      advertisement: `🌟 ${prompt} - 您的理想选择！

✨ 为什么选择我们？
• 专业品质，值得信赖
• 创新设计，引领潮流  
• 贴心服务，超越期待

💫 立即体验，感受不同！
现在购买还可享受特别优惠，机会难得，不容错过！

📞 联系我们，开启美好体验之旅！`,

      product_description: `${prompt} - 产品详细介绍

🔹 产品特点：
• 高品质材料，经久耐用
• 人性化设计，使用便捷
• 多功能集成，一机多用

🔹 技术规格：
• 尺寸：标准规格，适合多种场景
• 材质：优质材料，安全可靠
• 功能：多项实用功能，满足不同需求

🔹 适用场景：
适合家庭、办公室、学校等多种环境使用，是您生活和工作的得力助手。`,

      blog_post: `# ${prompt}：深度解析与思考

在当今快速发展的时代，${prompt}已经成为我们不可忽视的重要话题。本文将从多个角度深入探讨这一主题，为读者提供全面的分析和见解。

## 背景分析

${prompt}的发展历程可以追溯到...这一演变过程反映了社会的进步和人们需求的变化。

## 现状评估

目前，${prompt}在各个领域都有着重要的应用和影响。通过数据分析可以看出...

## 未来展望

展望未来，${prompt}将会朝着更加智能化、人性化的方向发展，为我们的生活带来更多便利。

## 结论

综合以上分析，我们可以得出...这些洞察对于我们理解和应对未来挑战具有重要意义。`,

      email: `主题：关于${prompt}的重要通知

尊敬的用户，

您好！

我们写信通知您关于${prompt}的最新情况。经过仔细考虑和充分准备，我们决定...

具体安排如下：
• 时间：即日起生效
• 范围：所有相关用户
• 影响：预计将带来积极的改善

如果您有任何疑问或需要进一步了解，请随时联系我们。我们将竭诚为您服务。

感谢您的理解与支持！

此致
敬礼

客服团队`,

      social_media: `🎉 ${prompt} 来啦！

这个话题真的太有意思了！大家有什么想法吗？

💭 我觉得...
🤔 你们觉得呢？

#${prompt.replace(/\s+/g, '')} #分享 #讨论

快来评论区聊聊吧！👇`
    };

    return demoContents[type] || `关于${prompt}的内容正在生成中...`;
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      news: '新闻报道',
      advertisement: '广告文案',
      product_description: '产品描述',
      blog_post: '博客文章',
      email: '邮件内容',
      social_media: '社交媒体内容'
    };
    return labels[type] || '文本内容';
  }

  private getStyleDescription(style: string): string {
    const descriptions: Record<string, string> = {
      formal: '正式专业',
      casual: '轻松随意',
      academic: '学术严谨',
      creative: '创意生动'
    };
    return descriptions[style] || '通用';
  }

  private countWords(text: string): number {
    // 简单的中英文字数统计
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private calculateReadabilityScore(text: string): number {
    // 简化的可读性评分算法
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const words = this.countWords(text);
    const avgWordsPerSentence = words / Math.max(sentences.length, 1);
    
    // 基于平均句长计算可读性评分（0-100）
    const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    return Math.round(score);
  }

  private calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
    const density: Record<string, number> = {};
    const totalWords = this.countWords(text);
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex) || [];
      density[keyword] = totalWords > 0 ? (matches.length / totalWords) * 100 : 0;
    });
    
    return density;
  }

  private generateSuggestions(content: string, request: TextGenerationRequest): string[] {
    const suggestions: string[] = [];
    
    // 基于内容长度的建议
    const wordCount = this.countWords(content);
    if (wordCount < 100) {
      suggestions.push('内容较短，建议增加更多细节和说明');
    } else if (wordCount > 1000) {
      suggestions.push('内容较长，建议考虑分段或精简');
    }
    
    // 基于关键词的建议
    if (request.keywords && request.keywords.length > 0) {
      const keywordDensity = this.calculateKeywordDensity(content, request.keywords);
      const lowDensityKeywords = request.keywords.filter(kw => keywordDensity[kw] < 1);
      if (lowDensityKeywords.length > 0) {
        suggestions.push(`建议增加关键词的使用频率：${lowDensityKeywords.join(', ')}`);
      }
    }
    
    // 基于可读性的建议
    const readabilityScore = this.calculateReadabilityScore(content);
    if (readabilityScore < 60) {
      suggestions.push('建议使用更简洁的句式以提高可读性');
    }
    
    return suggestions;
  }

  private getApiKey(): string | null {
    // 尝试从多个来源获取API密钥
    return import.meta.env.VITE_OPENAI_API_KEY || 
           localStorage.getItem('openai_api_key') || 
           null;
  }

  private updatePerformanceMetrics(processingTime: number, success: boolean): void {
    const perf = this.status.performance;
    
    // 更新平均响应时间
    perf.averageResponseTime = (perf.averageResponseTime + processingTime) / 2;
    
    // 更新错误计数
    if (!success) {
      perf.errorCount++;
    }
    
    // 更新成功率（简化计算）
    const totalRequests = perf.errorCount + 1; // 假设这是总请求数的简化
    perf.successRate = success ? 
      ((perf.successRate * (totalRequests - 1)) + 100) / totalRequests :
      (perf.successRate * (totalRequests - 1)) / totalRequests;
    
    this.status.lastUpdate = new Date();
  }

  private generateRequestId(): string {
    return `tg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default TextGenerationModule;