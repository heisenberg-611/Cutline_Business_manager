'use server'

import prisma from '@/modules/core/db/prisma'
import { randomBytes } from 'crypto'
import { withUniqueToken } from '@/lib/utils/unique-token'
import { createNotification, broadcastNotification } from '@/modules/notifications/actions'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function submitIntakeForm(businessId: string, data: {
  clientName: string,
  clientEmail: string,
  companyName?: string,
  phone?: string,
  industry?: string,
  preferredChannel?: string,
  projectTitle: string,
  projectType: string,
  scriptText: string,
  scriptLink: string,
  rawFootageLink: string
}) {
  // Find default workflow stage (read-only, safe outside transaction)
  const template = await prisma.workflowTemplate.findFirst({
    where: { businessId },
    include: { stages: { orderBy: { orderIndex: 'asc' } } }
  })
  const firstStage = template?.stages[0]

  // All writes in a single transaction — partial failure rolls back everything
  const { client, project } = await prisma.$transaction(async (tx) => {
    // Find or create client
    let client = await tx.client.findFirst({
      where: { businessId, email: data.clientEmail.toLowerCase() }
    })

    if (!client) {
      const business = await tx.business.update({
        where: { id: businessId },
        data: { clientSequence: { increment: 1 } },
        select: { clientSequence: true }
      })
      const displayId = `CL-${String(business.clientSequence).padStart(3, '0')}`

      client = await tx.client.create({
        data: {
          businessId,
          displayId,
          displayName: data.clientName,
          email: data.clientEmail.toLowerCase(),
          companyName: data.companyName,
          phone: data.phone,
          industry: data.industry,
          preferredChannel: data.preferredChannel,
        }
      })
    } else {
      client = await tx.client.update({
        where: { id: client.id },
        data: {
          displayName: data.clientName,
          ...(data.companyName && { companyName: data.companyName }),
          ...(data.phone && { phone: data.phone }),
          ...(data.industry && { industry: data.industry }),
          ...(data.preferredChannel && { preferredChannel: data.preferredChannel }),
        }
      })
    }

    // Create Project with atomic sequence
    const projBusiness = await tx.business.update({
      where: { id: businessId },
      data: { projectSequence: { increment: 1 } },
      select: { projectSequence: true }
    })
    const projectDisplayId = `PRJ-${String(projBusiness.projectSequence).padStart(3, '0')}`

    const project = await tx.project.create({
      data: {
        businessId,
        displayId: projectDisplayId,
        clientId: client.id,
        title: data.projectTitle,
        type: data.projectType || 'Standard',
        statusStageId: firstStage?.id || null,
      }
    })

    // Add Script as Note if text provided
    if (data.scriptText) {
      await tx.note.create({
        data: {
          projectId: project.id,
          type: 'client',
          content: `**Initial Script/Brief:**\n\n${data.scriptText}`
        }
      })
    }

    // Add Links
    if (data.scriptLink) {
      await tx.projectLink.create({
        data: {
          projectId: project.id,
          label: 'Script Document',
          url: data.scriptLink
        }
      })
    }

    if (data.rawFootageLink) {
      await tx.projectLink.create({
        data: {
          projectId: project.id,
          label: 'Raw Footage',
          url: data.rawFootageLink
        }
      })
    }

    return { client, project }
  })

  // Notification broadcast OUTSIDE the transaction (Prisma Accelerate constraint)
  try {
    await broadcastNotification({
      businessId,
      title: "New Project Request",
      message: `${client.displayName} submitted a new project: "${project.title}".`,
      type: "project",
      actionUrl: `/dashboard/pipeline`
    })
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

  const request = await withUniqueToken(async (token) =>
    prisma.reviewRequest.create({
      data: {
        businessId: orgId,
        projectId,
        clientId: project.clientId,
        token,
        draftLink
      }
    })
  )

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
    await broadcastNotification({
      businessId: request.businessId,
      title: "Client Revision Notes",
      message: `${request.client.displayName} added revisions for "${request.project.title}".`,
      type: "project",
      actionUrl: `/dashboard/prodp`
    })
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

  await prisma.reviewRequest.deleteMany({
    where: { id, businessId: orgId }
  })
  
  revalidatePath('/dashboard/prodp')
  revalidatePath('/dashboard')
}

export async function resolveReviewRequest(id: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error('Unauthorized')

  await prisma.reviewRequest.updateMany({
    where: { id, businessId: orgId },
    data: { status: 'RESOLVED' }
  })
  
  revalidatePath('/dashboard/prodp')
  revalidatePath('/dashboard')
}
