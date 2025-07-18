import React, { useState, useRef, useEffect } from 'react';
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  EyeOff,
  Search,
  Replace,
  Zap,
  Save,
  Download,
  Upload,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  Type,
  Palette,
  Settings,
  MoreHorizontal,
  ChevronDown,
  FileText,
  Printer,
  Share2,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckSquare,
  Hash,
  Minus,
  Plus,
  Highlighter
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EnhancedEditorToolbarProps {
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

interface ToolbarGroup {
  name: string;
  items: ToolbarItem[];
}

interface ToolbarItem {
  icon: React.ComponentType<any>;
  label: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const EnhancedEditorToolbar: React.FC<EnhancedEditorToolbarProps> = ({
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // 文件操作组
  const fileGroup: ToolbarGroup = {
    name: 'file',
    items: [
      { icon: Save, label: '保存', shortcut: 'Ctrl+S', action: onSave || (() => {}), disabled: isSaving },
      { icon: Upload, label: '导入', action: onImport || (() => {}) },
      { icon: Download, label: '导出', action: () => handleDropdownToggle('export') },
      { icon: Printer, label: '打印', shortcut: 'Ctrl+P', action: () => window.print() },
      { icon: Share2, label: '分享', action: () => handleDropdownToggle('share') },
    ]
  };

  // 编辑操作组
  const editGroup: ToolbarGroup = {
    name: 'edit',
    items: [
      { icon: Undo, label: '撤销', shortcut: 'Ctrl+Z', action: onUndo || (() => {}), disabled: !canUndo },
      { icon: Redo, label: '重做', shortcut: 'Ctrl+Y', action: onRedo || (() => {}), disabled: !canRedo },
      { icon: Copy, label: '复制', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
      { icon: Scissors, label: '剪切', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
      { icon: Clipboard, label: '粘贴', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
    ]
  };

  // 格式化组
  const formatGroup: ToolbarGroup = {
    name: 'format',
    items: [
      { icon: Bold, label: '粗体', shortcut: 'Ctrl+B', action: () => insertMarkdown('**', '**', '粗体') },
      { icon: Italic, label: '斜体', shortcut: 'Ctrl+I', action: () => insertMarkdown('*', '*', '斜体') },
      { icon: Underline, label: '下划线', shortcut: 'Ctrl+U', action: () => insertMarkdown('<u>', '</u>', '下划线') },
      { icon: Strikethrough, label: '删除线', action: () => insertMarkdown('~~', '~~', '删除线') },
      { icon: Highlighter, label: '高亮', action: () => insertMarkdown('==', '==', '高亮文本') },
      { icon: Code, label: '行内代码', shortcut: 'Ctrl+`', action: () => insertMarkdown('`', '`', '代码') },
    ]
  };

  // 标题组
  const headingGroup: ToolbarGroup = {
    name: 'heading',
    items: [
      { icon: Heading1, label: '一级标题', action: () => insertMarkdown('# ', '', '一级标题') },
      { icon: Heading2, label: '二级标题', action: () => insertMarkdown('## ', '', '二级标题') },
      { icon: Heading3, label: '三级标题', action: () => insertMarkdown('### ', '', '三级标题') },
    ]
  };

  // 列表和结构组
  const structureGroup: ToolbarGroup = {
    name: 'structure',
    items: [
      { icon: List, label: '无序列表', action: () => insertMarkdown('- ', '', '列表项') },
      { icon: ListOrdered, label: '有序列表', action: () => insertMarkdown('1. ', '', '列表项') },
      { icon: CheckSquare, label: '任务列表', action: () => insertMarkdown('- [ ] ', '', '任务项') },
      { icon: Quote, label: '引用', action: () => insertMarkdown('> ', '', '引用内容') },
      { icon: Code2, label: '代码块', action: () => insertMarkdown('```\n', '\n```', '代码块') },
      { icon: Minus, label: '分割线', action: () => insertMarkdown('\n---\n', '', '') },
    ]
  };

  // 对齐组
  const alignGroup: ToolbarGroup = {
    name: 'align',
    items: [
      { icon: AlignLeft, label: '左对齐', action: () => {} },
      { icon: AlignCenter, label: '居中对齐', action: () => {} },
      { icon: AlignRight, label: '右对齐', action: () => {} },
      { icon: AlignJustify, label: '两端对齐', action: () => {} },
    ]
  };

  // 插入组
  const insertGroup: ToolbarGroup = {
    name: 'insert',
    items: [
      { icon: Link, label: '链接', shortcut: 'Ctrl+K', action: () => insertMarkdown('[', '](url)', '链接文本') },
      { icon: Image, label: '图片', action: () => insertMarkdown('![', '](url)', '图片描述') },
      { icon: Table, label: '表格', action: () => insertTable() },
      { icon: Hash, label: '标签', action: () => insertMarkdown('#', '', '标签') },
    ]
  };

  // 查找替换组
  const searchGroup: ToolbarGroup = {
    name: 'search',
    items: [
      { icon: Search, label: '查找', shortcut: 'Ctrl+F', action: onFind || (() => {}) },
      { icon: Replace, label: '替换', shortcut: 'Ctrl+H', action: onReplace || (() => {}) },
    ]
  };

  // 视图组
  const viewGroup: ToolbarGroup = {
    name: 'view',
    items: [
      { 
        icon: isPreview ? EyeOff : Eye, 
        label: isPreview ? '编辑模式' : '预览模式', 
        action: onTogglePreview || (() => {}),
        active: isPreview,
        variant: isPreview ? 'primary' : 'default'
      },
      { 
        icon: isFullscreen ? Minimize2 : Maximize2, 
        label: isFullscreen ? '退出全屏' : '全屏模式', 
        shortcut: 'F11',
        action: onToggleFullscreen || (() => {}),
        active: isFullscreen
      },
    ]
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    // This would integrate with the actual editor
    console.log('Insert markdown:', { before, after, placeholder });
  };

  const insertTable = () => {
    const tableMarkdown = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
`;
    insertMarkdown(tableMarkdown, '', '');
  };

  const renderToolbarGroup = (group: ToolbarGroup) => (
    <div key={group.name} className="flex items-center space-x-1">
      {group.items.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          disabled={item.disabled}
          className={`
            p-2 rounded-lg transition-all duration-200 relative group
            ${item.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100 dark:hover:bg-dark-700'
            }
            ${item.active 
              ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/20' 
              : 'text-gray-600 dark:text-gray-400'
            }
            ${item.variant === 'primary' ? 'bg-theme-primary text-white hover:bg-theme-primary-dark' : ''}
            ${item.variant === 'success' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
            ${item.variant === 'warning' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
            ${item.variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
          `}
          title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
        >
          <item.icon className="h-4 w-4" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.label}
            {item.shortcut && <span className="ml-1 text-gray-400 dark:text-gray-600">({item.shortcut})</span>}
          </div>
        </button>
      ))}
    </div>
  );

  const renderDropdown = (name: string, items: Array<{ label: string; action: () => void; icon?: React.ComponentType<any> }>) => (
    activeDropdown === name && (
      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              item.action();
              setActiveDropdown(null);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center space-x-2"
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    )
  );

  return (
    <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 relative">
      {/* 主工具栏 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧工具组 */}
          <div className="flex items-center space-x-4">
            {/* 文件操作 */}
            <div className="relative" ref={dropdownRef}>
              {renderToolbarGroup(fileGroup)}
              {renderDropdown('export', [
                { label: '导出为 Markdown', action: () => onExport?.('md'), icon: FileText },
                { label: '导出为 PDF', action: () => onExport?.('pdf'), icon: FileText },
                { label: '导出为 Word', action: () => onExport?.('docx'), icon: FileText },
                { label: '导出为 HTML', action: () => onExport?.('html'), icon: FileText },
              ])}
              {renderDropdown('share', [
                { label: '复制链接', action: () => {}, icon: Link },
                { label: '生成分享码', action: () => {}, icon: Share2 },
                { label: '导出为图片', action: () => {}, icon: Image },
              ])}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 编辑操作 */}
            {renderToolbarGroup(editGroup)}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 格式化 */}
            {renderToolbarGroup(formatGroup)}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 标题 */}
            {renderToolbarGroup(headingGroup)}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 结构 */}
            {renderToolbarGroup(structureGroup)}

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

            {/* 查找替换 */}
            {renderToolbarGroup(searchGroup)}

            <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

            {/* 视图控制 */}
            {renderToolbarGroup(viewGroup)}

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
              {/* 对齐工具 */}
              {renderToolbarGroup(alignGroup)}

              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

              {/* 插入工具 */}
              {renderToolbarGroup(insertGroup)}

              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />

              {/* 其他工具 */}
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                  title="设置"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                  title="主题"
                >
                  <Palette className="h-4 w-4" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                  title="重置"
                >
                  <RotateCcw className="h-4 w-4" />
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