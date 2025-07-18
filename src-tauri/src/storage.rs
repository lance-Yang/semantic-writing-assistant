use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

use crate::database::{Database, Document, SemanticTerm, ConsistencyRule, AnalysisCache};
use crate::file_handler::{FileHandler, ImportResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageConfig {
    pub app_data_dir: String,
    pub auto_save_interval: u64, // seconds
    pub max_backups: usize,
    pub cache_size_limit: usize, // MB
}

impl Default for StorageConfig {
    fn default() -> Self {
        StorageConfig {
            app_data_dir: "".to_string(), // Will be set by the app
            auto_save_interval: 30, // 30 seconds
            max_backups: 10,
            cache_size_limit: 100, // 100 MB
        }
    }
}

pub struct StorageService {
    db: Arc<Mutex<Database>>,
    file_handler: Arc<FileHandler>,
    config: StorageConfig,
    // In-memory cache for frequently accessed documents
    document_cache: Arc<Mutex<HashMap<String, Document>>>,
}

impl StorageService {
    pub fn new(app_data_dir: PathBuf) -> Result<Self, String> {
        let file_handler = Arc::new(FileHandler::new(app_data_dir.clone()));
        let db_path = file_handler.get_database_path();
        
        let database = Database::new(&db_path)
            .map_err(|e| format!("Failed to initialize database: {}", e))?;
        
        let config = StorageConfig {
            app_data_dir: app_data_dir.to_string_lossy().to_string(),
            ..Default::default()
        };

        Ok(StorageService {
            db: Arc::new(Mutex::new(database)),
            file_handler,
            config,
            document_cache: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    // Document operations
    pub fn create_document(&self, title: String, content: String) -> Result<String, String> {
        let word_count = content.split_whitespace().count() as i32;
        let now = Utc::now();
        
        let document = Document {
            id: Uuid::new_v4().to_string(),
            title,
            content,
            file_path: None,
            created_at: now,
            updated_at: now,
            word_count,
        };

        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.save_document(&document)
            .map_err(|e| format!("Failed to save document: {}", e))?;
        
        // Update cache
        let mut cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        cache.insert(document.id.clone(), document.clone());
        
        Ok(document.id)
    }

    pub fn update_document(&self, id: String, title: Option<String>, content: Option<String>) -> Result<(), String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        
        let mut document = db.get_document(&id)
            .map_err(|e| format!("Failed to get document: {}", e))?
            .ok_or("Document not found")?;

        if let Some(new_title) = title {
            document.title = new_title;
        }
        
        if let Some(new_content) = content {
            document.content = new_content;
            document.word_count = document.content.split_whitespace().count() as i32;
        }
        
        document.updated_at = Utc::now();

        db.save_document(&document)
            .map_err(|e| format!("Failed to update document: {}", e))?;

        // Update cache
        let mut cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        cache.insert(document.id.clone(), document);

        Ok(())
    }

    pub fn get_document(&self, id: &str) -> Result<Option<Document>, String> {
        // Check cache first
        {
            let cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
            if let Some(document) = cache.get(id) {
                return Ok(Some(document.clone()));
            }
        }

        // If not in cache, get from database
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        let document = db.get_document(id)
            .map_err(|e| format!("Failed to get document: {}", e))?;

        // Update cache if document exists
        if let Some(ref doc) = document {
            let mut cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
            cache.insert(doc.id.clone(), doc.clone());
        }

        Ok(document)
    }

    pub fn list_documents(&self) -> Result<Vec<Document>, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.list_documents()
            .map_err(|e| format!("Failed to list documents: {}", e))
    }

    pub fn delete_document(&self, id: &str) -> Result<(), String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        
        // Create backup before deletion
        if let Ok(Some(document)) = db.get_document(id) {
            let _ = self.file_handler.create_backup(&document);
        }

        db.delete_document(id)
            .map_err(|e| format!("Failed to delete document: {}", e))?;

        // Remove from cache
        let mut cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        cache.remove(id);

        Ok(())
    }

    // File operations
    pub fn import_document(&self, file_path: &str) -> Result<ImportResult, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        self.file_handler.import_document(file_path, &*db)
    }

    pub fn export_document(&self, id: &str, export_path: &str) -> Result<(), String> {
        let document = self.get_document(id)?
            .ok_or("Document not found")?;
        
        self.file_handler.export_document(&document, export_path)
    }

    // Semantic analysis operations
    pub fn save_semantic_terms(&self, document_id: &str, terms: Vec<SemanticTerm>) -> Result<(), String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.save_semantic_terms(&terms)
            .map_err(|e| format!("Failed to save semantic terms: {}", e))
    }

    pub fn get_semantic_terms(&self, document_id: &str) -> Result<Vec<SemanticTerm>, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.get_semantic_terms(document_id)
            .map_err(|e| format!("Failed to get semantic terms: {}", e))
    }

    // Consistency rules operations
    pub fn save_consistency_rule(&self, rule: ConsistencyRule) -> Result<(), String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.save_consistency_rule(&rule)
            .map_err(|e| format!("Failed to save consistency rule: {}", e))
    }

    pub fn get_consistency_rules(&self) -> Result<Vec<ConsistencyRule>, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.get_consistency_rules()
            .map_err(|e| format!("Failed to get consistency rules: {}", e))
    }

    // Analysis cache operations
    pub fn save_analysis_cache(&self, cache: AnalysisCache) -> Result<(), String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.save_analysis_cache(&cache)
            .map_err(|e| format!("Failed to save analysis cache: {}", e))
    }

    pub fn get_analysis_cache(&self, document_id: &str, content_hash: &str) -> Result<Option<AnalysisCache>, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        db.get_analysis_cache(document_id, content_hash)
            .map_err(|e| format!("Failed to get analysis cache: {}", e))
    }

    // Backup operations
    pub fn create_backup(&self, document_id: &str) -> Result<String, String> {
        let document = self.get_document(document_id)?
            .ok_or("Document not found")?;
        
        self.file_handler.create_backup(&document)
    }

    pub fn list_backups(&self) -> Result<Vec<crate::file_handler::FileInfo>, String> {
        self.file_handler.list_backups()
    }

    pub fn restore_from_backup(&self, backup_path: &str) -> Result<ImportResult, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        self.file_handler.restore_from_backup(backup_path, &*db)
    }

    // Configuration
    pub fn get_config(&self) -> &StorageConfig {
        &self.config
    }

    pub fn update_config(&mut self, new_config: StorageConfig) {
        self.config = new_config;
    }

    // Cache management
    pub fn clear_document_cache(&self) -> Result<(), String> {
        let mut cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        cache.clear();
        Ok(())
    }

    pub fn get_cache_size(&self) -> Result<usize, String> {
        let cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        Ok(cache.len())
    }

    // Utility functions
    pub fn calculate_content_hash(&self, content: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    pub fn get_storage_stats(&self) -> Result<StorageStats, String> {
        let db = self.db.lock().map_err(|_| "Failed to acquire database lock")?;
        let documents = db.list_documents()
            .map_err(|e| format!("Failed to get documents: {}", e))?;

        let total_documents = documents.len();
        let total_words = documents.iter().map(|d| d.word_count as usize).sum();
        let total_characters = documents.iter().map(|d| d.content.len()).sum();

        let cache = self.document_cache.lock().map_err(|_| "Failed to acquire cache lock")?;
        let cached_documents = cache.len();

        Ok(StorageStats {
            total_documents,
            total_words,
            total_characters,
            cached_documents,
            database_path: self.file_handler.get_database_path().to_string_lossy().to_string(),
            app_data_dir: self.config.app_data_dir.clone(),
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageStats {
    pub total_documents: usize,
    pub total_words: usize,
    pub total_characters: usize,
    pub cached_documents: usize,
    pub database_path: String,
    pub app_data_dir: String,
}