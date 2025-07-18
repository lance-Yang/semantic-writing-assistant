import React, { useState } from 'react';
import { Zap, Settings, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { AIProvider } from '../../types';

interface AIConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIConfiguration: React.FC<AIConfigurationProps> = ({ isOpen, onClose }) => {
  const { aiProviders, addAIProvider, updateAIProvider, deleteAIProvider, setActiveAIProvider, activeAIProvider } = useAppStore();
  const [newProvider, setNewProvider] = useState<Partial<AIProvider>>({
    name: '',
    type: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-3.5-turbo',
    enabled: true,
    config: {
      temperature: 0.3,
      maxTokens: 1000,
      timeout: 30000,
      retryAttempts: 3,
    },
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.apiKey) {
      const provider: AIProvider = {
        id: crypto.randomUUID(),
        name: newProvider.name!,
        type: newProvider.type!,
        apiKey: newProvider.apiKey!,
        baseUrl: newProvider.baseUrl,
        model: newProvider.model || 'gpt-3.5-turbo',
        enabled: true,
        config: newProvider.config || {
          temperature: 0.3,
          maxTokens: 1000,
          timeout: 30000,
          retryAttempts: 3,
        },
      };
      
      addAIProvider(provider);
      if (aiProviders.length === 0) {
        setActiveAIProvider(provider.id);
      }
      
      setNewProvider({
        name: '',
        type: 'openai',
        apiKey: '',
        baseUrl: '',
        model: 'gpt-3.5-turbo',
      });
    }
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const providerTypes = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'] },
    { value: 'claude', label: 'Claude', models: ['claude-3-sonnet', 'claude-3-haiku'] },
    { value: 'custom', label: 'Custom', models: ['custom-model'] },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AI Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
          >
            <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add New Provider */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              Add AI Provider
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="My AI Provider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider Type
                </label>
                <select
                  value={newProvider.type}
                  onChange={(e) => setNewProvider(prev => ({ 
                    ...prev, 
                    type: e.target.value as AIProvider['type'],
                    model: providerTypes.find(t => t.value === e.target.value)?.models[0] || 'gpt-3.5-turbo'
                  }))}
                  className="input w-full"
                >
                  {providerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="input w-full"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={newProvider.model}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, model: e.target.value }))}
                  className="input w-full"
                >
                  {providerTypes.find(t => t.value === newProvider.type)?.models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              {newProvider.type === 'custom' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={newProvider.baseUrl}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, baseUrl: e.target.value }))}
                    className="input w-full"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddProvider}
                disabled={!newProvider.name || !newProvider.apiKey}
                className="btn btn-primary px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </button>
            </div>
          </div>

          {/* Existing Providers */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
              Configured Providers
            </h3>
            {aiProviders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No AI providers configured. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {aiProviders.map(provider => (
                  <div
                    key={provider.id}
                    className={`p-4 border rounded-lg ${
                      activeAIProvider === provider.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={activeAIProvider === provider.id}
                          onChange={() => setActiveAIProvider(provider.id)}
                          className="text-primary-600"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {provider.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {provider.type} • {provider.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                        >
                          {showApiKeys[provider.id] ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteAIProvider(provider.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {showApiKeys[provider.id] && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-700 rounded text-sm font-mono">
                        {provider.apiKey}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};