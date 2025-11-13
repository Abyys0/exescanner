import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/scanner.db';

// Garante que o diretório data/ existe antes de qualquer operação
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: SqlJsDatabase;

export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('✅ Database loaded from file');
  } else {
    db = new SQL.Database();
    console.log('✅ New database created');
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      clientLabel TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'DONE', 'ERROR')),
      startedAt TEXT NOT NULL,
      finishedAt TEXT,
      totalFiles INTEGER DEFAULT 0,
      suspectCount INTEGER DEFAULT 0,
      criticalCount INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('OK', 'SUSPECT')),
      severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      detectedAt TEXT NOT NULL,
      type TEXT,
      hash TEXT,
      notes TEXT,
      reviewed INTEGER DEFAULT 0,
      reviewedAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('INFO', 'WARN', 'ERROR')),
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      context TEXT
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_results_session ON results(sessionId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_results_severity ON results(severity)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_results_reviewed ON results(reviewed)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_logs_session ON logs(sessionId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)`);

  // Auto-save every 5 seconds
  setInterval(() => saveDatabase(), 5000);

  console.log(`✅ Database initialized at ${DB_PATH}`);
  return db;
}

function saveDatabase() {
  if (db) {
    try {
      const data = db.export();
      fs.writeFileSync(DB_PATH, data);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Save on exit
process.on('exit', () => {
  console.log('Saving database before exit...');
  saveDatabase();
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, saving database...');
  saveDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, saving database...');
  saveDatabase();
  process.exit(0);
});

export default { initDatabase, getDatabase };
