import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

// PUT /api/profile
router.put('/', async (req, res) => {
  const { full_name, phone, date_of_birth, gender, blood_type, allergies } = req.body;
  try {
    const result = await query(
      `UPDATE profiles SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        date_of_birth = COALESCE($3, date_of_birth),
        gender = COALESCE($4, gender),
        blood_type = COALESCE($5, blood_type),
        allergies = COALESCE($6, allergies),
        updated_at = now()
      WHERE id = $7
      RETURNING *`,
      [full_name, phone, date_of_birth, gender, blood_type, allergies, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/avatar  (multipart/form-data, field name "avatar")
router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  try {
    const result = await query(
      'UPDATE profiles SET avatar_url = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [avatarUrl, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save avatar' });
  }
});

export default router;
