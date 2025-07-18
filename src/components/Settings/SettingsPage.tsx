import React from 'react';
import { Settings, User, Palette, Keyboard, Bell, Shield, Database, Info } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useTheme, themeColors } from '../../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, clearCache, storageStats } = useAppStore();
  const { themeConfig, setDarkMode, setColorTheme } = useTheme();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-900">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">设置</h1>
          <p className="text-gray-600 dark:text-gray-400">
            自定义您的写作环境和偏好设置
          </p>
        </div>

        <div className="space-y-8">
          {/* 外观设置 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                外观设置
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  颜色主题
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(themeColors).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setColorTheme(key as any)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        themeConfig.colorTheme === key
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{config.name}</span>
                        <div className="flex space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: `rgb(${config.cssVars['--theme-primary']})` }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: `rgb(${config.cssVars['--theme-accent']})` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {config.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  明暗模式
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: '浅色' },
                    { value: 'dark', label: '深色' },
                    { value: 'auto', label: '自动' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDarkMode(option.value as any)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        themeConfig.darkMode === option.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-dark-700 border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  语言设置
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* 编辑器设置 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <User className="h-5 w-5 mr-2" />
                编辑器设置
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">自动保存</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    编辑时自动保存文档
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">自动分析</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    编辑时自动进行语义分析
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoAnalysis}
                    onChange={(e) => handleSettingChange('autoAnalysis', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* AI 设置 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AI 功能
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">启用 AI 功能</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    启用 AI 驱动的写作建议和分析
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.aiEnabled}
                    onChange={(e) => handleSettingChange('aiEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                通知设置
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">桌面通知</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    接收分析完成和其他重要事件的通知
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 存储管理 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                存储管理
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {storageStats && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {storageStats.total_documents}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">文档总数</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {storageStats.cached_documents}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">缓存文档</div>
                  </div>
                </div>
              )}
              
              <button
                onClick={clearCache}
                className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                清除缓存
              </button>
            </div>
          </div>

          {/* 关于 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                关于
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  智能写作助手
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  版本 1.0.0
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  基于 AI 的语义写作助手，帮助您提升写作质量和效率
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;