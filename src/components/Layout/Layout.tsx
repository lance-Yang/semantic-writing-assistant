import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative main-content-scrollbar">
          {/* Enhanced background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-indigo-50/60 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/60 pointer-events-none"></div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/15 to-pink-600/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Content with enhanced glass effect */}
          <div className="relative z-10 min-h-full">
            <div className="backdrop-blur-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;