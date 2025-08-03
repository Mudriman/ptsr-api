// src/middleware/auth.js
import prisma from '../config/prisma-client.js';
import { verifyToken } from '../config/auth.js';
import { blacklistedTokens } from '../controllers/auth.js'; // Импортируй Set

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: 'Token is blacklisted' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};