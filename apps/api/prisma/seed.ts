import { PrismaClient, Role, AuthProvider, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordUser = await bcrypt.hash('User123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskforge.dev' },
    update: {},
    create: {
      email: 'admin@taskforge.dev',
      password: passwordAdmin,
      role: Role.ADMIN,
      provider: AuthProvider.LOCAL,
      name: 'Admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@taskforge.dev' },
    update: {},
    create: {
      email: 'user@taskforge.dev',
      password: passwordUser,
      role: Role.USER,
      provider: AuthProvider.LOCAL,
      name: 'Regular User',
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Design ERD',
        description: 'Model relations',
        ownerId: admin.id,
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: 'Write Auth module',
        description: 'JWT + Refresh',
        ownerId: admin.id,
      },
      {
        title: 'Create UI skeleton',
        description: 'Next.js pages',
        ownerId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed:', { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
