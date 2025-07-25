import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { saveTestResult, getUserTests } from '../controllers/profile.js'

const router = express.Router();
router.use(authMiddleware); // Только авторизованные пользователи

router.post('/tests', saveTestResult);
router.get('/tests', getUserTests); // Получить свои тесты

export default router;