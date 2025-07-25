import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/config/auth.js'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashPassword('ADmin123'),
      role: 'ADMIN'
    }
  })
}

main()
  .catch(e => { throw e })
  .finally(() => prisma.$disconnect())