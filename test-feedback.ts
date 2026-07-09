import prisma from './src/modules/core/db/prisma';
import { randomBytes } from 'crypto';

async function main() {
  const project = await prisma.project.findFirst({
    include: { client: true }
  });
  if (!project) {
    console.log("No projects found in the database. Please create a project first.");
    return;
  }
  
  const token = randomBytes(24).toString('hex');
  const req = await prisma.feedbackRequest.create({
    data: {
      businessId: project.businessId,
      projectId: project.id,
      clientId: project.clientId,
      token,
      status: 'PENDING'
    }
  });
  
  console.log(`\nGenerated Feedback Link for Project "${project.title}":`);
  console.log(`http://localhost:3000/feedback/${token}\n`);
}

main().catch(console.error);
