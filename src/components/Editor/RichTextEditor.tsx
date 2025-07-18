import React, { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Link, Eye, EyeOff } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "开始编写...",
  className = "",
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    onChange(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [content, onChange]);

  const formatActions = [
    {
      icon: Bold,
      label: '粗体',
      shortcut: 'Cmd+B',
      action: () => insertText('**', '**', '粗体文本'),
    },
    {
      icon: Italic,
      label: '斜体',
      shortcut: 'Cmd+I',
      action: () => insertText('*', '*', '斜体文本'),
    },
    {
      icon: Underline,
      label: '下划线',
      shortcut: 'Cmd+U',
      action: () => insertText('<u>', '</u>', '下划线文本'),
    },
    {
      icon: List,
      label: '项目符号',
      action: () => insertText('\n- ', '', '列表项'),
    },
    {
      icon: ListOrdered,
      label: '编号列表',
      action: () => insertText('\n1. ', '', '列表项'),
    },
    {
      icon: Quote,
      label: '引用',
      action: () => insertText('\n> ', '', '引用'),
    },
    {
      icon: Code,
      label: '代码',
      action: () => insertText('`', '`', '代码'),
    },
    {
      icon: Link,
      label: '链接',
      action: () => insertText('[', '](url)', '链接文本'),
    },
  ];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatActions[0].action();
          break;
        case 'i':
          e.preventDefault();
          formatActions[1].action();
          break;
        case 'u':
          e.preventDefault();
          formatActions[2].action();
          break;
      }
    }

    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ', '', '');
    }
  }, [formatActions, insertText]);

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
        <div className="flex items-center space-x-1">
          {formatActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition-colors"
              title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
            >
              <action.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          ))}
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded transition-colors"
        >
          {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{isPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 relative">
        {isPreview ? (
          <div 
            className="h-full p-6 overflow-y-auto prose prose-sm max-w-none dark:prose-invert custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-6 resize-none border-none outline-none bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 leading-relaxed custom-scrollbar"
            placeholder={placeholder}
            data-editor
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  );
};