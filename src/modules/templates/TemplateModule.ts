import { ModuleAPI, ServiceResponse, Template, TemplateRequest, TemplateResponse, TemplateVariable } from '../../types/platform';

/**
 * 模板系统模块
 * 提供写作模板管理、生成和自定义功能
 */
export class TemplateModule implements ModuleAPI {
  private isInitialized = false;
  private templates: Map<string, Template> = new Map();
  private categories: Set<string> = new Set();

  async initialize(): Promise<void> {
    try {
      // 加载预定义模板
      await this.loadDefaultTemplates();
      this.isInitialized = true;
      console.log('模板系统初始化完成');
    } catch (error) {
      console.error('模板系统初始化失败:', error);
      throw error;
    }
  }

  async process(request: TemplateRequest): Promise<ServiceResponse<TemplateResponse>> {
    if (!this.isInitialized) {
      throw new Error('模板系统未初始化');
    }

    try {
      const startTime = Date.now();
      
      const template = this.templates.get(request.templateId);
      if (!template) {
        throw new Error(`模板 ${request.templateId} 不存在`);
      }

      // 验证必需变量
      const missingRequired = template.variables
        .filter(v => v.required && !request.variables[v.name])
        .map(v => v.name);

      if (missingRequired.length > 0) {
        throw new Error(`缺少必需变量: ${missingRequired.join(', ')}`);
      }

      // 生成内容
      const generatedContent = await this.generateContent(template, request);
      
      // 应用自定义设置
      const finalContent = await this.applyCustomizations(generatedContent, request.customizations);

      const response: TemplateResponse = {
        templateId: request.templateId,
        generatedContent: finalContent,
        usedVariables: request.variables,
        metadata: {
          wordCount: finalContent.split(/\s+/).length,
          estimatedReadingTime: Math.ceil(finalContent.split(/\s+/).length / 200),
          generationTime: Date.now() - startTime
        }
      };

      // 更新模板使用统计
      template.usage += 1;

      return {
        success: true,
        data: response,
        metadata: {
          requestId: `template_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEMPLATE_GENERATION_ERROR',
          message: error instanceof Error ? error.message : '生成失败',
          details: error
        },
        metadata: {
          requestId: `template_${Date.now()}`,
          timestamp: new Date(),
          processingTime: Date.now() - Date.now()
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    this.templates.clear();
    this.categories.clear();
    this.isInitialized = false;
    console.log('模板系统清理完成');
  }

  getStatus() {
    return {
      loaded: true,
      ready: this.isInitialized,
      lastUpdate: new Date(),
      performance: {
        averageResponseTime: 800,
        successRate: 0.98,
        errorCount: 0
      }
    };
  }

  // 公共方法：获取所有模板
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  // 公共方法：按分类获取模板
  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  // 公共方法：搜索模板
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values())
      .filter(template => 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  // 公共方法：获取所有分类
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  // 公共方法：创建自定义模板
  createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usage' | 'rating'>): string {
    const id = `custom_${Date.now()}`;
    const newTemplate: Template = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: 0,
      rating: 0
    };

    this.templates.set(id, newTemplate);
    this.categories.add(template.category);
    return id;
  }

  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usage' | 'rating'>[] = [
      {
        name: '新闻稿模板',
        category: '新闻媒体',
        description: '标准新闻稿格式，适用于企业新闻发布',
        variables: [
          { name: 'title', type: 'text', label: '新闻标题', required: true },
          { name: 'company', type: 'text', label: '公司名称', required: true },
          { name: 'date', type: 'date', label: '发布日期', required: true },
          { name: 'location', type: 'text', label: '发布地点', required: true },
          { name: 'content', type: 'multiline', label: '新闻内容', required: true },
          { name: 'contact_name', type: 'text', label: '联系人姓名', required: true },
          { name: 'contact_email', type: 'text', label: '联系邮箱', required: true },
          { name: 'contact_phone', type: 'text', label: '联系电话', required: false }
        ],
        content: `# {{title}}

**{{location}}，{{date}}** - {{content}}

关于{{company}}：
{{company}}是一家专注于创新的企业，致力于为客户提供优质的产品和服务。

媒体联系：
姓名：{{contact_name}}
邮箱：{{contact_email}}
{{#contact_phone}}电话：{{contact_phone}}{{/contact_phone}}

###`,
        tags: ['新闻', '媒体', '企业', '公关']
      },
      {
        name: '产品介绍模板',
        category: '营销推广',
        description: '产品功能介绍和卖点展示模板',
        variables: [
          { name: 'product_name', type: 'text', label: '产品名称', required: true },
          { name: 'product_category', type: 'text', label: '产品类别', required: true },
          { name: 'main_features', type: 'multiline', label: '主要功能', required: true },
          { name: 'target_audience', type: 'text', label: '目标用户', required: true },
          { name: 'price', type: 'text', label: '价格信息', required: false },
          { name: 'availability', type: 'text', label: '购买方式', required: false }
        ],
        content: `# {{product_name}} - 革新您的{{product_category}}体验

## 产品概述
{{product_name}}是专为{{target_audience}}设计的创新{{product_category}}解决方案。

## 核心功能
{{main_features}}

## 为什么选择{{product_name}}？
- 🚀 **创新技术**：采用最新技术，提供卓越性能
- 🎯 **精准定位**：专为{{target_audience}}量身定制
- 💡 **简单易用**：直观的界面设计，上手即用
- 🔒 **安全可靠**：企业级安全保障

{{#price}}
## 价格信息
{{price}}
{{/price}}

{{#availability}}
## 如何获取
{{availability}}
{{/availability}}

立即体验{{product_name}}，开启全新的{{product_category}}之旅！`,
        tags: ['产品', '营销', '介绍', '推广']
      },
      {
        name: '博客文章模板',
        category: '内容创作',
        description: '标准博客文章结构模板',
        variables: [
          { name: 'title', type: 'text', label: '文章标题', required: true },
          { name: 'author', type: 'text', label: '作者姓名', required: true },
          { name: 'introduction', type: 'multiline', label: '文章引言', required: true },
          { name: 'main_points', type: 'multiline', label: '主要观点', required: true },
          { name: 'conclusion', type: 'multiline', label: '总结', required: true },
          { name: 'tags', type: 'text', label: '标签', required: false },
          { name: 'call_to_action', type: 'text', label: '行动号召', required: false }
        ],
        content: `# {{title}}

*作者：{{author}}*

## 引言
{{introduction}}

## 主要内容
{{main_points}}

## 总结
{{conclusion}}

{{#call_to_action}}
---
**{{call_to_action}}**
{{/call_to_action}}

{{#tags}}
标签：{{tags}}
{{/tags}}`,
        tags: ['博客', '文章', '内容', '写作']
      },
      {
        name: '邮件营销模板',
        category: '营销推广',
        description: '电子邮件营销活动模板',
        variables: [
          { name: 'recipient_name', type: 'text', label: '收件人姓名', required: false },
          { name: 'subject', type: 'text', label: '邮件主题', required: true },
          { name: 'offer_title', type: 'text', label: '优惠标题', required: true },
          { name: 'offer_description', type: 'multiline', label: '优惠描述', required: true },
          { name: 'cta_text', type: 'text', label: '按钮文字', required: true },
          { name: 'cta_link', type: 'text', label: '按钮链接', required: true },
          { name: 'company_name', type: 'text', label: '公司名称', required: true },
          { name: 'unsubscribe_link', type: 'text', label: '退订链接', required: true }
        ],
        content: `{{#recipient_name}}亲爱的{{recipient_name}}，{{/recipient_name}}{{^recipient_name}}您好，{{/recipient_name}}

# {{offer_title}}

{{offer_description}}

[{{cta_text}}]({{cta_link}})

感谢您对{{company_name}}的支持！

---
此邮件由{{company_name}}发送
如不想继续接收此类邮件，请[点击退订]({{unsubscribe_link}})`,
        tags: ['邮件', '营销', 'EDM', '推广']
      },
      {
        name: '会议纪要模板',
        category: '商务办公',
        description: '标准会议记录和纪要模板',
        variables: [
          { name: 'meeting_title', type: 'text', label: '会议主题', required: true },
          { name: 'meeting_date', type: 'date', label: '会议日期', required: true },
          { name: 'meeting_time', type: 'text', label: '会议时间', required: true },
          { name: 'attendees', type: 'multiline', label: '参会人员', required: true },
          { name: 'agenda', type: 'multiline', label: '会议议程', required: true },
          { name: 'discussions', type: 'multiline', label: '讨论内容', required: true },
          { name: 'decisions', type: 'multiline', label: '决议事项', required: true },
          { name: 'action_items', type: 'multiline', label: '行动计划', required: true },
          { name: 'next_meeting', type: 'text', label: '下次会议', required: false }
        ],
        content: `# 会议纪要：{{meeting_title}}

**日期：** {{meeting_date}}
**时间：** {{meeting_time}}

## 参会人员
{{attendees}}

## 会议议程
{{agenda}}

## 讨论内容
{{discussions}}

## 决议事项
{{decisions}}

## 行动计划
{{action_items}}

{{#next_meeting}}
## 下次会议
{{next_meeting}}
{{/next_meeting}}

---
*会议纪要整理完成*`,
        tags: ['会议', '纪要', '商务', '办公']
      },
      {
        name: '社交媒体文案模板',
        category: '社交媒体',
        description: '社交平台发布内容模板',
        variables: [
          { name: 'platform', type: 'select', label: '发布平台', required: true, 
            options: ['微博', '微信朋友圈', 'Instagram', 'Twitter', 'LinkedIn'] },
          { name: 'content_type', type: 'select', label: '内容类型', required: true,
            options: ['产品推广', '活动宣传', '知识分享', '生活分享', '新闻资讯'] },
          { name: 'main_message', type: 'multiline', label: '主要信息', required: true },
          { name: 'hashtags', type: 'text', label: '相关标签', required: false },
          { name: 'call_to_action', type: 'text', label: '互动引导', required: false },
          { name: 'link', type: 'text', label: '相关链接', required: false }
        ],
        content: `{{main_message}}

{{#call_to_action}}
{{call_to_action}}
{{/call_to_action}}

{{#link}}
🔗 {{link}}
{{/link}}

{{#hashtags}}
{{hashtags}}
{{/hashtags}}`,
        tags: ['社交媒体', '文案', '营销', '推广']
      }
    ];

    // 加载模板到系统中
    defaultTemplates.forEach(templateData => {
      const id = `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const template: Template = {
        ...templateData,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: 0,
        rating: 4.5
      };
      
      this.templates.set(id, template);
      this.categories.add(template.category);
    });
  }

  private async generateContent(template: Template, request: TemplateRequest): Promise<string> {
    let content = template.content;
    
    // 替换变量
    template.variables.forEach(variable => {
      const value = request.variables[variable.name];
      if (value !== undefined) {
        // 处理条件渲染 {{#variable}}...{{/variable}}
        const conditionalRegex = new RegExp(`{{#${variable.name}}}([\\s\\S]*?){{/${variable.name}}}`, 'g');
        content = content.replace(conditionalRegex, value ? '$1' : '');
        
        // 处理反向条件渲染 {{^variable}}...{{/variable}}
        const negativeConditionalRegex = new RegExp(`{{\\^${variable.name}}}([\\s\\S]*?){{/${variable.name}}}`, 'g');
        content = content.replace(negativeConditionalRegex, !value ? '$1' : '');
        
        // 替换普通变量 {{variable}}
        const variableRegex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(variableRegex, String(value));
      } else if (variable.defaultValue) {
        // 使用默认值
        const variableRegex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(variableRegex, String(variable.defaultValue));
      }
    });

    // 清理未替换的变量标记
    content = content.replace(/{{[^}]*}}/g, '');
    
    return content.trim();
  }

  private async applyCustomizations(
    content: string, 
    customizations?: { style?: string; tone?: string; length?: string }
  ): Promise<string> {
    if (!customizations) return content;

    let customizedContent = content;

    // 应用风格调整
    if (customizations.style) {
      switch (customizations.style) {
        case 'formal':
          customizedContent = this.adjustToFormalStyle(customizedContent);
          break;
        case 'casual':
          customizedContent = this.adjustToCasualStyle(customizedContent);
          break;
        case 'professional':
          customizedContent = this.adjustToProfessionalStyle(customizedContent);
          break;
      }
    }

    // 应用语调调整
    if (customizations.tone) {
      switch (customizations.tone) {
        case 'friendly':
          customizedContent = this.adjustToFriendlyTone(customizedContent);
          break;
        case 'authoritative':
          customizedContent = this.adjustToAuthoritativeTone(customizedContent);
          break;
        case 'persuasive':
          customizedContent = this.adjustToPersuasiveTone(customizedContent);
          break;
      }
    }

    // 应用长度调整
    if (customizations.length) {
      switch (customizations.length) {
        case 'short':
          customizedContent = this.shortenContent(customizedContent);
          break;
        case 'long':
          customizedContent = this.expandContent(customizedContent);
          break;
      }
    }

    return customizedContent;
  }

  private adjustToFormalStyle(content: string): string {
    return content
      .replace(/你/g, '您')
      .replace(/很好/g, '优秀')
      .replace(/不错/g, '良好')
      .replace(/！/g, '。');
  }

  private adjustToCasualStyle(content: string): string {
    return content
      .replace(/您/g, '你')
      .replace(/优秀/g, '很棒')
      .replace(/良好/g, '不错');
  }

  private adjustToProfessionalStyle(content: string): string {
    return content
      .replace(/很/g, '非常')
      .replace(/好/g, '优质')
      .replace(/快/g, '高效');
  }

  private adjustToFriendlyTone(content: string): string {
    return content
      .replace(/。/g, '～')
      .replace(/！/g, '！😊');
  }

  private adjustToAuthoritativeTone(content: string): string {
    return content
      .replace(/可能/g, '必然')
      .replace(/建议/g, '要求')
      .replace(/希望/g, '需要');
  }

  private adjustToPersuasiveTone(content: string): string {
    return content
      .replace(/产品/g, '革命性产品')
      .replace(/服务/g, '卓越服务')
      .replace(/功能/g, '强大功能');
  }

  private shortenContent(content: string): string {
    const sentences = content.split(/[。！？]/).filter(s => s.trim());
    return sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('。') + '。';
  }

  private expandContent(content: string): string {
    const expandedContent = content
      .replace(/。/g, '，这为用户带来了更好的体验。')
      .replace(/！/g, '，这一点特别值得关注！')
      .replace(/\n/g, '\n\n此外，我们还需要考虑到相关的因素。\n');
    
    return expandedContent;
  }
}