import type { AIProvider } from '../types';

export interface AIAnalysisResult {
  suggestions: Array<{
    id: string;
    type: 'grammar' | 'style' | 'clarity' | 'structure';
    priority: 'low' | 'medium' | 'high';
    message: string;
    originalText: string;
    suggestedText: string;
    reason: string;
  }>;
  semanticTerms: Array<{
    id: string;
    term: string;
    category: string;
    importance: number;
    context: string[];
  }>;
  readabilityScore: {
    score: number;
    level: 'easy' | 'medium' | 'difficult';
    factors: string[];
  };
  summary: string;
}

class AIService {
  private async makeRequest(provider: AIProvider, prompt: string): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let url = '';
    let body: any = {};

    switch (provider.type) {
      case 'openai':
        url = provider.baseUrl || 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        body = {
          model: provider.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3,
        };
        break;

      case 'claude':
        url = provider.baseUrl || 'https://api.anthropic.com/v1/messages';
        headers['x-api-key'] = provider.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        body = {
          model: provider.model,
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        };
        break;

      case 'custom':
        url = provider.baseUrl || '';
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        body = {
          model: provider.model,
          prompt: prompt,
          max_tokens: 1000,
        };
        break;

      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Extract content based on provider type
      switch (provider.type) {
        case 'openai':
          return data.choices?.[0]?.message?.content || '';
        case 'claude':
          return data.content?.[0]?.text || '';
        case 'custom':
          return data.response || data.content || data.text || '';
        default:
          return '';
      }
    } catch (error) {
      console.error('AI API request failed:', error);
      throw error;
    }
  }

  async analyzeText(content: string, provider: AIProvider): Promise<AIAnalysisResult> {
    const prompt = `
Please analyze the following text for writing quality and provide suggestions for improvement. 
Return your analysis in the following JSON format:

{
  "suggestions": [
    {
      "type": "grammar|style|clarity|structure",
      "priority": "low|medium|high",
      "message": "Description of the issue",
      "originalText": "The problematic text",
      "suggestedText": "Improved version",
      "reason": "Explanation of why this is better"
    }
  ],
  "semanticTerms": [
    {
      "term": "important term",
      "category": "category name",
      "importance": 0.8,
      "context": ["context sentence 1", "context sentence 2"]
    }
  ],
  "readabilityScore": {
    "score": 75,
    "level": "medium",
    "factors": ["Average sentence length: 18 words", "Complex words: 12%"]
  },
  "summary": "Brief summary of the text quality and main recommendations"
}

Text to analyze:
${content}
`;

    try {
      const response = await this.makeRequest(provider, prompt);
      
      // Try to parse JSON response
      try {
        const result = JSON.parse(response);
        
        // Add IDs to suggestions if missing
        if (result.suggestions) {
          result.suggestions = result.suggestions.map((suggestion: any) => ({
            id: crypto.randomUUID(),
            ...suggestion,
          }));
        }
        
        // Add IDs to semantic terms if missing
        if (result.semanticTerms) {
          result.semanticTerms = result.semanticTerms.map((term: any) => ({
            id: crypto.randomUUID(),
            ...term,
          }));
        }
        
        return result;
      } catch (parseError) {
        // If JSON parsing fails, create a fallback response
        console.warn('Failed to parse AI response as JSON, creating fallback');
        return this.createFallbackAnalysis(content, response);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createFallbackAnalysis(content: string, aiResponse: string): AIAnalysisResult {
    // Create a basic analysis when AI response can't be parsed
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    return {
      suggestions: [
        {
          id: crypto.randomUUID(),
          type: 'style',
          priority: 'medium',
          message: 'AI analysis completed but response format was unexpected',
          originalText: content.substring(0, 50) + '...',
          suggestedText: 'Please review the AI response manually',
          reason: 'The AI provided feedback but in an unexpected format',
        },
      ],
      semanticTerms: [],
      readabilityScore: {
        score: avgWordsPerSentence < 20 ? 80 : 60,
        level: avgWordsPerSentence < 15 ? 'easy' : avgWordsPerSentence < 25 ? 'medium' : 'difficult',
        factors: [`Average sentence length: ${Math.round(avgWordsPerSentence)} words`],
      },
      summary: aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : ''),
    };
  }

  async testConnection(provider: AIProvider): Promise<boolean> {
    try {
      const testPrompt = 'Please respond with "Connection successful" if you can read this message.';
      const response = await this.makeRequest(provider, testPrompt);
      return response.toLowerCase().includes('connection successful') || response.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const aiService = new AIService();