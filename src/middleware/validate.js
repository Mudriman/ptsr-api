import { ZodError } from 'zod';
import { comparePassword } from '../config/auth.js';
import prisma from '../config/prisma-client.js';

export const validate = (schema, options = {}) => async (req, res, next) => {
  try {
    // Валидация входных данных
    const data = schema.parse(req.body);

    // Проверка уникальности email для регистрации
    if (options.checkEmailUnique) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        throw new ZodError([{
          path: ['email'],
          message: 'Email уже зарегистрирован'
        }]);
      }
    }

    // Проверка существования пользователя
    if (options.checkUserExists) {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true, email: true, password: true, role: true }
      });
      if (!user) {
        throw new ZodError([{
          path: ['email'],
          message: 'Пользователь с таким email не найден'
        }]);
      }
      // Проверка пароля для login
      if (options.checkPassword && !comparePassword(data.password, user.password)) {
        throw new ZodError([{
          path: ['password'],
          message: 'Неверный пароль'
        }]);
      }
      req.validatedUser = user;
    }

    // Проверка токена для сброса пароля
    if (options.checkResetToken) {
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: data.token,
          expiresAt: { gt: new Date() }
        }
      });
      if (!resetToken) {
        throw new ZodError([{
          path: ['token'],
          message: 'Недействительный или истекший токен'
        }]);
      }
      req.validatedToken = resetToken;
    }

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }));
      res.status(400).json({
        error: 'Validation failed',
        errors
      });
    } else {
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
};