import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/family-members
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM family_members WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch family members' });
  }
});

// GET /api/family-members/:id/stats -> active medicines count + scheduled checkups count
router.get('/:id/stats', async (req, res) => {
  try {
    const meds = await query(
      "SELECT COUNT(*) FROM medicines WHERE family_member_id = $1 AND is_active = true",
      [req.params.id]
    );
    const checkups = await query(
      "SELECT COUNT(*) FROM health_checkups WHERE family_member_id = $1 AND status = 'scheduled'",
      [req.params.id]
    );
    res.json({
      activeMedicines: parseInt(meds.rows[0].count, 10),
      scheduledCheckups: parseInt(checkups.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/family-members/:id/medicines -> active medicines
router.get('/:id/medicines', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM medicines WHERE family_member_id = $1 AND is_active = true',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// GET /api/family-members/:id/checkups -> scheduled checkups
router.get('/:id/checkups', async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM health_checkups WHERE family_member_id = $1 AND status = 'scheduled'",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch checkups' });
  }
});

// POST /api/family-members
router.post('/', async (req, res) => {
  const { name, relationship, date_of_birth, gender, blood_type, allergies } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await query(
      `INSERT INTO family_members (user_id, name, relationship, date_of_birth, gender, blood_type, allergies)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, name, relationship, date_of_birth || null, gender || null, blood_type || null, allergies || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add family member' });
  }
});

// PUT /api/family-members/:id
router.put('/:id', async (req, res) => {
  const { name, relationship, date_of_birth, gender, blood_type, allergies } = req.body;
  try {
    const result = await query(
      `UPDATE family_members SET
        name = $1, relationship = $2, date_of_birth = $3, gender = $4, blood_type = $5, allergies = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [name, relationship, date_of_birth || null, gender || null, blood_type || null, allergies || null, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Family member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update family member' });
  }
});

// DELETE /api/family-members/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM family_members WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete family member' });
  }
});

export default router;
