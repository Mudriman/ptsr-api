import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Подключение роутов
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/tests', testRoutes);
app.use('/feedback', feedbackRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
