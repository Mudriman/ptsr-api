import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTests = async (req, res) => {
  const tests = await prisma.testTemplate.findMany();
  res.json(tests);
};

export const getTestById = async (req, res) => {
  const test = await prisma.testTemplate.findUnique({
    where: { id: req.params.id },
    include: { questions: true },
  });
  res.json(test);
};

export const submitTest = async (req, res) => {
  const { answers } = req.body;
  const test = await prisma.testTemplate.findUnique({
    where: { id: req.params.id },
    include: { questions: true },
  });

  const score = answers.reduce((sum, answer) => sum + answer.value, 0);

  const result = await prisma.test.create({
    data: {
      userId: req.userId,
      testId: req.params.id,
      score,
      answers: { create: answers },
    },
  });
  res.json(result);
};

// Добавьте этот экспорт, если его нет
export const getResults = async (req, res) => {
  const tests = await prisma.test.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tests);
};
