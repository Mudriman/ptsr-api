import express from 'express'
import rateLimit from 'express-rate-limit'
import { submitFeedback } from '../controllers/feedback.js'
import { validate } from '../middleware/validate.js'
import { feedbackSchema } from '../validation/schemas.js'
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router()

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 3, // 3 запроса с одного email
  message: 'Превышен лимит запросов с этого email',
  keyGenerator: (req) => req.body.email.toLowerCase(), // Учитываем email
  handler: (req, res) => {
    res.status(429).json({
      error: 'Слишком много запросов',
      message: `Вы можете отправить только 3 сообщения каждые 15 минут`,
      resetTime: new Date(Date.now() + 15 * 60 * 1000)
    })
  }
})

router.post('/', 
  authMiddleware,
  validate(feedbackSchema), 
  feedbackLimiter, 
  submitFeedback
)

export default router