import React from 'react';
import { BarChart3, TrendingUp, FileText, Clock, Target, Activity } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const AnalyticsPage: React.FC = () => {
  const { documents, semanticTerms, consistencyIssues, suggestions } = useAppStore();

  const totalWords = documents.reduce((sum, doc) => sum + doc.metadata.wordCount, 0);
  const totalCharacters = documents.reduce((sum, doc) => sum + doc.metadata.characterCount, 0);
  const avgWordsPerDoc = documents.length > 0 ? Math.round(totalWords / documents.length) : 0;

  const stats = [
    {
      label: '总文档数',
      value: documents.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      label: '总字数',
      value: totalWords.toLocaleString(),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
    },
    {
      label: '平均字数/文档',
      value: avgWordsPerDoc.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5%',
    },
    {
      label: '发现的术语',
      value: semanticTerms.length,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+15%',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            数据分析
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看您的写作统计和分析结果
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} dark:text-opacity-80`} />
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Analysis */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                文档分析
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {doc.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{doc.metadata.wordCount} 字</span>
                        <span>{doc.metadata.characterCount} 字符</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Math.round((doc.metadata.wordCount / 1000) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">完成度</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                问题摘要
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {consistencyIssues.filter(issue => issue.severity === 'high').length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">高优先级</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {consistencyIssues.filter(issue => issue.severity === 'medium').length}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">中优先级</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {consistencyIssues.filter(issue => issue.severity === 'low').length}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">低优先级</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">建议状态</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">总建议数</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {suggestions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">待处理</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {suggestions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Terms */}
        <div className="mt-8 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              高频术语
            </h2>
          </div>
          <div className="p-6">
            {semanticTerms.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">暂无术语数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semanticTerms.slice(0, 9).map((term) => (
                  <div
                    key={term.id}
                    className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {term.term}
                      </h3>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {term.frequency}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      分类: {term.category}
                    </div>
                    {term.variants.length > 0 && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        变体: {term.variants.slice(0, 2).join(', ')}
                        {term.variants.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};