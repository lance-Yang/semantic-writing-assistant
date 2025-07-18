import React, { useState, useEffect } from 'react';
import { Save, Play, Pause, Settings, Zap, Clock, Eye } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { ThemeSelector } from '../ui/ThemeSelector';
import { ShortcutsButton, ShortcutsPanel } from '../ui/ShortcutsPanel';
import { AIConfiguration } from '../AI/AIConfiguration';
import { aiService } from '../../services/aiService';

export const Header: React.FC = () => {
  const { 
    currentDocument, 
    isAnalyzing, 
    settings, 
    aiProviders, 
    activeAIProvider,
    setSuggestions,
    setSemanticTerms,
    setAnalyzing
  } = useAppStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);

  // Listen for global shortcut events
  useEffect(() => {
    const handleShowShortcuts = () => {
      setShowShortcuts(true);
    };

    window.addEventListener('show-shortcuts', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, []);

  const handleAIAnalysis = async () => {
    if (!currentDocument || !activeAIProvider || isAnalyzing) return;

    const provider = aiProviders.find(p => p.id === activeAIProvider);
    if (!provider) {
      alert('No active AI provider found. Please configure an AI provider first.');
      setShowAIConfig(true);
      return;
    }

    setAnalyzing(true);
    try {
      const result = await aiService.analyzeText(currentDocument.content, provider);
      
      // Update store with AI analysis results
      setSuggestions(result.suggestions.map(s => ({
        id: s.id,
        type: s.type as any,
        priority: s.priority as any,
        title: s.message,
        description: s.reason,
        message: s.message,
        originalText: s.originalText,
        suggestedText: s.suggestedText,
        reason: s.reason,
        confidence: 0.8,
        source: 'ai' as const,
      })));

      setSemanticTerms(result.semanticTerms.map(t => ({
        id: t.id,
        term: t.term,
        variants: [],
        category: t.category,
        context: t.context,
        frequency: t.importance * 10,
        positions: [],
      })));

    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('AI analysis failed. Please check your AI provider configuration.');
    } finally {
      setAnalyzing(false);
    }
  };

  const activeProvider = aiProviders.find(p => p.id === activeAIProvider);

  return (
    <>
      <header className="panel-glass border-b divider px-6 py-4 backdrop-blur-xl animate-slide-down shadow-elegant">
        <div className="flex items-center justify-between">
          {/* Document Info */}
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 animate-fade-in">
                  {currentDocument?.title || 'Untitled Document'}
                </h1>
                {currentDocument && (
                  <div className="flex items-center space-x-2 animate-scale-in">
                    <div className="status-online"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">已同步</span>
                  </div>
                )}
              </div>
              {currentDocument && (
                <div className="flex items-center space-x-4 mt-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                    <Eye className="h-3 w-3" />
                    <span>{currentDocument.metadata.wordCount} 字</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                    <span>{currentDocument.metadata.characterCount} 字符</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(currentDocument.updatedAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Auto-save indicator */}
            {settings.autoSave && currentDocument && (
              <div className="flex items-center space-x-2 px-3 py-1.5 glass-light rounded-xl border border-green-200/60 dark:border-green-800/60 animate-scale-in">
                <div className="status-online"></div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">自动保存</span>
              </div>
            )}

            {/* Analysis button */}
            <button
              className={`btn ${isAnalyzing ? 'btn-secondary' : 'btn-primary'} px-4 py-2.5 shadow-soft interactive-hover interactive-press`}
              disabled={!currentDocument}
            >
              {isAnalyzing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  分析中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  快速分析
                </>
              )}
            </button>

            {/* AI Analysis button */}
            <button
              onClick={handleAIAnalysis}
              className="btn btn-secondary px-4 py-2.5 relative shadow-soft group interactive-hover interactive-press"
              disabled={!currentDocument || isAnalyzing}
              title={activeProvider ? `AI Analysis with ${activeProvider.name}` : 'Configure AI Provider'}
            >
              <Zap className="h-4 w-4 mr-2 group-hover:text-yellow-500 transition-colors" />
              AI 分析
              {!activeProvider && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
              )}
              {activeProvider && (
                <div className="ml-2 badge-primary text-xs animate-fade-in">
                  {activeProvider.name}
                </div>
              )}
            </button>

            {/* Save button */}
            <button
              className="btn btn-ghost px-4 py-2.5 interactive-hover interactive-press"
              disabled={!currentDocument}
              title="保存文档 (⌘S)"
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200/80 dark:bg-slate-700/80"></div>

            {/* Theme selector */}
            <div className="animate-scale-in" style={{ animationDelay: '300ms' }}>
              <ThemeSelector />
            </div>

            {/* Shortcuts button */}
            <div className="animate-scale-in" style={{ animationDelay: '400ms' }}>
              <ShortcutsButton onClick={() => setShowShortcuts(true)} />
            </div>

            {/* Settings button */}
            <button 
              onClick={() => setShowAIConfig(true)}
              className="p-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 group interactive-hover animate-scale-in"
              style={{ animationDelay: '500ms' }}
              title="AI 配置"
            >
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* Progress Bar for Analysis */}
        {isAnalyzing && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">正在分析文档...</span>
              <span className="text-sm text-slate-500 dark:text-slate-500">AI 驱动</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </header>

      {/* Shortcuts Panel */}
      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* AI Configuration */}
      <AIConfiguration
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
      />
    </>
  );
};