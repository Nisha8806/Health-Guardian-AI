import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/dashboard -> everything the dashboard page needs, in one call
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [medicines, family, checkups, prescriptionCount, reminders, scheduledCheckupsCount] = await Promise.all([
      query('SELECT * FROM medicines WHERE user_id = $1 AND is_active = true', [req.userId]),
      query('SELECT * FROM family_members WHERE user_id = $1', [req.userId]),
      query(
        `SELECT * FROM health_checkups
         WHERE user_id = $1 AND status = 'scheduled' AND scheduled_date >= $2
         ORDER BY scheduled_date ASC LIMIT 3`,
        [req.userId, today]
      ),
      query('SELECT COUNT(*) FROM prescriptions WHERE user_id = $1', [req.userId]),
      query(
        `SELECT mr.* FROM medicine_reminders mr
         JOIN medicines m ON m.id = mr.medicine_id
         WHERE m.user_id = $1 AND mr.date = $2`,
        [req.userId, today]
      ),
      query(
        "SELECT COUNT(*) FROM health_checkups WHERE user_id = $1 AND status = 'scheduled'",
        [req.userId]
      ),
    ]);

    const completedToday = reminders.rows.filter((r) => r.taken).length;

    res.json({
      stats: {
        totalMedicines: medicines.rows.length,
        todayReminders: reminders.rows.length,
        completedToday,
        upcomingCheckups: checkups.rows.length,
        scheduledCheckupsTotal: parseInt(scheduledCheckupsCount.rows[0].count, 10),
        familyMembers: family.rows.length,
        prescriptions: parseInt(prescriptionCount.rows[0].count, 10),
      },
      upcomingMedicines: medicines.rows.slice(0, 3),
      upcomingCheckups: checkups.rows,
      familyMembers: family.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
