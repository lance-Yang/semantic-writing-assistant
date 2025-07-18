class NLPUtils {
  /**
   * Normalize a term for comparison
   */
  normalizeTerm(term: string): string {
    return term
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove punctuation except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Check if two terms are similar (accounting for variations)
   */
  areTermsSimilar(term1: string, term2: string, threshold: number = 0.8): boolean {
    const normalized1 = this.normalizeTerm(term1);
    const normalized2 = this.normalizeTerm(term2);
    
    // Exact match
    if (normalized1 === normalized2) return true;
    
    // Check for common variations
    if (this.areVariations(normalized1, normalized2)) return true;
    
    // Calculate similarity score
    const similarity = this.calculateStringSimilarity(normalized1, normalized2);
    return similarity >= threshold;
  }

  /**
   * Check if terms are common variations of each other
   */
  private areVariations(term1: string, term2: string): boolean {
    const variations = [
      // Hyphenation variations
      [term1.replace(/-/g, ''), term2.replace(/-/g, '')],
      [term1.replace(/-/g, ' '), term2.replace(/-/g, ' ')],
      
      // Singular/plural
      [this.singularize(term1), this.singularize(term2)],
      
      // Case variations
      [term1.toLowerCase(), term2.toLowerCase()],
    ];

    return variations.some(([v1, v2]) => v1 === v2);
  }

  /**
   * Simple singularization
   */
  private singularize(word: string): string {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator  // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate semantic similarity between two text passages
   */
  calculateSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity
    const words1 = new Set(this.tokenize(text1.toLowerCase()));
    const words2 = new Set(this.tokenize(text2.toLowerCase()));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Extract key phrases from text
   */
  extractKeyPhrases(text: string, maxPhrases: number = 10): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const phrases: { phrase: string; score: number }[] = [];

    for (const sentence of sentences) {
      const words = this.tokenize(sentence);
      
      // Extract 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        for (let len = 2; len <= Math.min(3, words.length - i); len++) {
          const phrase = words.slice(i, i + len).join(' ');
          const score = this.calculatePhraseScore(phrase, text);
          phrases.push({ phrase, score });
        }
      }
    }

    // Sort by score and return top phrases
    return phrases
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPhrases)
      .map(p => p.phrase);
  }

  /**
   * Calculate phrase importance score
   */
  private calculatePhraseScore(phrase: string, fullText: string): number {
    const frequency = (fullText.toLowerCase().match(new RegExp(phrase.toLowerCase(), 'g')) || []).length;
    const length = phrase.split(' ').length;
    const uniqueness = 1 / (phrase.split(' ').filter(word => this.isCommonWord(word)).length + 1);
    
    return frequency * length * uniqueness;
  }

  /**
   * Check if word is common/stop word
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
    ]);
    
    return commonWords.has(word.toLowerCase());
  }

  /**
   * Detect language of text (simple heuristic)
   */
  detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const chinesePattern = /[\u4e00-\u9fff]/;
    
    if (chinesePattern.test(text)) {
      return 'zh';
    }
    
    const words = this.tokenize(text.toLowerCase());
    const englishMatches = words.filter(word => englishWords.includes(word)).length;
    
    if (englishMatches > words.length * 0.1) {
      return 'en';
    }
    
    return 'unknown';
  }

  /**
   * Calculate readability score (simplified Flesch Reading Ease)
   */
  calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const words = this.tokenize(text).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words = this.tokenize(text.toLowerCase());
    let totalSyllables = 0;
    
    for (const word of words) {
      const syllables = word.match(/[aeiouy]+/g)?.length || 1;
      totalSyllables += syllables;
    }
    
    return totalSyllables;
  }
}

export const nlpUtils = new NLPUtils();