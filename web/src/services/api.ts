import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { Session, Result, Log, LoginResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
    return data;
  }
};

// Sessions API
export const sessionsAPI = {
  getAll: async (): Promise<Session[]> => {
    const { data } = await api.get<Session[]>('/sessions');
    return data;
  },
  create: async (clientLabel: string): Promise<Session> => {
    const { data } = await api.post<Session>('/sessions', { clientLabel });
    return data;
  },
  getOne: async (id: string): Promise<Session> => {
    const { data } = await api.get<Session>(`/sessions/${id}`);
    return data;
  }
};

// Results API
export const resultsAPI = {
  getAll: async (params: {
    sessionId?: string;
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
  }) => {
    const { data } = await api.get<{
      results: Result[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>('/results', { params });
    return data;
  },
  getCritical: async (sessionId?: string): Promise<Result[]> => {
    const { data } = await api.get<Result[]>('/results/critical', {
      params: { sessionId }
    });
    return data;
  },
  acknowledge: async (id: string): Promise<void> => {
    await api.post('/results/ack', { id });
  }
};

// Logs API
export const logsAPI = {
  getAll: async (params: {
    sessionId?: string;
    level?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<{
      logs: Log[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>('/logs', { params });
    return data;
  }
};

// WebSocket client
class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinSession(sessionId: string) {
    this.socket?.emit('join:session', sessionId);
  }

  leaveSession(sessionId: string) {
    this.socket?.emit('leave:session', sessionId);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
