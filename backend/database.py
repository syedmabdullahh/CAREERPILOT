"""
CareerPilot AI — Database Layer (PostgreSQL & SQLite Dual Engine)
Supports PostgreSQL for production/cloud deployments and SQLite for instant zero-config local development.
Set DATABASE_URL=postgresql://user:pass@localhost:5432/careerpilot to use PostgreSQL.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")

# SQLite fallback path
STORAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "storage")
SQLITE_PATH = os.path.join(STORAGE_DIR, "careerpilot.db")


def get_db_connection():
    """Get a database connection (PostgreSQL or SQLite fallback)."""
    if IS_POSTGRES:
        try:
            import psycopg2
            import psycopg2.extras
            # Fix postgres:// to postgresql:// for psycopg2
            url = DATABASE_URL.replace("postgres://", "postgresql://", 1)
            conn = psycopg2.connect(url)
            return conn, "postgres"
        except Exception as e:
            print(f"[Database] Warning: PostgreSQL connection failed ({e}). Falling back to SQLite.")
    
    # SQLite default
    import sqlite3
    os.makedirs(STORAGE_DIR, exist_ok=True)
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn, "sqlite"


def init_db():
    """Initialize database tables with schema compatibility for PostgreSQL and SQLite."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()

    if engine == "postgres":
        import psycopg2.extras
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id SERIAL PRIMARY KEY,
                candidate_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
                target_role VARCHAR(255) NOT NULL,
                ats_score INTEGER DEFAULT 0,
                skill_match_score INTEGER DEFAULT 0,
                resume_text TEXT,
                result_json JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_cover_letters (
                id SERIAL PRIMARY KEY,
                analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
                target_role VARCHAR(255),
                company_name VARCHAR(255),
                cover_letter_text TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_name TEXT NOT NULL DEFAULT 'Unknown',
                target_role TEXT NOT NULL,
                ats_score INTEGER DEFAULT 0,
                skill_match_score INTEGER DEFAULT 0,
                resume_text TEXT,
                result_json TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_cover_letters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id INTEGER,
                target_role TEXT,
                company_name TEXT,
                cover_letter_text TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (analysis_id) REFERENCES analyses(id)
            );
        """)

    conn.commit()
    conn.close()


def save_analysis(candidate_name: str, target_role: str, ats_score: int,
                  skill_match_score: int, resume_text: str, result_data: Dict[str, Any]) -> int:
    """Save a complete analysis result. Returns the new row ID."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()

    if engine == "postgres":
        cursor.execute("""
            INSERT INTO analyses (candidate_name, target_role, ats_score, skill_match_score, resume_text, result_json, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            RETURNING id;
        """, (
            candidate_name,
            target_role,
            ats_score,
            skill_match_score,
            resume_text[:5000],
            json.dumps(result_data)
        ))
        row_id = cursor.fetchone()[0]
    else:
        cursor.execute("""
            INSERT INTO analyses (candidate_name, target_role, ats_score, skill_match_score, resume_text, result_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            candidate_name,
            target_role,
            ats_score,
            skill_match_score,
            resume_text[:5000],
            json.dumps(result_data),
            datetime.utcnow().isoformat()
        ))
        row_id = cursor.lastrowid

    conn.commit()
    conn.close()
    return row_id


def get_analysis_history(limit: int = 20) -> List[Dict[str, Any]]:
    """Get recent analysis history."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()

    if engine == "postgres":
        import psycopg2.extras
        dict_cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        dict_cur.execute("""
            SELECT id, candidate_name, target_role, ats_score, skill_match_score, created_at
            FROM analyses
            ORDER BY id DESC
            LIMIT %s;
        """, (limit,))
        rows = [dict(r) for r in dict_cur.fetchall()]
        # Convert timestamp to string
        for r in rows:
            if isinstance(r.get("created_at"), datetime):
                r["created_at"] = r["created_at"].isoformat()
    else:
        cursor.execute("""
            SELECT id, candidate_name, target_role, ats_score, skill_match_score, created_at
            FROM analyses
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        rows = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return rows


def get_analysis_by_id(analysis_id: int) -> Optional[Dict[str, Any]]:
    """Get a single analysis with full result JSON."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()

    if engine == "postgres":
        import psycopg2.extras
        dict_cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        dict_cur.execute("SELECT * FROM analyses WHERE id = %s;", (analysis_id,))
        row = dict_cur.fetchone()
        conn.close()
        if row:
            data = dict(row)
            if isinstance(data.get("result_json"), str):
                data["result_data"] = json.loads(data["result_json"])
            elif isinstance(data.get("result_json"), dict):
                data["result_data"] = data["result_json"]
            data.pop("result_json", None)
            if isinstance(data.get("created_at"), datetime):
                data["created_at"] = data["created_at"].isoformat()
            return data
    else:
        cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            data = dict(row)
            if data.get("result_json"):
                data["result_data"] = json.loads(data["result_json"])
                del data["result_json"]
            return data

    return None


def delete_analysis(analysis_id: int) -> bool:
    """Delete an analysis record."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()
    if engine == "postgres":
        cursor.execute("DELETE FROM analyses WHERE id = %s;", (analysis_id,))
        deleted = cursor.rowcount > 0
    else:
        cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
        deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def get_stats() -> Dict[str, Any]:
    """Get aggregate statistics across all analyses."""
    conn, engine = get_db_connection()
    cursor = conn.cursor()
    if engine == "postgres":
        import psycopg2.extras
        dict_cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        dict_cur.execute("""
            SELECT 
                COUNT(*) as total_analyses,
                COALESCE(ROUND(AVG(ats_score), 1), 0) as avg_ats_score,
                COALESCE(ROUND(AVG(skill_match_score), 1), 0) as avg_skill_match,
                COALESCE(MAX(ats_score), 0) as highest_ats_score
            FROM analyses;
        """)
        row = dict_cur.fetchone()
        conn.close()
        return dict(row) if row else {"total_analyses": 0}
    else:
        cursor.execute("""
            SELECT 
                COUNT(*) as total_analyses,
                ROUND(AVG(ats_score), 1) as avg_ats_score,
                ROUND(AVG(skill_match_score), 1) as avg_skill_match,
                MAX(ats_score) as highest_ats_score
            FROM analyses
        """)
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else {"total_analyses": 0}


# Initialize DB upon module load
try:
    init_db()
except Exception as e:
    print(f"[Database Init Warning]: {e}")
