import type { SemanticTerm, ConsistencyIssue, Suggestion, TermPosition } from '../types';
import { termExtractor } from '../utils/termExtractor';
import { nlpUtils } from '../utils/nlp';

class SemanticEngine {
  private termCache = new Map<string, SemanticTerm[]>();
  private consistencyRules: ConsistencyRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Extract semantic terms from text content
   */
  async extractTerms(content: string): Promise<SemanticTerm[]> {
    const contentHash = this.hashContent(content);
    
    // Check cache first
    if (this.termCache.has(contentHash)) {
      return this.termCache.get(contentHash)!;
    }

    try {
      // Extract terms using multiple strategies
      const extractedTerms = await termExtractor.extractTerms(content);
      const semanticTerms = this.processExtractedTerms(extractedTerms, content);
      
      // Cache results
      this.termCache.set(contentHash, semanticTerms);
      
      return semanticTerms;
    } catch (error) {
      console.error('Term extraction failed:', error);
      return [];
    }
  }

  /**
   * Detect consistency issues in the document
   */
  async detectInconsistencies(
    terms: SemanticTerm[], 
    content: string
  ): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];

    // 1. Terminology inconsistencies
    const terminologyIssues = this.detectTerminologyInconsistencies(terms);
    issues.push(...terminologyIssues);

    // 2. Style inconsistencies
    const styleIssues = this.detectStyleInconsistencies(content);
    issues.push(...styleIssues);

    // 3. Structure inconsistencies
    const structureIssues = this.detectStructureInconsistencies(content);
    issues.push(...structureIssues);

    return issues;
  }

  /**
   * Generate suggestions based on detected issues
   */
  async generateSuggestions(
    issues: ConsistencyIssue[], 
    terms: SemanticTerm[]
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    for (const issue of issues) {
      const suggestion = this.createSuggestionFromIssue(issue, terms);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * Process extracted terms into semantic terms with metadata
   */
  private processExtractedTerms(extractedTerms: ExtractedTerm[], content: string): SemanticTerm[] {
    const termMap = new Map<string, SemanticTerm>();

    for (const extracted of extractedTerms) {
      const normalizedTerm = nlpUtils.normalizeTerm(extracted.term);
      
      if (termMap.has(normalizedTerm)) {
        const existing = termMap.get(normalizedTerm)!;
        existing.frequency += 1;
        existing.positions.push(...extracted.positions);
        
        // Add variant if not already present
        if (!existing.variants.includes(extracted.term)) {
          existing.variants.push(extracted.term);
        }
      } else {
        const semanticTerm: SemanticTerm = {
          id: crypto.randomUUID(),
          term: normalizedTerm,
          variants: [extracted.term],
          category: this.categorizeterm(extracted.term),
          context: this.extractContext(extracted.positions, content),
          frequency: 1,
          positions: extracted.positions
        };
        termMap.set(normalizedTerm, semanticTerm);
      }
    }

    return Array.from(termMap.values());
  }

  /**
   * Detect terminology inconsistencies
   */
  private detectTerminologyInconsistencies(terms: SemanticTerm[]): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Group similar terms
    const similarGroups = this.groupSimilarTerms(terms);

    for (const group of similarGroups) {
      if (group.length > 1) {
        // Multiple variants of the same concept
        const mainTerm = group.reduce((prev, current) => 
          prev.frequency > current.frequency ? prev : current
        );

        for (const term of group) {
          if (term.id !== mainTerm.id) {
            for (const position of term.positions) {
              issues.push({
                id: crypto.randomUUID(),
                type: 'terminology',
                severity: 'medium',
                message: `Consider using "${mainTerm.term}" instead of "${term.term}" for consistency`,
                position,
                suggestions: [mainTerm.term],
                relatedTerms: [mainTerm.term, term.term]
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detect style inconsistencies
   */
  private detectStyleInconsistencies(content: string): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    const lines = content.split('\n');

    // Check for inconsistent heading styles
    const headingPattern = /^(#{1,6})\s+(.+)$/;
    const headingLevels = new Set<number>();

    lines.forEach((line, _index) => {
      const match = line.match(headingPattern);
      if (match) {
        const level = match[1].length;
        headingLevels.add(level);
      }
    });

    // Check for inconsistent list styles
    const bulletPatterns = [/^\s*[-*+]\s/, /^\s*\d+\.\s/];
    const listStyles = new Set<string>();

    lines.forEach((line, _index) => {
      for (const pattern of bulletPatterns) {
        if (pattern.test(line)) {
          listStyles.add(pattern.source);
          break;
        }
      }
    });

    if (listStyles.size > 1) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'style',
        severity: 'low',
        message: 'Inconsistent list formatting detected',
        position: { start: 0, end: 0, line: 1, column: 1 },
        suggestions: ['Use consistent bullet point style throughout the document'],
        relatedTerms: []
      });
    }

    return issues;
  }

  /**
   * Detect structure inconsistencies
   */
  private detectStructureInconsistencies(content: string): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];
    
    // Check for logical flow issues
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    if (paragraphs.length > 5) {
      // Check for abrupt topic changes
      for (let i = 1; i < paragraphs.length; i++) {
        const similarity = nlpUtils.calculateSimilarity(paragraphs[i-1], paragraphs[i]);
        
        if (similarity < 0.2) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'structure',
            severity: 'low',
            message: 'Potential abrupt topic change detected',
            position: this.findParagraphPosition(content, i),
            suggestions: ['Consider adding a transition sentence'],
            relatedTerms: []
          });
        }
      }
    }

    return issues;
  }

  /**
   * Create suggestion from consistency issue
   */
  private createSuggestionFromIssue(issue: ConsistencyIssue, _terms: SemanticTerm[]): Suggestion | null {
    if (issue.suggestions.length === 0) return null;

    return {
      id: crypto.randomUUID(),
      type: issue.type === 'terminology' ? 'replace' : 'restructure',
      title: issue.message,
      description: `Suggestion based on ${issue.type} analysis`,
      originalText: this.getTextAtPosition(issue.position),
      suggestedText: issue.suggestions[0],
      confidence: issue.severity === 'high' ? 0.9 : issue.severity === 'medium' ? 0.7 : 0.5,
      source: 'semantic'
    };
  }

  /**
   * Group similar terms together
   */
  private groupSimilarTerms(terms: SemanticTerm[]): SemanticTerm[][] {
    const groups: SemanticTerm[][] = [];
    const processed = new Set<string>();

    for (const term of terms) {
      if (processed.has(term.id)) continue;

      const group = [term];
      processed.add(term.id);

      for (const otherTerm of terms) {
        if (processed.has(otherTerm.id)) continue;

        if (nlpUtils.areTermsSimilar(term.term, otherTerm.term)) {
          group.push(otherTerm);
          processed.add(otherTerm.id);
        }
      }

      if (group.length > 0) {
        groups.push(group);
      }
    }

    return groups;
  }

  /**
   * Categorize a term based on its characteristics
   */
  private categorizeterm(term: string): string {
    // Simple categorization logic
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(term)) {
      return 'proper_noun';
    }
    if (/\b(?:API|UI|UX|HTML|CSS|JS|SQL)\b/i.test(term)) {
      return 'technical';
    }
    if (term.length > 15) {
      return 'compound';
    }
    return 'general';
  }

  /**
   * Extract context around term positions
   */
  private extractContext(positions: TermPosition[], content: string): string[] {
    const contexts: string[] = [];
    const lines = content.split('\n');

    for (const pos of positions) {
      if (pos.line > 0 && pos.line <= lines.length) {
        const line = lines[pos.line - 1];
        const start = Math.max(0, pos.column - 20);
        const end = Math.min(line.length, pos.column + 20);
        contexts.push(line.substring(start, end));
      }
    }

    return contexts;
  }

  /**
   * Initialize default consistency rules
   */
  private initializeDefaultRules(): void {
    this.consistencyRules = [
      {
        id: '1',
        pattern: 'frontend|front-end|front end',
        replacement: 'frontend',
        category: 'terminology',
        enabled: true,
        userDefined: false
      },
      {
        id: '2',
        pattern: 'backend|back-end|back end',
        replacement: 'backend',
        category: 'terminology',
        enabled: true,
        userDefined: false
      }
    ];
  }

  /**
   * Hash content for caching
   */
  private hashContent(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Find position of paragraph in content
   */
  private findParagraphPosition(content: string, paragraphIndex: number): TermPosition {
    const paragraphs = content.split('\n\n');
    let position = 0;
    
    for (let i = 0; i < paragraphIndex && i < paragraphs.length; i++) {
      position += paragraphs[i].length + 2; // +2 for \n\n
    }

    return {
      start: position,
      end: position + (paragraphs[paragraphIndex]?.length || 0),
      line: content.substring(0, position).split('\n').length,
      column: 1
    };
  }

  /**
   * Get text at specific position
   */
  private getTextAtPosition(_position: TermPosition): string {
    // This would need access to the original content
    // For now, return empty string
    return '';
  }
}

// Types for internal use
interface ExtractedTerm {
  term: string;
  positions: TermPosition[];
}

interface ConsistencyRule {
  id: string;
  pattern: string;
  replacement: string;
  category: string;
  enabled: boolean;
  userDefined: boolean;
}

export const semanticEngine = new SemanticEngine();