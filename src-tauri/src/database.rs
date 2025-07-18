use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub file_path: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub word_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SemanticTerm {
    pub id: String,
    pub document_id: String,
    pub term: String,
    pub context: String,
    pub position: i32,
    pub confidence: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConsistencyRule {
    pub id: String,
    pub term: String,
    pub preferred_form: String,
    pub alternatives: String, // JSON array of alternative forms
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisCache {
    pub id: String,
    pub document_id: String,
    pub content_hash: String,
    pub analysis_result: String, // JSON serialized analysis result
    pub created_at: DateTime<Utc>,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: &Path) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database { conn };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        // Documents table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                file_path TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                word_count INTEGER NOT NULL DEFAULT 0
            )",
            [],
        )?;

        // Semantic terms table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS semantic_terms (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                term TEXT NOT NULL,
                context TEXT NOT NULL,
                position INTEGER NOT NULL,
                confidence REAL NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id)
            )",
            [],
        )?;

        // Consistency rules table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS consistency_rules (
                id TEXT PRIMARY KEY,
                term TEXT NOT NULL UNIQUE,
                preferred_form TEXT NOT NULL,
                alternatives TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        // Analysis cache table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS analysis_cache (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                analysis_result TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id)
            )",
            [],
        )?;

        // Create indexes for better performance
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_semantic_terms_document_id ON semantic_terms (document_id)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_analysis_cache_document_id ON analysis_cache (document_id)",
            [],
        )?;

        Ok(())
    }

    // Document operations
    pub fn save_document(&self, document: &Document) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO documents 
             (id, title, content, file_path, created_at, updated_at, word_count)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            [
                &document.id,
                &document.title,
                &document.content,
                document.file_path.as_deref().unwrap_or(""),
                &document.created_at.to_rfc3339(),
                &document.updated_at.to_rfc3339(),
                &document.word_count.to_string(),
            ],
        )?;
        Ok(())
    }

    pub fn get_document(&self, id: &str) -> Result<Option<Document>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, content, file_path, created_at, updated_at, word_count 
             FROM documents WHERE id = ?1"
        )?;

        let mut rows = stmt.query_map([id], |row| {
            let created_at_str: String = row.get(4)?;
            let updated_at_str: String = row.get(5)?;
            
            Ok(Document {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                file_path: {
                    let path: String = row.get(3)?;
                    if path.is_empty() { None } else { Some(path) }
                },
                created_at: DateTime::parse_from_rfc3339(&created_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&updated_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(5, "updated_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
                word_count: row.get(6)?,
            })
        })?;

        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }

    pub fn list_documents(&self) -> Result<Vec<Document>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, content, file_path, created_at, updated_at, word_count 
             FROM documents ORDER BY updated_at DESC"
        )?;

        let document_iter = stmt.query_map([], |row| {
            let created_at_str: String = row.get(4)?;
            let updated_at_str: String = row.get(5)?;
            
            Ok(Document {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                file_path: {
                    let path: String = row.get(3)?;
                    if path.is_empty() { None } else { Some(path) }
                },
                created_at: DateTime::parse_from_rfc3339(&created_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
                updated_at: DateTime::parse_from_rfc3339(&updated_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(5, "updated_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
                word_count: row.get(6)?,
            })
        })?;

        let mut documents = Vec::new();
        for document in document_iter {
            documents.push(document?);
        }
        Ok(documents)
    }

    pub fn delete_document(&self, id: &str) -> Result<()> {
        // Delete related semantic terms first
        self.conn.execute("DELETE FROM semantic_terms WHERE document_id = ?1", [id])?;
        // Delete analysis cache
        self.conn.execute("DELETE FROM analysis_cache WHERE document_id = ?1", [id])?;
        // Delete document
        self.conn.execute("DELETE FROM documents WHERE id = ?1", [id])?;
        Ok(())
    }

    // Semantic terms operations
    pub fn save_semantic_terms(&self, terms: &[SemanticTerm]) -> Result<()> {
        let tx = self.conn.unchecked_transaction()?;
        
        for term in terms {
            tx.execute(
                "INSERT OR REPLACE INTO semantic_terms 
                 (id, document_id, term, context, position, confidence, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                [
                    &term.id,
                    &term.document_id,
                    &term.term,
                    &term.context,
                    &term.position.to_string(),
                    &term.confidence.to_string(),
                    &term.created_at.to_rfc3339(),
                ],
            )?;
        }
        
        tx.commit()?;
        Ok(())
    }

    pub fn get_semantic_terms(&self, document_id: &str) -> Result<Vec<SemanticTerm>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, document_id, term, context, position, confidence, created_at 
             FROM semantic_terms WHERE document_id = ?1 ORDER BY position"
        )?;

        let term_iter = stmt.query_map([document_id], |row| {
            let created_at_str: String = row.get(6)?;
            
            Ok(SemanticTerm {
                id: row.get(0)?,
                document_id: row.get(1)?,
                term: row.get(2)?,
                context: row.get(3)?,
                position: row.get(4)?,
                confidence: row.get(5)?,
                created_at: DateTime::parse_from_rfc3339(&created_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(6, "created_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
            })
        })?;

        let mut terms = Vec::new();
        for term in term_iter {
            terms.push(term?);
        }
        Ok(terms)
    }

    // Consistency rules operations
    pub fn save_consistency_rule(&self, rule: &ConsistencyRule) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO consistency_rules 
             (id, term, preferred_form, alternatives, is_active, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &rule.id,
                &rule.term,
                &rule.preferred_form,
                &rule.alternatives,
                &rule.is_active.to_string(),
                &rule.created_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_consistency_rules(&self) -> Result<Vec<ConsistencyRule>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, term, preferred_form, alternatives, is_active, created_at 
             FROM consistency_rules WHERE is_active = 1 ORDER BY term"
        )?;

        let rule_iter = stmt.query_map([], |row| {
            let created_at_str: String = row.get(5)?;
            let is_active_str: String = row.get(4)?;
            
            Ok(ConsistencyRule {
                id: row.get(0)?,
                term: row.get(1)?,
                preferred_form: row.get(2)?,
                alternatives: row.get(3)?,
                is_active: is_active_str == "1" || is_active_str.to_lowercase() == "true",
                created_at: DateTime::parse_from_rfc3339(&created_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(5, "created_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
            })
        })?;

        let mut rules = Vec::new();
        for rule in rule_iter {
            rules.push(rule?);
        }
        Ok(rules)
    }

    // Analysis cache operations
    pub fn save_analysis_cache(&self, cache: &AnalysisCache) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO analysis_cache 
             (id, document_id, content_hash, analysis_result, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            [
                &cache.id,
                &cache.document_id,
                &cache.content_hash,
                &cache.analysis_result,
                &cache.created_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_analysis_cache(&self, document_id: &str, content_hash: &str) -> Result<Option<AnalysisCache>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, document_id, content_hash, analysis_result, created_at 
             FROM analysis_cache WHERE document_id = ?1 AND content_hash = ?2"
        )?;

        let mut rows = stmt.query_map([document_id, content_hash], |row| {
            let created_at_str: String = row.get(4)?;
            
            Ok(AnalysisCache {
                id: row.get(0)?,
                document_id: row.get(1)?,
                content_hash: row.get(2)?,
                analysis_result: row.get(3)?,
                created_at: DateTime::parse_from_rfc3339(&created_at_str)
                    .map_err(|_| rusqlite::Error::InvalidColumnType(4, "created_at".to_string(), rusqlite::types::Type::Text))?
                    .with_timezone(&Utc),
            })
        })?;

        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }
}