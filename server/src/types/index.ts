export type Status = 'OK' | 'SUSPECT';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SessionStatus = 'ACTIVE' | 'DONE' | 'ERROR';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface Result {
  id: string;
  sessionId: string;
  filename: string;
  path: string;
  status: Status;
  severity: Severity;
  detectedAt: string; // ISO timestamp
  type?: string; // Detection category (e.g., "YARA", "PEAnomaly")
  hash?: string; // SHA256
  notes?: string;
  reviewed?: boolean;
  reviewedAt?: string;
}

export interface Log {
  id: string;
  sessionId: string;
  level: LogLevel;
  message: string;
  timestamp: string; // ISO timestamp
  context?: Record<string, any>;
}

export interface Session {
  id: string;
  clientLabel: string;
  status: SessionStatus;
  startedAt: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp
  totalFiles?: number;
  suspectCount?: number;
  criticalCount?: number;
}

// Event payloads from scanner
export interface ProgressEvent {
  sessionId: string;
  percent: number;
  module: string;
  elapsedMs: number;
}

export interface FindingEvent extends Result {}

export interface ErrorEvent {
  sessionId: string;
  message: string;
  code?: string;
}

export interface DoneEvent {
  sessionId: string;
  summary?: {
    totalFiles: number;
    suspectCount: number;
    criticalCount: number;
    duration: number;
  };
}
