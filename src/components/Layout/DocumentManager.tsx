import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import type { Document } from '../../types';

interface DocumentManagerProps {
  onDocumentSelect: (document: Document) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ onDocumentSelect }) => {
  const {
    documents,
    currentDocument,
    loadDocuments,
    createTauriDocument,
    deleteTauriDocument,
    importDocument,
    exportDocument,
    createBackup,
    restoreFromBackup,
    storageStats
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    
    setIsLoading(true);
    try {
      await createTauriDocument(newDocTitle, '');
      setNewDocTitle('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTauriDocument(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDocument = async () => {
    setIsLoading(true);
    try {
      await importDocument();
    } catch (error) {
      console.error('Failed to import document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDocument = async (id: string) => {
    setIsLoading(true);
    try {
      await exportDocument(id);
    } catch (error) {
      console.error('Failed to export document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async (id: string) => {
    setIsLoading(true);
    try {
      await createBackup(id);
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsLoading(true);
    try {
      await restoreFromBackup();
    } catch (error) {
      console.error('Failed to restore backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            New
          </button>
          <button
            onClick={handleImportDocument}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Import
          </button>
          <button
            onClick={handleRestoreBackup}
            disabled={isLoading}
            className="flex-1 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Restore
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <input
            type="text"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="Document title"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={handleCreateDocument}
              disabled={isLoading || !newDocTitle.trim()}
              className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewDocTitle('');
              }}
              className="flex-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Storage Stats */}
      {storageStats && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Storage Stats</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Documents: {storageStats.total_documents}</div>
            <div>Words: {storageStats.total_words.toLocaleString()}</div>
            <div>Characters: {storageStats.total_characters.toLocaleString()}</div>
            <div>Cached: {storageStats.cached_documents}</div>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No documents yet. Create your first document!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  currentDocument?.id === doc.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => onDocumentSelect(doc)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.metadata.wordCount || 0} words
                    </p>
                    <p className="text-xs text-gray-400">
                      {(() => {
                        try {
                          const date = doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt);
                          return date.toLocaleDateString();
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })()}
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="ml-2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportDocument(doc.id);
                      }}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                      title="Export"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateBackup(doc.id);
                      }}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                      title="Backup"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      disabled={isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};