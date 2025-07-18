import { ModuleAPI, ServiceResponse, SEORequest, SEOResponse, SEOSuggestion } from '../../types/platform';

/**
 * SEO优化模块
 * 提供内容SEO分析、关键词优化、结构建议等功能
 */
export class SEOModule implements ModuleAPI {
  private isInitialized = false;
  private keywordDatabase: Map<string, { 
    searchVolume: number; 
    difficulty: number; 
    relatedKeywords: string[] 
  }> = new Map();

  async initialize(): Promise<void> {
    try {
      // 初始化关键词数据库
      await this.loadKeywordDatabase();
      this.isInitialized = true;
      console.log('SEO模块初始化完成');
    } catch (error) {
      console.error('SEO模块初始化失败:', error);
      throw error;
    }
  }

  async process(request: SEORequest): Promise<ServiceResponse<SEOResponse>> {
    if (!this.isInitialized) {
      throw new Error('SEO模块未初始化');
    }

    try {
      const startTime = Date.now();
      
      // 分析内容
      const analysis = await this.analyzeContent(request);
      
      // 生成优化建议
      const suggestions = await this.generateSuggestions(request, analysis);
      
      // 优化内容
      const optimizedContent = await this.optimizeContent(request, suggestions);
      
      // 关键词分析
      const keywordAnalysis = await this.analyzeKeywords(request);

      const response: SEOResponse = {
        originalContent: request.content,
        optimizedContent,
        suggestions,
        keywordAnalysis,
        metadata: {
          readabilityScore: analysis.readabilityScore,
          wordCount: request.content.length,
          estimatedReadingTime: Math.ceil(request.content.length / 200),
          seoScore: this.calculateSEOScore(analysis, keywordAnalysis)
        }
      };

      return {
        success: true,
        data: response,
        metadata: {
          requestId: `seo_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEO_PROCESSING_ERROR',
          message: error instanceof Error ? error.message : '处理失败',
          details: error
        },
        metadata: {
          requestId: `seo_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - Date.now()
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    this.keywordDatabase.clear();
    this.isInitialized = false;
    console.log('SEO模块清理完成');
  }

  getStatus() {
    return {
      loaded: true,
      ready: this.isInitialized,
      lastUpdate: new Date(),
      performance: {
        averageResponseTime: 1500,
        successRate: 0.95,
        errorCount: 0
      }
    };
  }

  private async loadKeywordDatabase(): Promise<void> {
    // 模拟关键词数据库加载
    const keywords = [
      { keyword: 'SEO优化', searchVolume: 5000, difficulty: 65, relatedKeywords: ['搜索引擎优化', '网站优化', 'SEO技巧'] },
      { keyword: '内容营销', searchVolume: 3200, difficulty: 58, relatedKeywords: ['内容策略', '营销内容', '内容创作'] },
      { keyword: '关键词研究', searchVolume: 2800, difficulty: 62, relatedKeywords: ['关键词分析', '关键词工具', '关键词策略'] },
      { keyword: '网站排名', searchVolume: 4500, difficulty: 70, relatedKeywords: ['搜索排名', 'SERP', '排名优化'] },
      { keyword: '用户体验', searchVolume: 6000, difficulty: 55, relatedKeywords: ['UX设计', '用户界面', '可用性'] }
    ];

    keywords.forEach(item => {
      this.keywordDatabase.set(item.keyword, {
        searchVolume: item.searchVolume,
        difficulty: item.difficulty,
        relatedKeywords: item.relatedKeywords
      });
    });
  }

  private async analyzeContent(request: SEORequest): Promise<{
    readabilityScore: number;
    titleAnalysis: { hasH1: boolean; h1Count: number; titleLength: number };
    structureAnalysis: { headingStructure: string[]; paragraphCount: number };
    keywordDensity: Record<string, number>;
    imageAnalysis: { totalImages: number; imagesWithAlt: number };
    linkAnalysis: { internalLinks: number; externalLinks: number };
  }> {
    const content = request.content;
    
    // 可读性分析
    const readabilityScore = this.calculateReadabilityScore(content);
    
    // 标题分析
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
    const titleAnalysis = {
      hasH1: h1Matches.length > 0,
      h1Count: h1Matches.length,
      titleLength: h1Matches[0] ? h1Matches[0].replace(/<[^>]*>/g, '').length : 0
    };
    
    // 结构分析
    const headings = content.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
    const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gi) || [];
    const structureAnalysis = {
      headingStructure: headings.map(h => h.replace(/<[^>]*>/g, '')),
      paragraphCount: paragraphs.length
    };
    
    // 关键词密度分析
    const keywordDensity: Record<string, number> = {};
    request.targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const density = (matches.length / content.split(/\s+/).length) * 100;
      keywordDensity[keyword] = Math.round(density * 100) / 100;
    });
    
    // 图片分析
    const images = content.match(/<img[^>]*>/gi) || [];
    const imagesWithAlt = content.match(/<img[^>]*alt[^>]*>/gi) || [];
    const imageAnalysis = {
      totalImages: images.length,
      imagesWithAlt: imagesWithAlt.length
    };
    
    // 链接分析
    const allLinks = content.match(/<a[^>]*href[^>]*>/gi) || [];
    const externalLinks = allLinks.filter(link => 
      link.includes('http://') || link.includes('https://')
    );
    const linkAnalysis = {
      internalLinks: allLinks.length - externalLinks.length,
      externalLinks: externalLinks.length
    };

    return {
      readabilityScore,
      titleAnalysis,
      structureAnalysis,
      keywordDensity,
      imageAnalysis,
      linkAnalysis
    };
  }

