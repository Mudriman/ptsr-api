import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../config/auth.js';
import { sendEmail } from '../services/email.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// === Register ===
export const register = async (req, res) => {
  const { email, password } = req.body;
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
};

// === Login ===
export const login = async (req, res) => {
  const { id, email, role } = req.validatedUser;
  const token = generateToken(id);

  res.json({
    token,
    user: { id, email, role }
  });
};

// === Request Password Reset ===
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

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
};

// === Reset Password ===
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { email, id } = req.validatedToken;

  const hashedPassword = hashPassword(newPassword);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  await prisma.passwordResetToken.delete({
    where: { id }
  });

  res.json({ message: 'Пароль успешно изменен' });
};