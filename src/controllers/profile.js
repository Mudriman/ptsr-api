import prisma from '../config/prisma-client.js';

export const saveTestResult = async (req, res) => {
  const { type, score } = req.body;
  const userId = req.userId; // Из authMiddleware

  try {
    const test = await prisma.test.create({
      data: { userId, type, score },
    });
    res.json({ success: true, test });
  } catch (err) {
    console.error("Ошибка сохранения теста:", err);
    res.status(500).json({ success: false, error: "Ошибка при сохранении теста" });
  }
};

export const getUserTests = async (req, res) => {
  const userId = req.userId;
  
  const tests = await prisma.test.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ tests });
};