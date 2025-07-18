import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { SuggestionPanel } from '../SuggestionPanel/SuggestionPanel';
import { RichTextEditor } from './RichTextEditor';
import { useSemanticAnalysis } from '../../hooks/useSemanticAnalysis';
import { useAutoSave } from '../../hooks/useAutoSave';
import { workerManager } from '../../utils/workerManager';
import type { Document } from '../../types';
import { EditorToolbar } from './EditorToolbar';

const MainEditor: React.FC = () => {
  const { 
    currentDocument, 
    updateDocument, 
    addDocument, 
    setCurrentDocument,
    settings,
    loadDocuments,
    loadStorageStats,
    createTauriDocument,
    setSemanticTerms,
    setConsistencyIssues,
    setSuggestions,
    setAnalyzing
  } = useAppStore();
  
  const [content, setContent] = useState(currentDocument?.content || '');
  const [title, setTitle] = useState(currentDocument?.title || '无标题文档');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Custom hooks
  const { analyze } = useSemanticAnalysis();
  useAutoSave(content, title);

  // Load documents and storage stats on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadDocuments();
        await loadStorageStats();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [loadDocuments, loadStorageStats]);

  // Create new document if none exists
  useEffect(() => {
    const createNewDocument = async () => {
      if (!currentDocument) {
        try {
          const id = await createTauriDocument('无标题文档', '');
          // The document will be loaded automatically by the store
        } catch (error) {
          console.error('Failed to create new document:', error);
          // Fallback to local document creation
          const newDoc: Document = {
            id: crypto.randomUUID(),
            title: '无标题文档',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            format: 'markdown',
            metadata: {
              wordCount: 0,
              characterCount: 0,
              tags: [],
              language: 'en'
            }
          };
          addDocument(newDoc);
          setCurrentDocument(newDoc);
        }
      }
    };

    createNewDocument();
  }, [currentDocument?.id, addDocument, setCurrentDocument, createTauriDocument]);

  // Sync content with current document
  useEffect(() => {
    if (currentDocument && 
        (content !== currentDocument.content || title !== currentDocument.title)) {
      setContent(currentDocument.content);
      setTitle(currentDocument.title);
    }
  }, [currentDocument?.id, currentDocument?.content, currentDocument?.title]);

  // Update document metadata with debounce to prevent infinite loops
  useEffect(() => {
    if (currentDocument && (content !== currentDocument.content || title !== currentDocument.title)) {
      const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characterCount = content.length;
      
      // Use a timeout to debounce updates
      const timeoutId = setTimeout(() => {
        updateDocument(currentDocument.id, {
          content,
          title,
          updatedAt: new Date(),
          metadata: {
            ...currentDocument.metadata,
            wordCount,
            characterCount
          }
        });
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [content, title, currentDocument?.id, updateDocument]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Trigger semantic analysis if auto-analysis is enabled and content is substantial
    if (settings.autoAnalysis && newContent.length > 100) {
      performBackgroundAnalysis(newContent);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const performBackgroundAnalysis = async (text: string) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalyzing(true);
    
    try {
      const result = await workerManager.analyzeSemantics(text);
      
      // Update store with analysis results
      setSemanticTerms(result.semanticTerms);
      setConsistencyIssues(result.consistencyIssues);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Background analysis failed:', error);
      // Fallback to regular analysis
      analyze(text);
    } finally {
      setIsAnalyzing(false);
      setAnalyzing(false);
    }
  };

  const handleManualAnalysis = () => {
    if (content) {
      performBackgroundAnalysis(content);
    }
  };

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center max-w-md mx-auto p-8">
          {/* 图标区域 */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              开始您的创作之旅
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              选择一个文档开始编辑，或者创建一个新文档来开始您的写作。
              <br />
              我们的AI助手将帮助您提升写作质量。
            </p>
          </div>

          {/* 操作按钮组 */}
          <div className="space-y-4">
            {/* 新建文档按钮 */}
            <button 
              onClick={() => createTauriDocument('无标题文档', '')}
              className="w-full bg-gradient-to-r from-theme-primary to-theme-accent text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>新建文档</span>
            </button>

            {/* 导入文档按钮 */}
            <button 
              className="w-full bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>导入文档</span>
            </button>

            {/* 从模板创建按钮 */}
            <button 
              className="w-full bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>从模板创建</span>
            </button>
          </div>

          {/* 快捷提示 */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">💡 <strong>快捷提示：</strong></p>
              <div className="space-y-1 text-left">
                <p>• 使用 <kbd className="px-2 py-1 bg-gray-200 dark:bg-dark-600 rounded text-xs">Ctrl+N</kbd> 快速新建文档</p>
                <p>• 使用 <kbd className="px-2 py-1 bg-gray-200 dark:bg-dark-600 rounded text-xs">Ctrl+O</kbd> 打开现有文档</p>
                <p>• 拖拽文件到此处可直接导入</p>
              </div>
            </div>
          </div>

          {/* 最近文档快速访问 */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">最近使用的文档</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">示例文档.md</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2分钟前</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Enhanced Editor Toolbar */}
      <EditorToolbar
        onAnalyze={handleManualAnalysis}
        isAnalyzing={isAnalyzing}
        onSave={() => {/* 实现保存逻辑 */}}
        onExport={(format) => {/* 实现导出逻辑 */}}
        onImport={() => {/* 实现导入逻辑 */}}
        onUndo={() => {/* 实现撤销逻辑 */}}
        onRedo={() => {/* 实现重做逻辑 */}}
        onFind={() => {/* 实现查找逻辑 */}}
        onReplace={() => {/* 实现替换逻辑 */}}
        isPreview={false}
        onTogglePreview={() => {/* 实现预览切换逻辑 */}}
        isFullscreen={false}
        onToggleFullscreen={() => {/* 实现全屏切换逻辑 */}}
        canUndo={false}
        canRedo={false}
        isSaving={false}
        lastSaved={currentDocument?.updatedAt}
      />
      
      <div className="flex flex-1">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              placeholder="文档标题..."
            />
          </div>

          {/* Rich Text Editor */}
          <div className="flex-1">
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="开始编写您的文档..."
            />
          </div>

          {/* Status Bar */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{currentDocument.metadata.wordCount} 字</span>
              <span>{currentDocument.metadata.characterCount} 字符</span>
              <span>格式: {currentDocument.format.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAnalyzing && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>后台分析中...</span>
                </div>
              )}
              <button
                onClick={handleManualAnalysis}
                disabled={isAnalyzing}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50"
              >
                快速分析
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion Panel */}
        <SuggestionPanel />
      </div>
    </div>
  );
};

export default MainEditor;