import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, Clock, TrendingUp, Activity, Plus, Upload, Download, Archive, MoreHorizontal, Folder, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { Document } from '../../types';

const Dashboard: React.FC = () => {
  const { 
    documents, 
    currentDocument, 
    setCurrentDocument, 
    loadDocuments,
    createTauriDocument,
    deleteTauriDocument,
    importDocument,
    exportDocument,
    createBackup,
    restoreFromBackup,
    loadTauriDocument,
    storageStats 
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showDocumentActions, setShowDocumentActions] = useState<string | null>(null);
  const [isDocumentSectionCollapsed, setIsDocumentSectionCollapsed] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const totalWords = documents.reduce((sum, doc) => sum + doc.metadata.wordCount, 0);
  const totalCharacters = documents.reduce((sum, doc) => sum + doc.metadata.characterCount, 0);
  const recentDocuments = documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const stats = [
    {
      label: '总文档数',
      value: documents.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '总字数',
      value: totalWords.toLocaleString(),
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '总字符数',
      value: totalCharacters.toLocaleString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '活跃项目',
      value: documents.filter(doc => {
        const daysSinceUpdate = (Date.now() - new Date(doc.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate <= 7;
      }).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    
    setIsLoading(true);
    try {
      await createTauriDocument(newDocTitle, '');
      setNewDocTitle('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = async (document: Document) => {
    try {
      await loadTauriDocument(document.id);
    } catch (error) {
      console.error('Failed to load document:', error);
      // Fallback to setting the document directly
      setCurrentDocument({
        ...document,
        format: (document.format || 'markdown') as 'markdown' | 'txt' | 'docx' | 'html',
        metadata: {
          ...document.metadata,
          wordCount: document.content?.split(' ').length || 0,
          characterCount: document.content?.length || 0,
          tags: document.metadata?.tags || [],
          language: document.metadata?.language || 'en',
        }
      });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTauriDocument(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDocument = async () => {
    setIsLoading(true);
    try {
      await importDocument();
    } catch (error) {
      console.error('Failed to import document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDocument = async (id: string) => {
    setIsLoading(true);
    try {
      await exportDocument(id);
    } catch (error) {
      console.error('Failed to export document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async (id: string) => {
    setIsLoading(true);
    try {
      await createBackup(id);
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsLoading(true);
    try {
      await restoreFromBackup();
    } catch (error) {
      console.error('Failed to restore backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            智能写作助手
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            欢迎回来！继续您的写作之旅
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} dark:text-opacity-80`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Document Management Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                文档管理
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{documents.length} 个文档</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <span>{totalWords.toLocaleString()} 字</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 hover:scale-105 transform duration-200"
              >
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">新建文档</span>
              </button>
              <button
                onClick={handleImportDocument}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 hover:scale-105 transform duration-200"
              >
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">导入文档</span>
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={isLoading}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-50 hover:scale-105 transform duration-200"
              >
                <Archive className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">恢复备份</span>
              </button>
              <button
                onClick={() => setIsDocumentSectionCollapsed(!isDocumentSectionCollapsed)}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-colors"
              >
                <Folder className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">
                  {isDocumentSectionCollapsed ? '展开列表' : '收起列表'}
                </span>
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="文档标题"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
                  autoFocus
                />
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleCreateDocument}
                    disabled={isLoading || !newDocTitle.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    创建
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewDocTitle('');
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Documents List */}
            {!isDocumentSectionCollapsed && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    最近文档
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                      {documents.length} 个文档
                    </span>
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">暂无文档</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      创建您的第一个文档开始使用
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentDocuments.map((doc, index) => (
                      <div
                        key={doc.id}
                        className={`relative group rounded-xl border transition-all duration-200 ${
                          currentDocument?.id === doc.id
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-md'
                            : 'bg-gray-50/50 dark:bg-slate-800/50 border-gray-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <button
                          onClick={() => handleDocumentSelect(doc)}
                          className="w-full text-left p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                {doc.title}
                              </div>
                              <div className="flex items-center space-x-3 mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {doc.metadata.wordCount} 字
                                </span>
                                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(doc.updatedAt).toLocaleDateString('zh-CN', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            {currentDocument?.id === doc.id && (
                              <div className="w-2 h-2 bg-green-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                          
                          {/* Progress indicator */}
                          <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(100, (doc.metadata.wordCount / 1000) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </button>

                        {/* Document Actions Menu */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDocumentActions(showDocumentActions === doc.id ? null : doc.id);
                            }}
                            className="p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          
                          {showDocumentActions === doc.id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-10 min-w-32">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportDocument(doc.id);
                                  setShowDocumentActions(null);
                                }}
                                disabled={isLoading}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Download className="h-3 w-3" />
                                <span>导出</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateBackup(doc.id);
                                  setShowDocumentActions(null);
                                }}
                                disabled={isLoading}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                              >
                                <Archive className="h-3 w-3" />
                                <span>备份</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id);
                                  setShowDocumentActions(null);
                                }}
                                disabled={isLoading}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>删除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isDocumentSectionCollapsed && (
              <div className="text-center py-4">
                <button
                  onClick={() => setIsDocumentSectionCollapsed(false)}
                  className="flex items-center justify-center mx-auto text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  展开查看 {documents.length} 个文档
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                快速操作
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">新建文档</span>
                </button>
                <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">数据分析</span>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">协作</span>
                </button>
                <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">AI 助手</span>
                </button>
              </div>
            </div>
          </div>

          {/* Storage Stats */}
          {storageStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  存储统计
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {storageStats.total_documents}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">文档总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {storageStats.total_words.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">总字数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {storageStats.total_characters.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">总字符数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {storageStats.cached_documents}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">缓存文档</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">处理中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;