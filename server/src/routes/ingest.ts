import { Router } from 'express';
import { scannerTokenMiddleware } from '../middleware/auth';
import { ProgressEvent, FindingEvent, ErrorEvent, DoneEvent } from '../types';
import * as models from '../models';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer;

export const setSocketIO = (socketServer: SocketServer) => {
  io = socketServer;
};

const router = Router();

router.use(scannerTokenMiddleware);

router.post('/event', (req, res) => {
  try {
    const { type, payload } = req.body;
    
    if (!type || !payload) {
      return res.status(400).json({ error: 'Event type and payload required' });
    }
    
    const { sessionId } = payload;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required in payload' });
    }
    
    // Handle different event types
    switch (type) {
      case 'progress': {
        const event = payload as ProgressEvent;
        
        // Create log
        models.createLog({
          sessionId: event.sessionId,
          level: 'INFO',
          message: `Progress: ${event.percent}% - ${event.module}`,
          timestamp: new Date().toISOString(),
          context: { module: event.module, elapsedMs: event.elapsedMs }
        });
        
        // Emit via Socket.IO
        io.to(`scan:${sessionId}`).emit('progress', event);
        break;
      }
      
      case 'finding': {
        const finding = payload as FindingEvent;
        
        // Create result
        const result = models.createResult(finding);
        
        // Create log
        models.createLog({
          sessionId: finding.sessionId,
          level: finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'WARN' : 'INFO',
          message: `Finding: ${finding.filename} (${finding.severity})`,
          timestamp: new Date().toISOString(),
          context: { filename: finding.filename, severity: finding.severity }
        });
        
        // Emit via Socket.IO
        io.to(`scan:${sessionId}`).emit('finding', result);
        break;
      }
      
      case 'error': {
        const errorEvent = payload as ErrorEvent;
        
        // Create log
        models.createLog({
          sessionId: errorEvent.sessionId,
          level: 'ERROR',
          message: errorEvent.message,
          timestamp: new Date().toISOString(),
          context: { code: errorEvent.code }
        });
        
        // Update session status
        models.updateSessionStatus(sessionId, 'ERROR');
        
        // Emit via Socket.IO
        io.to(`scan:${sessionId}`).emit('error', errorEvent);
        break;
      }
      
      case 'done': {
        const doneEvent = payload as DoneEvent;
        
        // Update session status
        models.updateSessionStatus(sessionId, 'DONE', doneEvent.summary);
        
        // Create log
        models.createLog({
          sessionId: doneEvent.sessionId,
          level: 'INFO',
          message: `Scan completed. Summary: ${JSON.stringify(doneEvent.summary)}`,
          timestamp: new Date().toISOString(),
          context: doneEvent.summary
        });
        
        // Emit via Socket.IO
        io.to(`scan:${sessionId}`).emit('done', doneEvent);
        break;
      }
      
      default:
        return res.status(400).json({ error: 'Unknown event type' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ingest event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
