'use server'

import prisma from '@/modules/core/db/prisma'
import { randomBytes } from 'crypto'
import { createNotification } from '@/modules/notifications/actions'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function submitIntakeForm(businessId: string, data: {
  clientName: string,
  clientEmail: string,
  projectTitle: string,
  projectType: string,
  scriptText: string,
  scriptLink: string,
  rawFootageLink: string
}) {
  // Find or create client
  let client = await prisma.client.findFirst({
    where: { businessId, email: data.clientEmail.toLowerCase() }
  })

  if (!client) {
    client = await prisma.client.create({
      data: {
        businessId,
        displayName: data.clientName,
        email: data.clientEmail.toLowerCase(),
      }
    })
  }

  // Find default workflow stage (Pre-production usually)
  const template = await prisma.workflowTemplate.findFirst({
    where: { businessId },
    include: { stages: { orderBy: { orderIndex: 'asc' } } }
  })
  
  const firstStage = template?.stages[0]

  // Create Project
  const project = await prisma.project.create({
    data: {
      businessId,
      clientId: client.id,
      title: data.projectTitle,
      type: data.projectType || 'Standard',
      statusStageId: firstStage?.id || null,
    }
  })

  // Add Script as Note if text provided
  if (data.scriptText) {
    await prisma.note.create({
      data: {
        projectId: project.id,
        type: 'client',
        content: `**Initial Script/Brief:**\n\n${data.scriptText}`
      }
    })
  }

  // Add Links
  if (data.scriptLink) {
    await prisma.projectLink.create({
      data: {
        projectId: project.id,
        label: 'Script Document',
        url: data.scriptLink
      }
    })
  }
  
  if (data.rawFootageLink) {
    await prisma.projectLink.create({
      data: {
        projectId: project.id,
        label: 'Raw Footage',
        url: data.rawFootageLink
      }
    })
  }

  // Notify Business Members
  try {
    const memberships = await prisma.businessMembership.findMany({
      where: { businessId }
    })
    
    for (const membership of memberships) {
      await createNotification({
        userId: membership.userId,
        businessId,
        title: "New Project Request",
        message: `${client.displayName} submitted a new project: "${project.title}".`,
        type: "project",
        actionUrl: `/dashboard/pipeline`
      })
    }
  } catch (err) {
    console.error("Notification failed", err)
  }

  return { success: true, projectId: project.id }
}


export async function createReviewRequest(projectId: string, draftLink: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Unauthorized')

  const project = await prisma.project.findFirst({
    where: { id: projectId, businessId: orgId },
    include: { client: true }
  })

  if (!project) throw new Error('Project not found')

  const token = randomBytes(24).toString('hex')

  const request = await prisma.reviewRequest.create({
    data: {
      businessId: orgId,
      projectId,
      clientId: project.clientId,
      token,
      draftLink
    }
  })

  revalidatePath('/dashboard/prodp')
  return request
}

export async function getReviewRequestByToken(token: string) {
  return await prisma.reviewRequest.findUnique({
    where: { token },
    include: {
      business: true,
      project: true,
      client: true
    }
  })
}

export async function submitReviewNotes(token: string, notes: string, links: string) {
  const request = await prisma.reviewRequest.findUnique({
    where: { token },
    include: { project: true, client: true }
  })

  if (!request) throw new Error('Request not found')
  if (request.status !== 'PENDING') throw new Error('Review already submitted')

  await prisma.reviewRequest.update({
    where: { id: request.id },
    data: {
      clientNotes: notes,
      clientLinks: links,
      status: 'REPLIED'
    }
  })

  // Notify Business Members
  try {
    const memberships = await prisma.businessMembership.findMany({
      where: { businessId: request.businessId }
    })
    
    for (const membership of memberships) {
      await createNotification({
        userId: membership.userId,
        businessId: request.businessId,
        title: "Client Revision Notes",
        message: `${request.client.displayName} added revisions for "${request.project.title}".`,
        type: "project",
        actionUrl: `/dashboard/prodp`
      })
    }
  } catch (err) {
    console.error("Notification failed", err)
  }

  return { success: true }
}

export async function getActiveReviewRequests() {
  const { orgId } = await auth()
  if (!orgId) return []

  return await prisma.reviewRequest.findMany({
    where: { businessId: orgId },
    include: { project: true, client: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function deleteReviewRequest(id: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Unauthorized')

  await prisma.reviewRequest.delete({
    where: { id, businessId: orgId }
  })
  
  revalidatePath('/dashboard/prodp')
}
