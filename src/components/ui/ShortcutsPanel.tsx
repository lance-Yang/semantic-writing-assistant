import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { key: 'Cmd+S', description: '保存文档', category: '文件' },
  { key: 'Cmd+N', description: '新建文档', category: '文件' },
  { key: 'Cmd+O', description: '打开文档', category: '文件' },
  { key: 'Cmd+Shift+A', description: '快速分析', category: '编辑' },
  { key: 'Cmd+F', description: '查找', category: '编辑' },
  { key: 'Cmd+R', description: '替换', category: '编辑' },
  { key: 'Cmd+B', description: '粗体', category: '格式' },
  { key: 'Cmd+I', description: '斜体', category: '格式' },
  { key: 'Cmd+U', description: '下划线', category: '格式' },
  { key: 'Cmd+1', description: '切换到仪表板', category: '导航' },
  { key: 'Cmd+2', description: '切换到编辑器', category: '导航' },
  { key: 'Cmd+3', description: '切换到文本生成', category: '导航' },
  { key: 'Cmd+/', description: '显示快捷键', category: '帮助' },
];

interface ShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customShortcuts?: Array<{
    key: string;
    description: string;
    category: string;
    action?: () => void;
  }>;
}

export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">键盘快捷键</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded border">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ShortcutsButtonProps {
  onClick?: () => void;
}

export const ShortcutsButton: React.FC<ShortcutsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 group interactive-hover"
      title="查看快捷键"
    >
      <Keyboard className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-300" />
    </button>
  );
};