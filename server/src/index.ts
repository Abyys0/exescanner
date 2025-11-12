import express from 'express';
import { createServer } from 'http';
// ...existing code...
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

// Load env vars
dotenv.config();

// Routes
import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';
import resultsRoutes from './routes/results';
import logsRoutes from './routes/logs';
import ingestRoutes, { setSocketIO } from './routes/ingest';

// Initialize DB
import { initDatabase } from './db/index';

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: IS_PRODUCTION ? undefined : false
}));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/results', resultsRoutes);
app.use('/logs', logsRoutes);
app.use('/ingest', ingestRoutes);

// Set Socket.IO instance for ingest route
setSocketIO(io);

// Serve static frontend in production
if (IS_PRODUCTION) {
  const frontendPath = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(frontendPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && 
        !req.path.startsWith('/sessions') && !req.path.startsWith('/results') &&
        !req.path.startsWith('/logs') && !req.path.startsWith('/ingest')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
  
  console.log(`📦 Serving frontend from: ${frontendPath}`);
}

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (socket as any).userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Join session room
  socket.on('join:session', (sessionId: string) => {
    socket.join(`scan:${sessionId}`);
    console.log(`Client ${socket.id} joined room scan:${sessionId}`);
  });
  
  // Leave session room
  socket.on('leave:session', (sessionId: string) => {
    socket.leave(`scan:${sessionId}`);
    console.log(`Client ${socket.id} left room scan:${sessionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║         ExeScanner Monitoring Server - READY               ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🔌 Socket.IO enabled
📊 Database initialized
🔐 JWT authentication enabled

Default credentials:
  Username: admin
  Password: admin

Environment:
  CORS Origin: ${CORS_ORIGIN}
  Node ENV: ${process.env.NODE_ENV || 'development'}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
