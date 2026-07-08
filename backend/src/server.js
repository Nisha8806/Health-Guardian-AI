import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import familyMemberRoutes from './routes/familyMembers.js';
import medicineRoutes from './routes/medicines.js';
import healthCheckupRoutes from './routes/healthCheckups.js';
import prescriptionRoutes from './routes/prescriptions.js';
import chatRoutes from './routes/chat.js';
import dashboardRoutes from './routes/dashboard.js';
import aiChatRoutes from './routes/aiChat.js';


dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Serve uploaded files (avatars, prescription images)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/family-members', familyMemberRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-checkups', healthCheckupRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chat-history', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai-chat', aiChatRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Health Guardian backend running on http://localhost:${PORT}`);
});
