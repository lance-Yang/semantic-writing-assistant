import type { TermPosition } from '../types';

class TermExtractor {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  /**
   * Extract terms from text content
   */
  async extractTerms(content: string): Promise<ExtractedTerm[]> {
    const terms: ExtractedTerm[] = [];
    
    // Extract different types of terms
    terms.push(...this.extractNounPhrases(content));
    terms.push(...this.extractTechnicalTerms(content));
    terms.push(...this.extractProperNouns(content));
    terms.push(...this.extractCompoundTerms(content));
    
    // Filter and deduplicate
    return this.filterAndDeduplicate(terms);
  }

  /**
   * Extract noun phrases (2-4 words)
   */
  private extractNounPhrases(content: string): ExtractedTerm[] {
    const terms: ExtractedTerm[] = [];
    const nounPhrasePattern = /\b[A-Z][a-z]+(?:\s+[a-z]+){1,3}\b/g;
    
    let match;
    while ((match = nounPhrasePattern.exec(content)) !== null) {
      const term = match[0];
      if (!this.containsStopWords(term) && term.length > 3) {
        const position = this.getTermPosition(content, match.index, term);
        terms.push({
          term,
          positions: [position]
        });
      }
    }
    
    return terms;
  }

  /**
   * Extract technical terms and acronyms
   */
  private extractTechnicalTerms(content: string): ExtractedTerm[] {
    const terms: ExtractedTerm[] = [];
    
    // Technical acronyms
    const acronymPattern = /\b[A-Z]{2,}\b/g;
    let match;
    while ((match = acronymPattern.exec(content)) !== null) {
      const term = match[0];
      const position = this.getTermPosition(content, match.index, term);
      terms.push({
        term,
        positions: [position]
      });
    }

    // Technical terms with specific patterns
    const techPatterns = [
      /\b\w+(?:API|SDK|CLI|GUI|UI|UX)\b/gi,
      /\b(?:HTTP|HTTPS|REST|GraphQL|JSON|XML|HTML|CSS|JavaScript|TypeScript)\b/gi,
      /\b\w+(?:Script|Framework|Library|Engine|Service|Component)\b/gi
    ];

    for (const pattern of techPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        const term = match[0];
        const position = this.getTermPosition(content, match.index, term);
        terms.push({
          term,
          positions: [position]
        });
      }
    }
    
    return terms;
  }

  /**
   * Extract proper nouns
   */
  private extractProperNouns(content: string): ExtractedTerm[] {
    const terms: ExtractedTerm[] = [];
    const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    
    let match;
    while ((match = properNounPattern.exec(content)) !== null) {
      const term = match[0];
      if (term.length > 2 && !this.isCommonWord(term)) {
        const position = this.getTermPosition(content, match.index, term);
        terms.push({
          term,
          positions: [position]
        });
      }
    }
    
    return terms;
  }

  /**
   * Extract compound terms (hyphenated or multi-word technical terms)
   */
  private extractCompoundTerms(content: string): ExtractedTerm[] {
    const terms: ExtractedTerm[] = [];
    
    // Hyphenated terms
    const hyphenatedPattern = /\b[a-zA-Z]+-[a-zA-Z]+(?:-[a-zA-Z]+)*\b/g;
    let match;
    while ((match = hyphenatedPattern.exec(content)) !== null) {
      const term = match[0];
      if (term.length > 4) {
        const position = this.getTermPosition(content, match.index, term);
        terms.push({
          term,
          positions: [position]
        });
      }
    }

    // Multi-word technical terms
    const multiWordPattern = /\b(?:data|user|system|application|software|web|mobile|cloud|machine|artificial|deep|neural)\s+\w+\b/gi;
    while ((match = multiWordPattern.exec(content)) !== null) {
      const term = match[0];
      const position = this.getTermPosition(content, match.index, term);
      terms.push({
        term,
        positions: [position]
      });
    }
    
    return terms;
  }

  /**
   * Filter and deduplicate extracted terms
   */
  private filterAndDeduplicate(terms: ExtractedTerm[]): ExtractedTerm[] {
    const termMap = new Map<string, ExtractedTerm>();
    
    for (const term of terms) {
      const normalizedTerm = term.term.toLowerCase().trim();
      
      // Skip if too short or contains only stop words
      if (normalizedTerm.length < 3 || this.isOnlyStopWords(normalizedTerm)) {
        continue;
      }
      
      if (termMap.has(normalizedTerm)) {
        // Merge positions
        const existing = termMap.get(normalizedTerm)!;
        existing.positions.push(...term.positions);
      } else {
        termMap.set(normalizedTerm, {
          term: term.term,
          positions: [...term.positions]
        });
      }
    }
    
    // Filter by frequency (keep terms that appear at least twice or are technical)
    return Array.from(termMap.values()).filter(term => 
      term.positions.length >= 2 || this.isTechnicalTerm(term.term)
    );
  }

  /**
   * Get term position information
   */
  private getTermPosition(content: string, index: number, term: string): TermPosition {
    const beforeText = content.substring(0, index);
    const lines = beforeText.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    return {
      start: index,
      end: index + term.length,
      line,
      column
    };
  }

  /**
   * Check if term contains stop words
   */
  private containsStopWords(term: string): boolean {
    const words = term.toLowerCase().split(/\s+/);
    return words.some(word => this.stopWords.has(word));
  }

  /**
   * Check if term consists only of stop words
   */
  private isOnlyStopWords(term: string): boolean {
    const words = term.toLowerCase().split(/\s+/);
    return words.every(word => this.stopWords.has(word));
  }

  /**
   * Check if term is a common word that shouldn't be extracted
   */
  private isCommonWord(term: string): boolean {
    const commonWords = ['The', 'This', 'That', 'These', 'Those', 'Here', 'There', 'When', 'Where', 'How', 'Why'];
    return commonWords.includes(term);
  }

  /**
   * Check if term is technical
   */
  private isTechnicalTerm(term: string): boolean {
    const techIndicators = [
      /API|SDK|CLI|GUI|UI|UX/i,
      /HTTP|REST|JSON|XML|HTML|CSS/i,
      /Script|Framework|Library|Engine|Service|Component/i,
      /[A-Z]{2,}/,  // Acronyms
      /-/  // Hyphenated terms
    ];
    
    return techIndicators.some(pattern => pattern.test(term));
  }
}

interface ExtractedTerm {
  term: string;
  positions: TermPosition[];
}

export const termExtractor = new TermExtractor();