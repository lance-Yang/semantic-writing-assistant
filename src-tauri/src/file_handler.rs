use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::Utc;

use crate::database::{Database, Document};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub modified: String,
    pub extension: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportResult {
    pub success: bool,
    pub document_id: Option<String>,
    pub message: String,
}

pub struct FileHandler {
    app_data_dir: PathBuf,
}

impl FileHandler {
    pub fn new(app_data_dir: PathBuf) -> Self {
        // Ensure app data directory exists
        if !app_data_dir.exists() {
            fs::create_dir_all(&app_data_dir).unwrap_or_else(|_| {
                eprintln!("Failed to create app data directory");
            });
        }
        
        FileHandler { app_data_dir }
    }

    pub fn get_app_data_dir(&self) -> &Path {
        &self.app_data_dir
    }

    pub fn get_database_path(&self) -> PathBuf {
        self.app_data_dir.join("semantic_assistant.db")
    }

    pub fn get_documents_dir(&self) -> PathBuf {
        let docs_dir = self.app_data_dir.join("documents");
        if !docs_dir.exists() {
            fs::create_dir_all(&docs_dir).unwrap_or_else(|_| {
                eprintln!("Failed to create documents directory");
            });
        }
        docs_dir
    }

    pub fn get_backups_dir(&self) -> PathBuf {
        let backups_dir = self.app_data_dir.join("backups");
        if !backups_dir.exists() {
            fs::create_dir_all(&backups_dir).unwrap_or_else(|_| {
                eprintln!("Failed to create backups directory");
            });
        }
        backups_dir
    }

    pub fn read_file_content(&self, file_path: &str) -> Result<String, String> {
        fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {}", e))
    }

    pub fn write_file_content(&self, file_path: &str, content: &str) -> Result<(), String> {
        // Ensure parent directory exists
        if let Some(parent) = Path::new(file_path).parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        
        fs::write(file_path, content).map_err(|e| format!("Failed to write file: {}", e))
    }

    pub fn list_directory(&self, dir_path: &str) -> Result<Vec<FileInfo>, String> {
        let entries = fs::read_dir(dir_path).map_err(|e| format!("Failed to read directory: {}", e))?;
        let mut files = Vec::new();

        for entry in entries {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let path = entry.path();
            let metadata = entry.metadata().map_err(|e| format!("Failed to read metadata: {}", e))?;

            if metadata.is_file() {
                let file_info = FileInfo {
                    name: path.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("Unknown")
                        .to_string(),
                    path: path.to_string_lossy().to_string(),
                    size: metadata.len(),
                    modified: format!("{:?}", metadata.modified().unwrap_or(std::time::UNIX_EPOCH)),
                    extension: path.extension()
                        .and_then(|ext| ext.to_str())
                        .map(|s| s.to_string()),
                };
                files.push(file_info);
            }
        }

        files.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(files)
    }

    pub fn import_document(&self, file_path: &str, db: &Database) -> Result<ImportResult, String> {
        let content = self.read_file_content(file_path)?;
        let path = Path::new(file_path);
        
        let title = path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Untitled")
            .to_string();

        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase());

        // Parse content based on file type
        let processed_content = match extension.as_deref() {
            Some("md") | Some("markdown") => content,
            Some("txt") => content,
            Some("docx") => {
                // For now, treat as plain text. In a real implementation,
                // you might want to use a library like docx-rs to parse DOCX files
                content
            }
            _ => content,
        };

        let word_count = processed_content.split_whitespace().count() as i32;
        let now = Utc::now();
        
        let document = Document {
            id: Uuid::new_v4().to_string(),
            title,
            content: processed_content,
            file_path: Some(file_path.to_string()),
            created_at: now,
            updated_at: now,
            word_count,
        };

        match db.save_document(&document) {
            Ok(_) => Ok(ImportResult {
                success: true,
                document_id: Some(document.id),
                message: "Document imported successfully".to_string(),
            }),
            Err(e) => Ok(ImportResult {
                success: false,
                document_id: None,
                message: format!("Failed to save document: {}", e),
            }),
        }
    }

    pub fn export_document(&self, document: &Document, export_path: &str) -> Result<(), String> {
        let content = match Path::new(export_path).extension().and_then(|ext| ext.to_str()) {
            Some("md") | Some("markdown") => {
                format!("# {}\n\n{}", document.title, document.content)
            }
            Some("txt") => document.content.clone(),
            _ => document.content.clone(),
        };

        self.write_file_content(export_path, &content)
    }

    pub fn create_backup(&self, document: &Document) -> Result<String, String> {
        let backup_filename = format!(
            "{}_{}.backup.md",
            document.title.replace(' ', "_").replace('/', "_"),
            Utc::now().format("%Y%m%d_%H%M%S")
        );
        
        let backup_path = self.get_backups_dir().join(&backup_filename);
        let backup_content = format!(
            "# {} (Backup)\n\nCreated: {}\nLast Modified: {}\nWord Count: {}\n\n---\n\n{}",
            document.title,
            document.created_at.format("%Y-%m-%d %H:%M:%S UTC"),
            document.updated_at.format("%Y-%m-%d %H:%M:%S UTC"),
            document.word_count,
            document.content
        );

        self.write_file_content(&backup_path.to_string_lossy(), &backup_content)?;
        Ok(backup_path.to_string_lossy().to_string())
    }

    pub fn list_backups(&self) -> Result<Vec<FileInfo>, String> {
        let backups_dir = self.get_backups_dir();
        self.list_directory(&backups_dir.to_string_lossy())
    }

    pub fn restore_from_backup(&self, backup_path: &str, db: &Database) -> Result<ImportResult, String> {
        // Read backup file and extract original content
        let backup_content = self.read_file_content(backup_path)?;
        
        // Simple parsing - in a real implementation, you might want more sophisticated parsing
        let content_start = backup_content.find("---\n\n").unwrap_or(0);
        let content = if content_start > 0 {
            backup_content[content_start + 5..].to_string()
        } else {
            backup_content
        };

        let backup_filename = Path::new(backup_path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Restored Document");

        let title = backup_filename
            .replace(".backup", "")
            .replace('_', " ");

        let word_count = content.split_whitespace().count() as i32;
        let now = Utc::now();
        
        let document = Document {
            id: Uuid::new_v4().to_string(),
            title,
            content,
            file_path: None, // Restored documents don't have original file paths
            created_at: now,
            updated_at: now,
            word_count,
        };

        match db.save_document(&document) {
            Ok(_) => Ok(ImportResult {
                success: true,
                document_id: Some(document.id),
                message: "Document restored successfully".to_string(),
            }),
            Err(e) => Ok(ImportResult {
                success: false,
                document_id: None,
                message: format!("Failed to restore document: {}", e),
            }),
        }
    }

    pub fn delete_file(&self, file_path: &str) -> Result<(), String> {
        fs::remove_file(file_path).map_err(|e| format!("Failed to delete file: {}", e))
    }

    pub fn get_file_info(&self, file_path: &str) -> Result<FileInfo, String> {
        let path = Path::new(file_path);
        let metadata = fs::metadata(file_path).map_err(|e| format!("Failed to read file metadata: {}", e))?;

        Ok(FileInfo {
            name: path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("Unknown")
                .to_string(),
            path: file_path.to_string(),
            size: metadata.len(),
            modified: format!("{:?}", metadata.modified().unwrap_or(std::time::UNIX_EPOCH)),
            extension: path.extension()
                .and_then(|ext| ext.to_str())
                .map(|s| s.to_string()),
        })
    }
}