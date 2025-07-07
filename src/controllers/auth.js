import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../config/auth.js';
import { sendEmail } from '../services/email.js';

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