  private async generateSuggestions(
    request: SEORequest, 
    analysis: any
  ): Promise<SEOSuggestion[]> {
    const suggestions: SEOSuggestion[] = [];

    // 标题优化建议
    if (!analysis.titleAnalysis.hasH1) {
      suggestions.push({
        type: 'structure',
        priority: 'high',
        title: '添加H1标题',
        description: '页面缺少H1标题，这对SEO非常重要',
        implementation: '在页面顶部添加一个包含主要关键词的H1标题',
        expectedImpact: '提升搜索引擎对页面主题的理解'
      });
    }

    if (analysis.titleAnalysis.h1Count > 1) {
      suggestions.push({
        type: 'structure',
        priority: 'medium',
        title: '优化H1标题数量',
        description: `页面有${analysis.titleAnalysis.h1Count}个H1标题，建议只使用一个`,
        implementation: '将额外的H1标题改为H2或H3',
        expectedImpact: '改善页面结构层次'
      });
    }

    // 关键词密度建议
    Object.entries(analysis.keywordDensity).forEach(([keyword, density]) => {
      if ((density as number) < 0.5) {
        suggestions.push({
          type: 'keyword',
          priority: 'medium',
          title: `增加关键词"${keyword}"的使用`,
          description: `关键词密度为${(density as number).toFixed(1)}%，建议增加到1-2%`,
          implementation: '在标题、段落开头和结尾自然地使用关键词',
          expectedImpact: '提升关键词相关性'
        });
      } else if ((density as number) > 3) {
        suggestions.push({
          type: 'keyword',
          priority: 'high',
          title: `减少关键词"${keyword}"的使用`,
          description: `关键词密度为${density}%，过高可能被视为关键词堆砌`,
          implementation: '用同义词或相关词汇替换部分关键词',
          expectedImpact: '避免搜索引擎惩罚'
        });
      }
    });

    // 图片优化建议
    if (analysis.imageAnalysis.totalImages > 0 && 
        analysis.imageAnalysis.imagesWithAlt < analysis.imageAnalysis.totalImages) {
      suggestions.push({
        type: 'technical',
        priority: 'medium',
        title: '添加图片Alt属性',
        description: `${analysis.imageAnalysis.totalImages - analysis.imageAnalysis.imagesWithAlt}张图片缺少Alt属性`,
        implementation: '为所有图片添加描述性的Alt属性',
        expectedImpact: '提升可访问性和图片搜索排名'
      });
    }

    // 内容长度建议
    const wordCount = request.content.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push({
        type: 'content',
        priority: 'high',
        title: '增加内容长度',
        description: `当前内容约${wordCount}字，建议至少300字`,
        implementation: '添加更多有价值的信息和详细说明',
        expectedImpact: '提升内容质量和搜索排名'
      });
    }

