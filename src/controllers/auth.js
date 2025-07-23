import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../config/auth.js';
import { sendEmail } from '../services/email.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    await sendEmail(
      req.body.email,
      'Добро пожаловать в PTSD Therapy',
      'Вы успешно зарегистрировались!'
    )

    const token = generateToken(user.id);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  res.json({ token });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  // Валидация email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Некорректный email' });
  }

  try {
    // Проверка существования пользователя (без утечки информации)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'Если email зарегистрирован, вы получите письмо' });
    }

    // Удаление старых токенов + генерация нового
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 час

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt }
    });

    // Безопасная генерация ссылки
    const resetUrl = new URL('/reset_password', process.env.FRONTEND_URL);
    resetUrl.searchParams.set('token', token);

    // Отправка email через транзакционный сервис
    const emailText = `Запрошен сброс пароля для аккаунта ${email}.
    Сбросить пароль: ${resetUrl.toString()}
    Ссылка действительна 1 час.
    Если вы не запрашивали сброс, проигнорируйте это письмо.`;

    await sendEmail(
      email, // to
      'Сброс пароля', // subject
      emailText // text
    );

    res.json({ message: 'Если email зарегистрирован, вы получите письмо' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Ошибка при отправке ссылки' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Находим токен и проверяем срок действия
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Недействительная или просроченная ссылка' });
    }

    // Обновляем пароль пользователя
    const hashedPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: {
        password: hashedPassword
      }
    });

    // Удаляем использованный токен
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
};