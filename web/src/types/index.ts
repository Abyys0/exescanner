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
  detectedAt: string;
  type?: string;
  hash?: string;
  notes?: string;
  reviewed?: boolean;
  reviewedAt?: string;
}

export interface Log {
  id: string;
  sessionId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface Session {
  id: string;
  clientLabel: string;
  status: SessionStatus;
  startedAt: string;
  finishedAt?: string;
  totalFiles?: number;
  suspectCount?: number;
  criticalCount?: number;
}

export interface ProgressEvent {
  sessionId: string;
  percent: number;
  module: string;
  elapsedMs: number;
}

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

export interface User {
  id: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
