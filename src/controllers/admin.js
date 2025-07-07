export const createTestTemplate = async (req, res) => {
  const { name, questions } = req.body;
  const test = await prisma.testTemplate.create({
    data: {
      name,
      questions: { create: questions },
    },
  });
  res.json(test);
};

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};