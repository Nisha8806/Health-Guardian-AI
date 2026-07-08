import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/medicines  (+ ?reminders=today to also get today's reminders)
router.get('/', async (req, res) => {
  try {
    const medicines = await query(
      'SELECT * FROM medicines WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    let reminders = [];
    if (req.query.reminders === 'today') {
      const today = new Date().toISOString().split('T')[0];
      const remindersResult = await query(
        `SELECT mr.* FROM medicine_reminders mr
         JOIN medicines m ON m.id = mr.medicine_id
         WHERE m.user_id = $1 AND mr.date = $2`,
        [req.userId, today]
      );
      reminders = remindersResult.rows;
    }

    res.json({ medicines: medicines.rows, reminders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// POST /api/medicines
router.post('/', async (req, res) => {
  const { name, dosage, frequency, times, start_date, end_date, notes, family_member_id, is_active } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await query(
      `INSERT INTO medicines (user_id, name, dosage, frequency, times, start_date, end_date, notes, family_member_id, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.userId, name, dosage, frequency, times, start_date, end_date || null, notes || null, family_member_id || null, is_active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
});

// PUT /api/medicines/:id
router.put('/:id', async (req, res) => {
  const { name, dosage, frequency, times, start_date, end_date, notes, family_member_id, is_active } = req.body;
  try {
    const result = await query(
      `UPDATE medicines SET
        name = $1, dosage = $2, frequency = $3, times = $4, start_date = $5,
        end_date = $6, notes = $7, family_member_id = $8, is_active = $9
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [name, dosage, frequency, times, start_date, end_date || null, notes || null, family_member_id || null, is_active, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Medicine not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update medicine' });
  }
});

// PATCH /api/medicines/reminders/:id  -> mark a reminder taken
router.patch('/reminders/:id', async (req, res) => {
  try {
    const result = await query(
      `UPDATE medicine_reminders mr SET taken = true, taken_at = now()
       FROM medicines m
       WHERE mr.id = $1 AND mr.medicine_id = m.id AND m.user_id = $2
       RETURNING mr.*`,
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Reminder not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/medicines/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM medicines WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete medicine' });
  }
});

export default router;
