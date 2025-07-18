// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, State};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

mod database;
mod file_handler;
mod storage;

use database::{Document, SemanticTerm, ConsistencyRule, AnalysisCache};
use file_handler::{FileInfo, ImportResult};
use storage::{StorageService, StorageConfig, StorageStats};

// Global storage service state
type StorageState = Arc<Mutex<StorageService>>;

// Learn more about Tauri commands at https://tauri.app/v2/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Document management commands
#[tauri::command]
async fn create_document(
    storage: State<'_, StorageState>,
    title: String,
    content: String,
) -> Result<String, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.create_document(title, content)
}

#[tauri::command]
async fn update_document(
    storage: State<'_, StorageState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.update_document(id, title, content)
}

#[tauri::command]
async fn get_document(
    storage: State<'_, StorageState>,
    id: String,
) -> Result<Option<Document>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.get_document(&id)
}

#[tauri::command]
async fn list_documents(
    storage: State<'_, StorageState>,
) -> Result<Vec<Document>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.list_documents()
}

#[tauri::command]
async fn delete_document(
    storage: State<'_, StorageState>,
    id: String,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.delete_document(&id)
}

// File operations commands
#[tauri::command]
async fn import_document(
    storage: State<'_, StorageState>,
    file_path: String,
) -> Result<ImportResult, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.import_document(&file_path)
}

#[tauri::command]
async fn export_document(
    storage: State<'_, StorageState>,
    id: String,
    export_path: String,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.export_document(&id, &export_path)
}

#[tauri::command]
async fn save_file(path: String, contents: String) -> Result<(), String> {
    std::fs::write(path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_files(dir_path: String) -> Result<Vec<String>, String> {
    let entries = std::fs::read_dir(dir_path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if let Some(file_name) = path.file_name() {
            if let Some(file_str) = file_name.to_str() {
                files.push(file_str.to_string());
            }
        }
    }
    
    Ok(files)
}

// Semantic analysis commands
#[tauri::command]
async fn save_semantic_terms(
    storage: State<'_, StorageState>,
    document_id: String,
    terms: Vec<SemanticTerm>,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.save_semantic_terms(&document_id, terms)
}

#[tauri::command]
async fn get_semantic_terms(
    storage: State<'_, StorageState>,
    document_id: String,
) -> Result<Vec<SemanticTerm>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.get_semantic_terms(&document_id)
}

// Consistency rules commands
#[tauri::command]
async fn save_consistency_rule(
    storage: State<'_, StorageState>,
    rule: ConsistencyRule,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.save_consistency_rule(rule)
}

#[tauri::command]
async fn get_consistency_rules(
    storage: State<'_, StorageState>,
) -> Result<Vec<ConsistencyRule>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.get_consistency_rules()
}

// Analysis cache commands
#[tauri::command]
async fn save_analysis_cache(
    storage: State<'_, StorageState>,
    cache: AnalysisCache,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.save_analysis_cache(cache)
}

#[tauri::command]
async fn get_analysis_cache(
    storage: State<'_, StorageState>,
    document_id: String,
    content_hash: String,
) -> Result<Option<AnalysisCache>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.get_analysis_cache(&document_id, &content_hash)
}

// Backup commands
#[tauri::command]
async fn create_backup(
    storage: State<'_, StorageState>,
    document_id: String,
) -> Result<String, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.create_backup(&document_id)
}

#[tauri::command]
async fn list_backups(
    storage: State<'_, StorageState>,
) -> Result<Vec<FileInfo>, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.list_backups()
}

#[tauri::command]
async fn restore_from_backup(
    storage: State<'_, StorageState>,
    backup_path: String,
) -> Result<ImportResult, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.restore_from_backup(&backup_path)
}

// Utility commands
#[tauri::command]
async fn calculate_content_hash(
    storage: State<'_, StorageState>,
    content: String,
) -> Result<String, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    Ok(storage.calculate_content_hash(&content))
}

#[tauri::command]
async fn get_storage_stats(
    storage: State<'_, StorageState>,
) -> Result<StorageStats, String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.get_storage_stats()
}

#[tauri::command]
async fn clear_document_cache(
    storage: State<'_, StorageState>,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|_| "Failed to acquire storage lock")?;
    storage.clear_document_cache()
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get app data directory for Tauri v2
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app data directory: {}", e))?;

            // Initialize storage service
            let storage_service = StorageService::new(app_data_dir)
                .map_err(|e| format!("Failed to initialize storage service: {}", e))?;

            // Store as global state
            app.manage(Arc::new(Mutex::new(storage_service)));

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            // Document management
            create_document,
            update_document,
            get_document,
            list_documents,
            delete_document,
            // File operations
            import_document,
            export_document,
            save_file,
            read_file,
            list_files,
            // Semantic analysis
            save_semantic_terms,
            get_semantic_terms,
            // Consistency rules
            save_consistency_rule,
            get_consistency_rules,
            // Analysis cache
            save_analysis_cache,
            get_analysis_cache,
            // Backup operations
            create_backup,
            list_backups,
            restore_from_backup,
            // Utilities
            calculate_content_hash,
            get_storage_stats,
            clear_document_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}