import React from 'react';
import { Lightbulb, Zap, Wand2, Sparkles } from 'lucide-react';

const TextGenerationPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI 文本生成
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用人工智能生成高质量的文本内容
          </p>
        </div>

        {/* Generation Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                创意写作
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              生成创意故事、文章开头或灵感片段
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              开始创作
            </button>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                商业文案
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              生成营销文案、产品描述和广告语
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              生成文案
            </button>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                技术文档
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              生成API文档、用户手册和技术说明
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              生成文档
            </button>
          </div>
        </div>

        {/* Generation Form */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              自定义生成
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生成类型
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100">
                  <option>文章</option>
                  <option>故事</option>
                  <option>邮件</option>
                  <option>报告</option>
                  <option>其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主题或关键词
                </label>
                <input
                  type="text"
                  placeholder="请输入主题或关键词..."
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  详细描述
                </label>
                <textarea
                  rows={4}
                  placeholder="请详细描述您想要生成的内容..."
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    长度
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100">
                    <option>短篇 (100-300字)</option>
                    <option>中篇 (300-800字)</option>
                    <option>长篇 (800字以上)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    风格
                  </label>
                  <select className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100">
                    <option>正式</option>
                    <option>轻松</option>
                    <option>学术</option>
                    <option>创意</option>
                  </select>
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium">
                开始生成
              </button>
            </div>
          </div>
        </div>

        {/* Generated Content */}
        <div className="mt-8 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              生成结果
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                生成的内容将在这里显示
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextGenerationPage;