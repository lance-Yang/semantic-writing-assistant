import { 
  ModuleAPI, 
  ModuleStatus, 
  ServiceResponse, 
  GrammarCheckRequest, 
  GrammarCheckResponse,
  GrammarIssue 
} from '../../types/platform';

interface GrammarRule {
  id: string;
  type: 'spelling' | 'grammar' | 'style' | 'clarity';
  severity: 'error' | 'warning' | 'suggestion';
  pattern: RegExp;
  message: string;
  suggestion: string;
  validator?: (match: string) => boolean;
}

class GrammarCheckModule implements ModuleAPI {
  private status: ModuleStatus;
  private rules: Map<string, GrammarRule> = new Map();

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
      await this.loadGrammarRules();
      this.status.loaded = true;
      this.status.ready = true;
      this.status.lastUpdate = new Date();
    } catch (error) {
      this.status.error = `Initialization failed: ${error}`;
      throw error;
    }
  }

  async process(request: GrammarCheckRequest): Promise<ServiceResponse<GrammarCheckResponse>> {
    const startTime = Date.now();

    try {
      if (!this.status.ready) {
        throw new Error('Module not ready');
      }

      const result = await this.checkGrammar(request);
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, true);

      return {
        success: true,
        data: result,
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
          code: 'GRAMMAR_CHECK_FAILED',
          message: 'Grammar check failed',
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
    this.rules.clear();
    this.status.ready = false;
  }

  getStatus(): ModuleStatus {
    return { ...this.status };
  }

  private async loadGrammarRules(): Promise<void> {
    const rules: GrammarRule[] = [
      {
        id: 'punctuation_spacing',
        type: 'style',
        severity: 'suggestion',
        pattern: /[，。！？；：][\u4e00-\u9fa5]/g,
        message: '中文标点符号后不需要空格',
        suggestion: '删除标点符号后的空格'
      },
      {
        id: 'english_spacing',
        type: 'style',
        severity: 'warning',
        pattern: /[\u4e00-\u9fa5][a-zA-Z]|[a-zA-Z][\u4e00-\u9fa5]/g,
        message: '中英文之间建议添加空格',
        suggestion: '在中英文之间添加空格以提高可读性'
      },
      {
        id: 'redundant_words',
        type: 'style',
        severity: 'warning',
        pattern: /(的的|了了|在在|是是|有有|和和|或或)/g,
        message: '发现重复词语',
        suggestion: '删除重复的词语'
      },
      {
        id: 'sentence_too_long',
        type: 'style',
        severity: 'warning',
        pattern: /[^。！？]*[。！？]/g,
        message: '句子过长，建议分割',
        suggestion: '将长句分割为多个短句以提高可读性',
        validator: (match: string) => match.length > 100
      },
      {
        id: 'passive_voice',
        type: 'style',
        severity: 'suggestion',
        pattern: /(被|由|让|使|令)[\u4e00-\u9fa5]*[了的]/g,
        message: '检测到被动语态',
        suggestion: '考虑使用主动语态以提高表达力'
      },
      {
        id: 'weak_words',
        type: 'style',
        severity: 'suggestion',
        pattern: /(可能|也许|大概|估计|应该|或许)[\u4e00-\u9fa5]*[的了]/g,
        message: '使用了不确定词语',
        suggestion: '考虑使用更确定的表达方式'
      },
      {
        id: 'common_typos',
        type: 'spelling',
        severity: 'error',
        pattern: /(因为所以|虽然但是|不但而且|既然那么)/g,
        message: '关联词使用错误',
        suggestion: '关联词不能同时使用，请选择其中一个'
      },
      {
        id: 'double_space',
        type: 'style',
        severity: 'suggestion',
        pattern: /  +/g,
        message: 'Multiple spaces found',
        suggestion: 'Use single space between words'
      },
      {
        id: 'capitalization',
        type: 'grammar',
        severity: 'warning',
        pattern: /[.!?]\\s+[a-z]/g,
        message: 'Sentence should start with capital letter',
        suggestion: 'Capitalize the first letter of the sentence'
      },
      {
        id: 'comma_splice',
        type: 'grammar',
        severity: 'error',
        pattern: /[a-zA-Z],\\s*[a-zA-Z]/g,
        message: 'Possible comma splice',
        suggestion: 'Consider using semicolon or period instead of comma'
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  private async checkGrammar(request: GrammarCheckRequest): Promise<GrammarCheckResponse> {
    const issues: GrammarIssue[] = [];
    const { text, checkTypes, strictness } = request;

    // 应用语法规则
    for (const [ruleId, rule] of this.rules) {
      if (!checkTypes?.includes(rule.type)) continue;
      if (!this.shouldApplyRule(rule, strictness || 'medium')) continue;

      const matches = Array.from(text.matchAll(rule.pattern));
      
      for (const match of matches) {
        if (rule.validator && !rule.validator(match[0])) continue;

        const issue: GrammarIssue = {
          type: rule.type,
          severity: rule.severity,
          message: rule.message,
          position: {
            start: match.index || 0,
            end: (match.index || 0) + match[0].length
          },
          suggestions: [rule.suggestion],
          rule: ruleId
        };

        issues.push(issue);
      }
    }

    return {
      originalText: text,
      issues,
      correctedText: this.applySuggestions(text, issues),
      metadata: {
        totalIssues: issues.length,
        issuesByType: this.calculateIssuesByType(issues),
        overallScore: this.calculateGrammarScore(text, issues)
      }
    };
  }

  private shouldApplyRule(rule: GrammarRule, strictness: string): boolean {
    const strictnessLevels: Record<string, string[]> = {
      low: ['error'],
      medium: ['error', 'warning'],
      high: ['error', 'warning', 'suggestion']
    };

    return strictnessLevels[strictness]?.includes(rule.severity) || false;
  }

  private calculateIssuesByType(issues: GrammarIssue[]): Record<string, number> {
    const counts: Record<string, number> = {
      spelling: 0,
      grammar: 0,
      style: 0,
      clarity: 0
    };

    issues.forEach(issue => {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
    });

    return counts;
  }

  private applySuggestions(text: string, issues: GrammarIssue[]): string {
    let correctedText = text;
    
    // 按位置倒序排列，避免修改时位置偏移
    const sortedIssues = issues
      .filter(issue => issue.suggestions.length > 0)
      .sort((a, b) => b.position.start - a.position.start);

    sortedIssues.forEach(issue => {
      const before = correctedText.substring(0, issue.position.start);
      const after = correctedText.substring(issue.position.end);
      correctedText = before + issue.suggestions[0] + after;
    });

    return correctedText;
  }

  private calculateGrammarScore(text: string, issues: GrammarIssue[]): number {
    const textLength = text.length;
    if (textLength === 0) return 100;

    // 基础分数
    let score = 100;

    // 根据问题类型和严重程度扣分
    issues.forEach(issue => {
      const severityPenalty = {
        suggestion: 1,
        warning: 3,
        error: 5
      };

      const typePenalty = {
        spelling: 2,
        grammar: 1.5,
        style: 1,
        clarity: 1.2
      };

      const penalty = severityPenalty[issue.severity] * typePenalty[issue.type];
      score -= penalty;
    });

    // 根据问题密度调整
    const issueDensity = issues.length / (textLength / 100); // 每100字符的问题数
    if (issueDensity > 5) {
      score -= (issueDensity - 5) * 2;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private updatePerformanceMetrics(processingTime: number, success: boolean): void {
    const performance = this.status.performance;
    
    // 更新平均响应时间
    if (performance.averageResponseTime === 0) {
      performance.averageResponseTime = processingTime;
    } else {
      performance.averageResponseTime = (performance.averageResponseTime + processingTime) / 2;
    }

    // 更新成功率
    const totalRequests = performance.successRate * 100 + performance.errorCount;
    if (success) {
      performance.successRate = ((performance.successRate * 100) + 1) / (totalRequests + 1);
    } else {
      performance.errorCount += 1;
      performance.successRate = (performance.successRate * 100) / (totalRequests + 1);
    }
  }

  private generateRequestId(): string {
    return `grammar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default GrammarCheckModule;