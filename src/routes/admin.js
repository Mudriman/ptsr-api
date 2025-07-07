import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createTestTemplate, getAllUsers } from '../controllers/admin.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware); // Все роуты требуют админ-прав

router.post('/tests', createTestTemplate); // Создать шаблон теста
router.get('/users', getAllUsers); // Получить всех пользователей
router.post('/make-admin', async (req, res) => {
  const { email } = req.body
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })
  res.json({ success: true })
})

export default router;