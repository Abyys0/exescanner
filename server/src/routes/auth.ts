import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';

const router = Router();

// Demo user (in production, use database)
const DEMO_USER = {
  id: 'demo-user-1',
  username: 'admin',
  password: bcrypt.hashSync('admin', 10) // Hash of 'admin'
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (username !== DEMO_USER.username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, DEMO_USER.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(DEMO_USER.id);
    
    res.json({
      token,
      user: {
        id: DEMO_USER.id,
        username: DEMO_USER.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
