import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../config/auth.js';
import { sendEmail } from '../services/email.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// === Register ===
export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    await sendEmail(email, 'Добро пожаловать', 'Вы успешно зарегистрировались!');
    const token = generateToken(user.id);

    res.json({ token, user });

  } catch (err) {
    if (err.code === 'P2002') { // Prisma уникальность
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Пользователь с таким email уже существует'
      });
    }

    console.error('Register error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Не удалось завершить регистрацию'
    });
  }
};

// === Login ===
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      }
    });

    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Неверный email или пароль'
      });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Не удалось войти в систему'
    });
  }
};

// === Request Password Reset ===
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: 'Некорректный email'
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({
        message: 'Если email зарегистрирован, вы получите письмо'
      });
    }

    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt }
    });

    const resetUrl = new URL('/reset_password', process.env.FRONTEND_URL);
    resetUrl.searchParams.set('token', token);

    const emailText = `Запрошен сброс пароля для аккаунта ${email}.
    Сбросить пароль: ${resetUrl.toString()}
    Ссылка действительна 1 час.
    Если вы не запрашивали сброс, проигнорируйте это письмо.`;

    await sendEmail(email, 'Сброс пароля', emailText);

    res.json({ message: 'Если email зарегистрирован, вы получите письмо' });

  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Не удалось отправить ссылку для сброса пароля'
    });
  }
};

// === Reset Password ===
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        details: 'Ссылка на сброс пароля недействительна или устарела'
      });
    }

    const hashedPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    res.json({ message: 'Пароль успешно изменен' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: 'Не удалось изменить пароль'
    });
  }
};