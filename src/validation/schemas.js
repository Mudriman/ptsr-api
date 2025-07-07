import { z } from 'zod';

// Регистрация / логин
export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Создание теста (админ)
export const testTemplateSchema = z.object({
  name: z.string(),
  questions: z.array(
    z.object({
      text: z.string(),
      options: z.record(z.any()).optional(), // { min: 0, max: 4 } или варианты ["Да", "Нет"]
    })
  ),
});

// Отправка ответов
export const submitTestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.number(),
    })
  ),
});

export const feedbackSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(1000)
})