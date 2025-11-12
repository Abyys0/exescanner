import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as models from '../models';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const sessions = models.getSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { clientLabel } = req.body;
    
    if (!clientLabel) {
      return res.status(400).json({ error: 'clientLabel is required' });
    }
    
    const session = models.createSession(clientLabel);
    
    // Create initial log
    models.createLog({
      sessionId: session.id,
      level: 'INFO',
      message: `Session created for client: ${clientLabel}`,
      timestamp: new Date().toISOString(),
      context: undefined
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const session = models.getSession(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
