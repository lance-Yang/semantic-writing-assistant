import React, { useState } from 'react';
import { RefreshCw, Wand2, Sparkles, Copy, Download } from 'lucide-react';

const RewritingTool: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [rewriteMode, setRewriteMode] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRewrite = async () => {
    if (!originalText.trim()) return;
    
    setIsProcessing(true);
    // 模拟处理时间
    setTimeout(() => {
      setRewrittenText(`[${rewriteMode}模式重写] ${originalText}`);
      setIsProcessing(false);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            智能改写降重
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用AI技术对文本进行智能改写和降重处理
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              改写模式
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setRewriteMode('standard')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  rewriteMode === 'standard'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">标准改写</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">保持原意的基础上改写表达</p>
              </button>

              <button
                onClick={() => setRewriteMode('creative')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  rewriteMode === 'creative'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">创意改写</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">更富创意的表达方式</p>
              </button>

              <button
                onClick={() => setRewriteMode('academic')}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  rewriteMode === 'academic'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">学术降重</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">适合学术论文的降重</p>
              </button>
            </div>
          </div>
        </div>

        {/* Input/Output Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                原文输入
              </h3>
            </div>
            <div className="p-6">
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="请输入需要改写的文本..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  字数: {originalText.length}
                </span>
                <button
                  onClick={handleRewrite}
                  disabled={!originalText.trim() || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '改写中...' : '开始改写'}
                </button>
              </div>
            </div>
          </div>

          {/* Rewritten Text */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                改写结果
              </h3>
            </div>
            <div className="p-6">
              {rewrittenText ? (
                <div>
                  <div className="w-full h-64 p-4 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700 overflow-y-auto">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {rewrittenText}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      字数: {rewrittenText.length}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(rewrittenText)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </button>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>导出</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      改写结果将在这里显示
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              智能识别
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              自动识别文本类型和风格，提供最适合的改写方案
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              保持原意
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              在改写过程中确保原文意思不变，只改变表达方式
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              多种模式
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              提供标准、创意、学术等多种改写模式，满足不同需求
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewritingTool;