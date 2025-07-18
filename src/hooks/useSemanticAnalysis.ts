import { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { semanticEngine } from '../services/semanticEngine';
import type { SemanticTerm, ConsistencyIssue } from '../types';

export const useSemanticAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { 
    setSemanticTerms, 
    setConsistencyIssues, 
    setSuggestions,
    currentDocument 
  } = useAppStore();

  const analyze = useCallback(async (content: string) => {
    if (!content.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      // Extract semantic terms
      const terms = await semanticEngine.extractTerms(content);
      setSemanticTerms(terms);

      // Detect consistency issues
      const issues = await semanticEngine.detectInconsistencies(terms, content);
      setConsistencyIssues(issues);

      // Generate suggestions
      const suggestions = await semanticEngine.generateSuggestions(issues, terms);
      setSuggestions(suggestions);

      console.log('Semantic analysis completed:', {
        termsFound: terms.length,
        issuesDetected: issues.length,
        suggestionsGenerated: suggestions.length
      });
    } catch (error) {
      console.error('Semantic analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, setSemanticTerms, setConsistencyIssues, setSuggestions]);

  return {
    analyze,
    isAnalyzing
  };
};