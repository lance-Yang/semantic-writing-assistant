import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  Lightbulb,
  Brain,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { ConsistencyIssue, Suggestion } from '../../types';

export const SuggestionPanel: React.FC = () => {
  const { 
    consistencyIssues, 
    suggestions, 
    applySuggestion, 
    dismissSuggestion,
    resolveConsistencyIssue,
    settings
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'ai'>('issues');

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'replace':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'restructure':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'enhance':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const tabs = [
    { id: 'issues', label: 'Issues', count: consistencyIssues.length },
    { id: 'suggestions', label: 'Suggestions', count: suggestions.length },
    ...(settings.aiEnabled ? [{ id: 'ai', label: 'AI Insights', count: 0 }] : [])
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'issues' | 'suggestions' | 'ai')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'issues' && (
          <IssuesTab 
            issues={consistencyIssues}
            onResolve={resolveConsistencyIssue}
            getSeverityIcon={getSeverityIcon}
          />
        )}
        
        {activeTab === 'suggestions' && (
          <SuggestionsTab
            suggestions={suggestions}
            onApply={applySuggestion}
            onDismiss={dismissSuggestion}
            getSuggestionIcon={getSuggestionIcon}
          />
        )}
        
        {activeTab === 'ai' && settings.aiEnabled && (
          <AIInsightsTab />
        )}
      </div>
    </div>
  );
};

interface IssuesTabProps {
  issues: ConsistencyIssue[];
  onResolve: (id: string) => void;
  getSeverityIcon: (severity: 'low' | 'medium' | 'high') => React.ReactNode;
}

const IssuesTab: React.FC<IssuesTabProps> = ({ issues, onResolve, getSeverityIcon }) => {
  if (issues.length === 0) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-gray-500">No consistency issues found</p>
        <p className="text-sm text-gray-400 mt-1">Your document looks great!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {issues.map((issue) => (
        <div key={issue.id} className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getSeverityIcon(issue.severity)}
              <span className="text-sm font-medium text-gray-900 capitalize">
                {issue.type}
              </span>
            </div>
            <button
              onClick={() => onResolve(issue.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{issue.message}</p>
          
          {issue.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Suggestions:</p>
              {issue.suggestions.map((suggestion, index) => (
                <div key={index} className="text-xs bg-white p-2 rounded border">
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Line {issue.position.line}
            </span>
            <button
              onClick={() => onResolve(issue.id)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark as Resolved
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SuggestionsTabProps {
  suggestions: Suggestion[];
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
  getSuggestionIcon: (type: string) => React.ReactNode;
}

const SuggestionsTab: React.FC<SuggestionsTabProps> = ({ 
  suggestions, 
  onApply, 
  onDismiss, 
  getSuggestionIcon 
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No suggestions available</p>
        <p className="text-sm text-gray-400 mt-1">Run analysis to get suggestions</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getSuggestionIcon(suggestion.type)}
              <span className="text-sm font-medium text-gray-900">
                {suggestion.title}
              </span>
            </div>
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
          
          {suggestion.originalText && suggestion.suggestedText && (
            <div className="space-y-2 mb-3">
              <div className="text-xs">
                <span className="font-medium text-gray-600">Original:</span>
                <div className="bg-red-50 p-2 rounded border mt-1 text-gray-700">
                  {suggestion.originalText}
                </div>
              </div>
              <div className="text-xs">
                <span className="font-medium text-gray-600">Suggested:</span>
                <div className="bg-green-50 p-2 rounded border mt-1 text-gray-700">
                  {suggestion.suggestedText}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Confidence: {Math.round(suggestion.confidence * 100)}%
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 capitalize">
                {suggestion.source}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onDismiss(suggestion.id)}
                className="text-xs text-gray-600 hover:text-gray-700"
              >
                Dismiss
              </button>
              <button
                onClick={() => onApply(suggestion.id)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AIInsightsTab: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500">AI Analysis</p>
      <p className="text-sm text-gray-400 mt-1">Configure AI providers to get insights</p>
    </div>
  );
};