import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import profileRoutes from './routes/profile.js';
import prisma from './config/prisma-client.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Подключение роутов
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/tests', testRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/profile', profileRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = async (signal) => {
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log(`${signal} received, server closed`);
      process.exit(0);
    });
  } catch (err) {
    console.error(`Error during ${signal} shutdown:`, err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));