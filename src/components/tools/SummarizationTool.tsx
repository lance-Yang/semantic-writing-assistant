import React, { useState } from 'react';
import { FileText, Minimize2, Expand, Copy, Download } from 'lucide-react';

const SummarizationTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'summarize' | 'expand'>('summarize');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    // 模拟处理时间
    setTimeout(() => {
      if (mode === 'summarize') {
        setOutputText(`[${summaryLength}摘要] ${inputText.substring(0, 200)}...`);
      } else {
        setOutputText(`[扩展内容] ${inputText}\n\n这里是基于原文扩展的详细内容...`);
      }
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
            摘要扩展工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            智能文本摘要生成和内容扩展
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              处理模式
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('summarize')}
                className={`p-6 rounded-lg border text-left transition-colors ${
                  mode === 'summarize'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <Minimize2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  智能摘要
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  提取文本核心内容，生成简洁摘要
                </p>
              </button>

              <button
                onClick={() => setMode('expand')}
                className={`p-6 rounded-lg border text-left transition-colors ${
                  mode === 'expand'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
              >
                <Expand className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  内容扩展
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  基于原文扩展详细内容和论述
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        {mode === 'summarize' && (
          <div className="mb-6 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                摘要设置
              </h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  摘要长度
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short', label: '简短', desc: '1-2句话' },
                    { value: 'medium', label: '中等', desc: '3-5句话' },
                    { value: 'long', label: '详细', desc: '5-10句话' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSummaryLength(option.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        summaryLength === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input/Output Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Text */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'summarize' ? '原文输入' : '要扩展的内容'}
              </h3>
            </div>
            <div className="p-6">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === 'summarize'
                    ? '请输入需要生成摘要的文本...'
                    : '请输入需要扩展的内容...'
                }
                className="w-full h-64 p-4 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  字数: {inputText.length}
                </span>
                <button
                  onClick={handleProcess}
                  disabled={!inputText.trim() || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing
                    ? '处理中...'
                    : mode === 'summarize'
                    ? '生成摘要'
                    : '扩展内容'}
                </button>
              </div>
            </div>
          </div>

          {/* Output Text */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'summarize' ? '生成摘要' : '扩展结果'}
              </h3>
            </div>
            <div className="p-6">
              {outputText ? (
                <div>
                  <div className="w-full h-64 p-4 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700 overflow-y-auto">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {outputText}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      字数: {outputText.length}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(outputText)}
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
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {mode === 'summarize' ? '摘要结果' : '扩展结果'}将在这里显示
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
              智能提取
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              自动识别文本关键信息，提取核心观点和要点
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              多种长度
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支持不同长度的摘要生成，满足各种使用场景
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              内容扩展
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              基于原文进行合理扩展，丰富内容细节和论述
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizationTool;