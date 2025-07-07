import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTests, getTestById, submitTest, getResults } from '../controllers/tests.js';

const router = express.Router();

router.get('/', getTests); // Список всех тестов
router.get('/:id', getTestById); // Конкретный тест (с вопросами)
router.post('/:id/submit', authMiddleware, submitTest); // Отправка ответов
router.get('/results', authMiddleware, getResults); // История результатов

export default router;