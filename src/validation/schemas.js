import { z } from 'zod';

// Регистрация / логин
export const authSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),
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

// Схема для запроса сброса пароля
export const requestResetSchema = z.object({
  email: z.string().email(),
});

// Схема для сброса пароля
export const resetPasswordSchema = z.object({
  token: z.string().min(32, "Недействительный токен"),
  newPassword: z.string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),
});