import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as models from '../models';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const { sessionId, page = '1', limit = '50', severity, status } = req.query;
    
    const { results, total } = models.getResults(
      sessionId as string | undefined,
      parseInt(page as string),
      parseInt(limit as string),
      severity as string | undefined,
      status as string | undefined
    );
    
    res.json({
      results,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      pages: Math.ceil(total / parseInt(limit as string))
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/critical', (req, res) => {
  try {
    const { sessionId } = req.query;
    const results = models.getCriticalResults(sessionId as string | undefined);
    res.json(results);
  } catch (error) {
    console.error('Get critical results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ack', (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Result ID is required' });
    }
    
    models.markResultReviewed(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Acknowledge result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
