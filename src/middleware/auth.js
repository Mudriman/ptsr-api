import { verifyToken } from '../config/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
};