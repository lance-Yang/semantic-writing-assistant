import React from 'react';
import { Brain, Lightbulb, MessageCircle, Settings } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const AIAssistantPage: React.FC = () => {
  const { settings, aiProviders, activeAIProvider } = useAppStore();

  if (!settings.aiEnabled) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center max-w-md mx-auto p-8">
          <Brain className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            AI 功能未启用
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            请在设置中启用 AI 功能以使用智能写作助手
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            前往设置
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI 写作助手
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用人工智能提升您的写作质量和效率
          </p>
        </div>

        {/* AI Provider Status */}
        <div className="mb-8 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              AI 提供商状态
            </h2>
          </div>
          <div className="p-6">
            {aiProviders.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  尚未配置 AI 提供商
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  添加 AI 提供商
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {aiProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-4 rounded-lg border ${
                      activeAIProvider === provider.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.type} - {provider.model}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            provider.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.enabled ? '已启用' : '已禁用'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                智能建议
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              基于内容分析提供写作改进建议
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              开始分析
            </button>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                对话助手
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              与 AI 对话获取写作灵感和建议
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              开始对话
            </button>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                深度分析
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              全面分析文档结构、逻辑和风格
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              开始分析
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};