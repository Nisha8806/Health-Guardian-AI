import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );
    const user = userResult.rows[0];

    const profileResult = await query(
      'INSERT INTO profiles (id, full_name) VALUES ($1, $2) RETURNING *',
      [user.id, full_name || null]
    );

    const token = signToken(user.id);
    res.status(201).json({ token, user: { id: user.id, email: user.email }, profile: profileResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [user.id]);

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email }, profile: profileResult.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
    const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [req.userId]);
    if (!userResult.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userResult.rows[0], profile: profileResult.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

export default router;
