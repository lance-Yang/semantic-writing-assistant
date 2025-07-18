// Web Worker for semantic analysis
const semanticAnalysisWorker = `
self.onmessage = function(e) {
  const { content, options } = e.data;
  
  try {
    // Simulate semantic analysis processing
    const analysis = performSemanticAnalysis(content, options);
    
    self.postMessage({
      type: 'success',
      data: analysis
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

function performSemanticAnalysis(content, options = {}) {
  const words = content.toLowerCase().match(/\\b\\w+\\b/g) || [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract semantic terms
  const termFrequency = {};
  words.forEach(word => {
    if (word.length > 3) {
      termFrequency[word] = (termFrequency[word] || 0) + 1;
    }
  });
  
  const semanticTerms = Object.entries(termFrequency)
    .filter(([word, freq]) => freq > 1)
    .map(([word, freq]) => ({
      id: Math.random().toString(36).substr(2, 9),
      term: word,
      frequency: freq,
      category: 'general',
      context: sentences.filter(s => s.toLowerCase().includes(word)).slice(0, 3),
      positions: findWordPositions(content, word)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  // Find potential consistency issues
  const consistencyIssues = findConsistencyIssues(content, semanticTerms);
  
  // Generate suggestions
  const suggestions = generateSuggestions(content, semanticTerms);
  
  return {
    semanticTerms,
    consistencyIssues,
    suggestions,
    stats: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: words.length / sentences.length || 0,
      readabilityScore: calculateReadabilityScore(words, sentences)
    }
  };
}

function findWordPositions(content, word) {
  const positions = [];
  const regex = new RegExp('\\\\b' + word + '\\\\b', 'gi');
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    positions.push({
      start: match.index,
      end: match.index + word.length,
      line: content.substring(0, match.index).split('\\n').length,
      column: match.index - content.lastIndexOf('\\n', match.index - 1)
    });
  }
  
  return positions;
}

function findConsistencyIssues(content, terms) {
  const issues = [];
  
  // Check for inconsistent terminology
  terms.forEach(term => {
    const variations = findSimilarTerms(term.term, terms);
    if (variations.length > 1) {
      issues.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'terminology',
        severity: 'medium',
        message: \`Inconsistent terminology: "\${term.term}" has variations\`,
        suggestions: [\`Use "\${term.term}" consistently\`],
        positions: term.positions
      });
    }
  });
  
  return issues;
}

function findSimilarTerms(term, terms) {
  return terms.filter(t => 
    t.term !== term && 
    (t.term.includes(term) || term.includes(t.term))
  );
}

function generateSuggestions(content, terms) {
  const suggestions = [];
  
  // Suggest breaking long sentences
  const sentences = content.split(/[.!?]+/);
  sentences.forEach((sentence, index) => {
    const words = sentence.trim().split(/\\s+/);
    if (words.length > 25) {
      suggestions.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'readability',
        priority: 'medium',
        message: 'Consider breaking this long sentence for better readability',
        originalText: sentence.trim(),
        suggestedText: sentence.trim() + ' [Consider splitting]',
        reason: 'Long sentences can be difficult to read'
      });
    }
  });
  
  return suggestions;
}

function calculateReadabilityScore(words, sentences) {
  // Simple readability score based on average sentence length
  const avgSentenceLength = words.length / sentences.length || 0;
  
  if (avgSentenceLength < 15) return 'easy';
  if (avgSentenceLength < 20) return 'medium';
  return 'difficult';
}
`;

export class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private workerScripts: Map<string, string> = new Map();

  constructor() {
    // Register worker scripts
    this.workerScripts.set('semanticAnalysis', semanticAnalysisWorker);
  }

  createWorker(type: string): Worker | null {
    const script = this.workerScripts.get(type);
    if (!script) {
      console.error(`Worker script for type "${type}" not found`);
      return null;
    }

    try {
      const blob = new Blob([script], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      
      this.workers.set(type, worker);
      return worker;
    } catch (error) {
      console.error(`Failed to create worker for type "${type}":`, error);
      return null;
    }
  }

  getWorker(type: string): Worker | null {
    return this.workers.get(type) || this.createWorker(type);
  }

  terminateWorker(type: string): void {
    const worker = this.workers.get(type);
    if (worker) {
      worker.terminate();
      this.workers.delete(type);
    }
  }

  terminateAllWorkers(): void {
    this.workers.forEach((worker, type) => {
      worker.terminate();
    });
    this.workers.clear();
  }

  // Semantic analysis with worker
  async analyzeSemantics(content: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker('semanticAnalysis');
      if (!worker) {
        reject(new Error('Failed to create semantic analysis worker'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 30000); // 30 second timeout

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        const { type, data, error } = e.data;
        
        if (type === 'success') {
          resolve(data);
        } else {
          reject(new Error(error));
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      worker.postMessage({ content, options });
    });
  }
}

// Singleton instance
export const workerManager = new WorkerManager();