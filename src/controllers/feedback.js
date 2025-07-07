import { PrismaClient } from '@prisma/client'
import { sendEmail } from '../services/email.js'

const prisma = new PrismaClient()

export const submitFeedback = async (req, res) => {
  const { email, message } = req.body
  
  try {
    await prisma.feedback.create({
      data: { email, message }
    })

    await sendEmail(
      'sagkzizni@gmail.com',
      `Новое сообщение от ${email}`,
      `Сообщение: ${message}\n\nОтветить: ${email}`
    )

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка отправки' })
  }
}