import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        tests: {
          select: {
            id: true,
            type: true,
            score: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  res.json({ users, total });
};



export const getUserTests = async (req, res) => {
  const userId = +req.params.id;
  const tests = await prisma.test.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tests);
};

export const deleteUser = async (req, res) => {
  const userId = parseInt(req.userId); // Преобразуем в число, так как id — Int
  try {
    // Проверка корректности ID
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: "Некорректный ID пользователя" });
    }

    // Проверка, не пытается ли пользователь удалить сам себя
    if (req.user.id === userId) {
      return res.status(400).json({ success: false, error: "Нельзя удалить самого себя" });
    }

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: "Пользователь не найден" });
    }

    // Удаление связанных тестов и пользователя в транзакции
    await prisma.$transaction([
      prisma.test.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Успешный ответ
    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    res.status(500).json({ success: false, error: "Ошибка сервера при удалении пользователя" });
  }
};

export const makeAdmin = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  res.json(user);
};


export const getStats = async (req, res) => {
  const stats = await prisma.$queryRaw`
    SELECT 
      COUNT(DISTINCT "User".id) as "totalUsers",
      COUNT("Test".id) as "totalTests"
    FROM "User"
    LEFT JOIN "Test" ON "User".id = "Test"."userId"
  `;
  
  res.json(stats[0]);
};
