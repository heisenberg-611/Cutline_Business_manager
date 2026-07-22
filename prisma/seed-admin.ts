import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'dhrubojyotisaha02@gmail.com';
  
  const existing = await prisma.globalAdmin.findUnique({ where: { email } });
  if (existing) {
    console.log(`GlobalAdmin already exists for ${email}`);
    return;
  }

  await prisma.globalAdmin.create({
    data: {
      email,
      passwordHash: null, // Forces the user to set a password on first login
    },
  });

  console.log(`Successfully added ${email} to GlobalAdmin!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
