import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/chat-history
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at ASC LIMIT 50',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat-history
router.post('/', async (req, res) => {
  const { message, is_user } = req.body;
  try {
    const result = await query(
      'INSERT INTO chat_history (user_id, message, is_user) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, message, is_user]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save chat message' });
  }
});

// DELETE /api/chat-history  (clears all history for the current user)
router.delete('/', async (req, res) => {
  try {
    await query('DELETE FROM chat_history WHERE user_id = $1', [req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export default router;
