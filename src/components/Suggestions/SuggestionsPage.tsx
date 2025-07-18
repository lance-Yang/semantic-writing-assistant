import React from 'react';
import { CheckCircle, Lightbulb, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const SuggestionsPage: React.FC = () => {
  const { suggestions, applySuggestion, dismissSuggestion } = useAppStore();

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'replace':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'restructure':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'enhance':
        return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            写作建议
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看和管理所有写作改进建议
          </p>
        </div>

        {/* Suggestions List */}
        <div className="space-y-6">
          {suggestions.length === 0 ? (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-12 text-center">
              <Lightbulb className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                暂无建议
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                开始编写文档后，系统会自动生成写作建议
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getSuggestionIcon(suggestion.type)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                        {suggestion.source}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        置信度: {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {suggestion.originalText && suggestion.suggestedText && (
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          原文:
                        </label>
                        <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {suggestion.originalText}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          建议修改:
                        </label>
                        <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {suggestion.suggestedText}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      类型: {suggestion.type} • 来源: {suggestion.source}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        忽略
                      </button>
                      <button
                        onClick={() => applySuggestion(suggestion.id)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        应用建议
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};