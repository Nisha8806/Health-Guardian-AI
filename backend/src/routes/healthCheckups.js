import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/health-checkups (?upcoming=true&limit=3 for dashboard-style queries)
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM health_checkups WHERE user_id = $1';
    const params = [req.userId];

    if (req.query.upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      params.push(today);
      sql += ` AND status = 'scheduled' AND scheduled_date >= $${params.length}`;
    }

    sql += ' ORDER BY scheduled_date ASC';

    if (req.query.limit) {
      params.push(parseInt(req.query.limit, 10));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch health checkups' });
  }
});

// POST /api/health-checkups
router.post('/', async (req, res) => {
  const { title, checkup_type, facility, scheduled_date, reminder_days_before, notes, family_member_id } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const result = await query(
      `INSERT INTO health_checkups (user_id, title, checkup_type, facility, scheduled_date, reminder_days_before, notes, family_member_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.userId, title, checkup_type, facility, scheduled_date, reminder_days_before ?? 1, notes || null, family_member_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add health checkup' });
  }
});

// PUT /api/health-checkups/:id
router.put('/:id', async (req, res) => {
  const { title, checkup_type, facility, scheduled_date, reminder_days_before, notes, family_member_id, status } = req.body;
  try {
    const result = await query(
      `UPDATE health_checkups SET
        title = $1, checkup_type = $2, facility = $3, scheduled_date = $4,
        reminder_days_before = $5, notes = $6, family_member_id = $7, status = $8
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [title, checkup_type, facility, scheduled_date, reminder_days_before, notes || null, family_member_id || null, status, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Checkup not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update health checkup' });
  }
});

// PATCH /api/health-checkups/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const result = await query(
      'UPDATE health_checkups SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Checkup not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/health-checkups/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM health_checkups WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete health checkup' });
  }
});

export default router;
