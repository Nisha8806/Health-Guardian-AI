import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadPrescription } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

// GET /api/prescriptions
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM prescriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// POST /api/prescriptions  (multipart/form-data, field name "image" + other fields)
router.post('/', uploadPrescription.single('image'), async (req, res) => {
  const { doctor_name, diagnosis, notes, prescribed_date, family_member_id } = req.body;
  const imageUrl = req.file ? `/uploads/prescriptions/${req.file.filename}` : null;

  try {
    const result = await query(
      `INSERT INTO prescriptions (user_id, family_member_id, image_url, doctor_name, diagnosis, notes, prescribed_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, family_member_id || null, imageUrl, doctor_name || null, diagnosis || null, notes || null, prescribed_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM prescriptions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

export default router;
