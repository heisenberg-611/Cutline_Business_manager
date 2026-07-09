import prisma from './src/modules/core/db/prisma';

async function main() {
  const members = await prisma.businessMembership.findMany();
  console.log("All Members:", members);
  
  const businesses = await prisma.business.findMany();
  console.log("All Businesses:", businesses);
  
  const users = await prisma.user.findMany();
  console.log("All Users:", users);
  
  const notifs = await prisma.notification.findMany();
  console.log("All Notifs:", notifs);
}

main().catch(console.error);
