import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Code2,
  Link,
  Image,
  Table,
  Eye,
  EyeOff,
  Search,
  Replace,
  Zap,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Settings,
  MoreHorizontal,
  CheckSquare,
  Hash,
  Minus,
  Plus,
  Highlighter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EditorToolbarProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onSave?: () => void;
  onExport?: (format: string) => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  isPreview?: boolean;
  onTogglePreview?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
  lastSaved?: Date;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  onAnalyze, 
  isAnalyzing,
  onSave,
  onExport,
  onImport,
  onUndo,
  onRedo,
  onFind,
  onReplace,
  isPreview = false,
  onTogglePreview,
  isFullscreen = false,
  onToggleFullscreen,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  lastSaved
}) => {
  const { isDark } = useTheme();
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    // This would integrate with the actual editor
    console.log('Insert markdown:', { before, after, placeholder });
  };

  const fileButtons = [
    { icon: Save, label: '保存', shortcut: 'Ctrl+S', action: onSave || (() => {}), disabled: isSaving },
    { icon: Upload, label: '导入', action: onImport || (() => {}) },
    { icon: Download, label: '导出', action: () => onExport?.('md') },
  ];

  const editButtons = [
    { icon: Undo, label: '撤销', shortcut: 'Ctrl+Z', action: onUndo || (() => {}), disabled: !canUndo },
    { icon: Redo, label: '重做', shortcut: 'Ctrl+Y', action: onRedo || (() => {}), disabled: !canRedo },
  ];

  const formatButtons = [
    { icon: Bold, label: '粗体', shortcut: 'Ctrl+B', action: () => insertMarkdown('**', '**', '粗体') },
    { icon: Italic, label: '斜体', shortcut: 'Ctrl+I', action: () => insertMarkdown('*', '*', '斜体') },
    { icon: Underline, label: '下划线', shortcut: 'Ctrl+U', action: () => insertMarkdown('<u>', '</u>', '下划线') },
    { icon: Strikethrough, label: '删除线', action: () => insertMarkdown('~~', '~~', '删除线') },
    { icon: Highlighter, label: '高亮', action: () => insertMarkdown('==', '==', '高亮') },
    { icon: Code, label: '行内代码', shortcut: 'Ctrl+`', action: () => insertMarkdown('`', '`', '代码') },
  ];

  const headingButtons = [
    { icon: Heading1, label: '一级标题', action: () => insertMarkdown('# ', '', '一级标题') },
    { icon: Heading2, label: '二级标题', action: () => insertMarkdown('## ', '', '二级标题') },
    { icon: Heading3, label: '三级标题', action: () => insertMarkdown('### ', '', '三级标题') },
  ];

  const structureButtons = [
    { icon: List, label: '无序列表', action: () => insertMarkdown('- ', '', '列表项') },
    { icon: ListOrdered, label: '有序列表', action: () => insertMarkdown('1. ', '', '列表项') },
    { icon: CheckSquare, label: '任务列表', action: () => insertMarkdown('- [ ] ', '', '任务项') },
    { icon: Quote, label: '引用', action: () => insertMarkdown('> ', '', '引用') },
    { icon: Code2, label: '代码块', action: () => insertMarkdown('```\n', '\n```', '代码块') },
    { icon: Link, label: '链接', shortcut: 'Ctrl+K', action: () => insertMarkdown('[', '](url)', '链接文本') },
    { icon: Image, label: '图片', action: () => insertMarkdown('![', '](url)', '图片描述') },
    { icon: Table, label: '表格', action: () => insertMarkdown('| 列1 | 列2 |\n|-----|-----|\n| 内容1 | 内容2 |', '', '') },
  ];

  const toolButtons = [
    { icon: Search, label: '查找', shortcut: 'Ctrl+F', action: onFind || (() => {}) },
    { icon: Replace, label: '替换', shortcut: 'Ctrl+H', action: onReplace || (() => {}) },
    { 
      icon: isPreview ? EyeOff : Eye, 
      label: isPreview ? '编辑模式' : '预览模式', 
      action: onTogglePreview || (() => {}),
      active: isPreview
    },
    { 
      icon: isFullscreen ? Minimize2 : Maximize2, 
      label: isFullscreen ? '退出全屏' : '全屏模式', 
      shortcut: 'F11',
      action: onToggleFullscreen || (() => {}),
      active: isFullscreen
    },
  ];

  const renderButtonGroup = (buttons: any[], groupName: string) => (
    <div className="flex items-center space-x-1">
      {buttons.map((button) => (
        <button
          key={button.label}
          onClick={button.action}
          disabled={button.disabled}
          className={`
            p-2 rounded-lg transition-all duration-200 relative group
            ${button.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100 dark:hover:bg-dark-700'
            }
            ${button.active 
              ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/20' 
              : 'text-gray-600 dark:text-gray-400'
            }
          `}
          title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
        >
          <button.icon className="h-4 w-4" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {button.label}
            {button.shortcut && <span className="ml-1 text-gray-400 dark:text-gray-600">({button.shortcut})</span>}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
      {/* 主工具栏 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧工具组 */}
          <div className="flex items-center space-x-4">
            {/* 文件操作 */}
            {renderButtonGroup(fileButtons, 'file')}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 编辑操作 */}
            {renderButtonGroup(editButtons, 'edit')}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 格式化 */}
            {renderButtonGroup(formatButtons, 'format')}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 标题 */}
            {renderButtonGroup(headingButtons, 'heading')}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 结构 */}
            {renderButtonGroup(structureButtons.slice(0, 4), 'structure')}

            {/* 更多工具按钮 */}
            <button
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              title="更多工具"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* 右侧工具组 */}
          <div className="flex items-center space-x-4">
            {/* 字体大小控制 */}
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[2rem] text-center">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 工具按钮 */}
            {renderButtonGroup(toolButtons, 'tools')}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* AI 分析按钮 */}
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
                ${isAnalyzing
                  ? 'bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-theme-primary to-theme-accent text-white hover:from-theme-primary-dark hover:to-theme-accent-dark shadow-lg hover:shadow-xl transform hover:scale-105'
                }
              `}
            >
              <Zap className={`h-4 w-4 ${isAnalyzing ? '' : 'animate-pulse'}`} />
              <span className="text-sm">
                {isAnalyzing ? '分析中...' : 'AI 分析'}
              </span>
            </button>
          </div>
        </div>

        {/* 扩展工具栏 */}
        {showMoreTools && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-4">
              {/* 更多结构工具 */}
              {renderButtonGroup(structureButtons.slice(4), 'moreStructure')}

              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

              {/* 对齐工具 */}
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="左对齐">
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="居中对齐">
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="右对齐">
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

              {/* 其他工具 */}
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="设置">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400" title="主题">
                  <Palette className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>字体大小: {fontSize}px</span>
          <span>编码: UTF-8</span>
          <span>格式: Markdown</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isSaving && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>保存中...</span>
            </div>
          )}
          {lastSaved && (
            <span>
              最后保存: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <span>就绪</span>
        </div>
      </div>
    </div>
  );
};