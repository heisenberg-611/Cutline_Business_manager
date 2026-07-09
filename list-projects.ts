import prisma from './src/modules/core/db/prisma';

async function main() {
  const orgId = 'org_3GEIEBGsrW3ePwjLXp84ycUR5KA';
  const projects = await prisma.project.findMany({ 
    where: { businessId: orgId },
    include: { statusStage: true, client: true }
  });
  
  projects.forEach((p, i) => {
    console.log(`${i+1}. [${p.isArchived ? 'ARCHIVED' : 'ACTIVE'}] ${p.title} - Stage: ${p.statusStage?.name}`);
  });
}

main().catch(console.error);
