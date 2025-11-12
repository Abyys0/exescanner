import { getDatabase } from '../db';
import { Result, Log, Session } from '../types';
import { randomUUID } from 'crypto';

// ===== SESSIONS =====
export const createSession = (clientLabel: string): Session => {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO sessions (id, clientLabel, status, startedAt)
    VALUES (?, ?, ?, ?)
  `, [id, clientLabel, 'ACTIVE', now]);
  
  return {
    id,
    clientLabel,
    status: 'ACTIVE',
    startedAt: now
  };
};

export const getSession = (id: string): Session | null => {
  const db = getDatabase();
  const results = db.exec(`SELECT * FROM sessions WHERE id = ?`, [id]);
  
  if (results.length === 0 || results[0].values.length === 0) {
    return null;
  }
  
  return rowToSession(results[0].columns, results[0].values[0]);
};

export const getSessions = (limit = 50): Session[] => {
  const db = getDatabase();
  const results = db.exec(`
    SELECT * FROM sessions 
    ORDER BY startedAt DESC 
    LIMIT ?
  `, [limit]);
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map(row => rowToSession(columns, row));
};

export const updateSessionStatus = (id: string, status: 'DONE' | 'ERROR', summary?: any) => {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  db.run(`
    UPDATE sessions 
    SET status = ?, finishedAt = ?, totalFiles = ?, suspectCount = ?, criticalCount = ?
    WHERE id = ?
  `, [
    status,
    now,
    summary?.totalFiles || 0,
    summary?.suspectCount || 0,
    summary?.criticalCount || 0,
    id
  ]);
};

// ===== RESULTS =====
export const createResult = (result: Omit<Result, 'id'>): Result => {
  const db = getDatabase();
  const id = randomUUID();
  
  db.run(`
    INSERT INTO results 
    (id, sessionId, filename, path, status, severity, detectedAt, type, hash, notes, reviewed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    result.sessionId,
    result.filename,
    result.path,
    result.status,
    result.severity,
    result.detectedAt,
    result.type || null,
    result.hash || null,
    result.notes || null,
    result.reviewed ? 1 : 0
  ]);
  
  return { id, ...result };
};

export const getResults = (params: {
  sessionId?: string;
  page?: number;
  limit?: number;
  severity?: string;
  status?: string;
}): { results: Result[]; total: number; totalPages: number } => {
  const db = getDatabase();
  const { sessionId, page = 1, limit = 20, severity, status } = params;
  
  let whereConditions: string[] = [];
  let whereParams: any[] = [];
  
  if (sessionId) {
    whereConditions.push('sessionId = ?');
    whereParams.push(sessionId);
  }
  if (severity) {
    whereConditions.push('severity = ?');
    whereParams.push(severity);
  }
  if (status) {
    whereConditions.push('status = ?');
    whereParams.push(status);
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';
  
  // Get total count
  const countResults = db.exec(`SELECT COUNT(*) as count FROM results ${whereClause}`, whereParams);
  const total = countResults.length > 0 ? (countResults[0].values[0][0] as number) : 0;
  
  // Get paginated results
  const offset = (page - 1) * limit;
  const results = db.exec(`
    SELECT * FROM results 
    ${whereClause}
    ORDER BY detectedAt DESC 
    LIMIT ? OFFSET ?
  `, [...whereParams, limit, offset]);
  
  const resultsList = results.length > 0
    ? results[0].values.map(row => rowToResult(results[0].columns, row))
    : [];
  
  return {
    results: resultsList,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

export const getCriticalResults = (sessionId?: string): Result[] => {
  const db = getDatabase();
  const query = sessionId
    ? `SELECT * FROM results WHERE sessionId = ? AND severity IN ('HIGH', 'CRITICAL') AND reviewed = 0 ORDER BY detectedAt DESC`
    : `SELECT * FROM results WHERE severity IN ('HIGH', 'CRITICAL') AND reviewed = 0 ORDER BY detectedAt DESC`;
  
  const params = sessionId ? [sessionId] : [];
  const results = db.exec(query, params);
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map(row => rowToResult(columns, row));
};

export const markResultReviewed = (id: string) => {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  db.run(`
    UPDATE results 
    SET reviewed = 1, reviewedAt = ?
    WHERE id = ?
  `, [now, id]);
};

// ===== LOGS =====
export const createLog = (log: Omit<Log, 'id'>): Log => {
  const db = getDatabase();
  const id = randomUUID();
  
  db.run(`
    INSERT INTO logs 
    (id, sessionId, level, message, timestamp, context)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    id,
    log.sessionId || null,
    log.level,
    log.message,
    log.timestamp,
    log.context ? JSON.stringify(log.context) : null
  ]);
  
  return { id, ...log };
};

export const getLogs = (params: {
  sessionId?: string;
  level?: string;
  page?: number;
  limit?: number;
}): { logs: Log[]; total: number; totalPages: number } => {
  const db = getDatabase();
  const { sessionId, level, page = 1, limit = 50 } = params;
  
  let whereConditions: string[] = [];
  let whereParams: any[] = [];
  
  if (sessionId) {
    whereConditions.push('sessionId = ?');
    whereParams.push(sessionId);
  }
  if (level) {
    whereConditions.push('level = ?');
    whereParams.push(level);
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';
  
  // Get total count
  const countResults = db.exec(`SELECT COUNT(*) as count FROM logs ${whereClause}`, whereParams);
  const total = countResults.length > 0 ? (countResults[0].values[0][0] as number) : 0;
  
  // Get paginated results
  const offset = (page - 1) * limit;
  const results = db.exec(`
    SELECT * FROM logs 
    ${whereClause}
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
  `, [...whereParams, limit, offset]);
  
  const logsList = results.length > 0
    ? results[0].values.map(row => rowToLog(results[0].columns, row))
    : [];
  
  return {
    logs: logsList,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

// ===== HELPER FUNCTIONS =====
function rowToSession(columns: string[], values: any[]): Session {
  const obj: any = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  
  return {
    id: obj.id,
    clientLabel: obj.clientLabel,
    status: obj.status,
    startedAt: obj.startedAt,
    finishedAt: obj.finishedAt || undefined,
    totalFiles: obj.totalFiles || 0,
    suspectCount: obj.suspectCount || 0,
    criticalCount: obj.criticalCount || 0
  };
}

function rowToResult(columns: string[], values: any[]): Result {
  const obj: any = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  
  return {
    id: obj.id,
    sessionId: obj.sessionId,
    filename: obj.filename,
    path: obj.path,
    status: obj.status,
    severity: obj.severity,
    detectedAt: obj.detectedAt,
    type: obj.type || undefined,
    hash: obj.hash || undefined,
    notes: obj.notes || undefined,
    reviewed: obj.reviewed === 1,
    reviewedAt: obj.reviewedAt || undefined
  };
}

function rowToLog(columns: string[], values: any[]): Log {
  const obj: any = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  
  return {
    id: obj.id,
    sessionId: obj.sessionId || undefined,
    level: obj.level,
    message: obj.message,
    timestamp: obj.timestamp,
    context: obj.context ? JSON.parse(obj.context) : undefined
  };
}
