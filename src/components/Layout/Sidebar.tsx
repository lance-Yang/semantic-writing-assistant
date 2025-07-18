import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Settings, Brain, BarChart3, Home, Sparkles, RefreshCw, Languages, TrendingUp, FileText as FileTemplate, Users, PenTool } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: '仪表板', path: '/', active: location.pathname === '/' },
    { icon: FileText, label: '编辑器', path: '/editor', active: location.pathname === '/editor' },
    { icon: PenTool, label: 'AI写作', path: '/ai-writing', active: location.pathname === '/ai-writing' },
    { icon: Sparkles, label: '文本生成', path: '/text-generation', active: location.pathname === '/text-generation' },
    { icon: RefreshCw, label: '改写降重', path: '/rewriting', active: location.pathname === '/rewriting' },
    { icon: FileText, label: '摘要扩展', path: '/summarization', active: location.pathname === '/summarization' },
    { icon: Languages, label: '智能翻译', path: '/translation', active: location.pathname === '/translation' },
    { icon: TrendingUp, label: 'SEO优化', path: '/seo', active: location.pathname === '/seo' },
    { icon: FileTemplate, label: '写作模板', path: '/templates', active: location.pathname === '/templates' },
    { icon: Users, label: '协作功能', path: '/collaboration', active: location.pathname === '/collaboration' },
    { icon: Brain, label: 'AI 分析', path: '/ai', active: location.pathname === '/ai' },
    { icon: BarChart3, label: '统计数据', path: '/analytics', active: location.pathname === '/analytics' },
    { icon: Settings, label: '设置', path: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <div className="w-64 panel-glass border-r border-slate-200/80 dark:border-slate-700/80 flex flex-col animate-fade-in shadow-elegant h-screen">
      {/* Logo/Title */}
      <div className="p-6 border-b divider flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-glow animate-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient animate-gradient">
              智能写作助手
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AI-Powered Writing
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <Link
            key={item.label}
            to={item.path}
            className={`${
              item.active ? 'nav-item-active' : 'nav-item-inactive'
            } animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative">
              <item.icon className="h-5 w-5 relative z-10" />
              {item.active && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-scale-in"></div>
              )}
            </div>
            <span className="font-medium">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};