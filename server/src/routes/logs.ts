import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as models from '../models';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const { sessionId, level, page = '1', limit = '100' } = req.query;
    
    const { logs, total } = models.getLogs({
      sessionId: sessionId as string | undefined,
      level: level as string | undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.json({
      logs,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
