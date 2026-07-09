import prisma from './src/modules/core/db/prisma';

async function main() {
  const orgId = 'org_3GEIEBGsrW3ePwjLXp84ycUR5KA';
  const allProjects = await prisma.project.findMany({ where: { businessId: orgId } });
  
  const nullStageProjects = allProjects.filter(p => !p.statusStageId);
  console.log(`Total projects: ${allProjects.length}`);
  console.log(`Projects with null statusStageId: ${nullStageProjects.length}`);
}

main().catch(console.error);