    // 结构优化建议
    if (analysis.structureAnalysis.headingStructure.length < 2) {
      suggestions.push({
        type: 'structure',
        priority: 'medium',
        title: '改善内容结构',
        description: '内容缺少层次结构，建议使用更多标题',
        implementation: '使用H2、H3等标题将内容分成清晰的段落',
        expectedImpact: '提升用户体验和内容可读性'
      });
    }

    return suggestions;
  }

  private async optimizeContent(
    request: SEORequest, 
    suggestions: SEOSuggestion[]
  ): Promise<string> {
    let optimizedContent = request.content;

    // 应用一些基本的优化
    suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'structure':
          if (suggestion.title.includes('添加H1标题') && !optimizedContent.includes('<h1>')) {
            // 在内容开头添加H1标题
            const mainKeyword = request.targetKeywords[0] || '内容标题';
            optimizedContent = `<h1>${mainKeyword}</h1>\n${optimizedContent}`;
          }
          break;
        case 'technical':
          if (suggestion.title.includes('图片Alt属性')) {
            // 为缺少alt属性的图片添加基本的alt属性
            optimizedContent = optimizedContent.replace(
              /<img([^>]*?)(?<!alt=["'][^"']*["'])>/gi,
              '<img$1 alt="相关图片">'
            );
          }
          break;
      }
    });

    return optimizedContent;
  }

  private async analyzeKeywords(request: SEORequest): Promise<{
    density: Record<string, number>;
    distribution: Record<string, number[]>;
    suggestions: string[];
  }> {
    const content = request.content;
    const density: Record<string, number> = {};
    const distribution: Record<string, number[]> = {};
    const suggestions: string[] = [];

    // 计算关键词密度和分布
    request.targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = [...content.matchAll(regex)];
      const wordCount = content.split(/\s+/).length;
      
      density[keyword] = (matches.length / wordCount) * 100;
      distribution[keyword] = matches.map(match => match.index || 0);

      // 生成关键词建议
      const keywordData = this.keywordDatabase.get(keyword);
      if (keywordData) {
        suggestions.push(...keywordData.relatedKeywords.slice(0, 2));
      }
    });

    return { density, distribution, suggestions };
  }

  private calculateReadabilityScore(content: string): number {
    // 简化的可读性评分算法
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // 基于平均句长计算可读性分数 (0-100)
    let score = 100 - (avgWordsPerSentence - 10) * 2;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateSEOScore(analysis: any, keywordAnalysis: any): number {
    let score = 0;
    
    // 标题结构 (20分)
    if (analysis.titleAnalysis.hasH1) score += 15;
    if (analysis.titleAnalysis.h1Count === 1) score += 5;
    
    // 关键词优化 (30分)
    const avgDensity = Object.values(keywordAnalysis.density).reduce((a: number, b: any) => a + (b as number), 0) / Object.keys(keywordAnalysis.density).length;
    if (avgDensity >= 1 && avgDensity <= 2) score += 30;
    else if (avgDensity >= 0.5 && avgDensity < 3) score += 20;
    else score += 10;
    
    // 内容质量 (25分)
    if (analysis.readabilityScore >= 70) score += 25;
    else if (analysis.readabilityScore >= 50) score += 15;
    else score += 5;
    
    // 技术优化 (15分)
    if (analysis.imageAnalysis.totalImages === analysis.imageAnalysis.imagesWithAlt) score += 15;
    else if (analysis.imageAnalysis.imagesWithAlt > 0) score += 10;
    
    // 结构优化 (10分)
    if (analysis.structureAnalysis.headingStructure.length >= 3) score += 10;
    else if (analysis.structureAnalysis.headingStructure.length >= 2) score += 5;
    
    return Math.round(score);
  }
}