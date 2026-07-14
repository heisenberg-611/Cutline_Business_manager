'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/modules/core/db/prisma'
import { revalidatePath } from 'next/cache'

export async function getProjectDetails(projectId: string) {
  const { orgId, userId, orgRole } = await auth()
  if (!orgId || !userId) throw new Error('Unauthorized')

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      businessId: orgId
    },
    include: {
      client: true,
      statusStage: true,
      notes: {
        orderBy: { createdAt: 'desc' }
      },
      timeEntries: {
        orderBy: { createdAt: 'desc' }
      },
      links: {
        orderBy: { createdAt: 'desc' }
      },
      assets: {
        include: {
          asset: true
        }
      }
    }
  })

  if (!project) return null

  // Group 2 & 3: Authorization and Least Privilege Client Data
  if (orgRole !== 'org:admin') {
    if (project.assigneeId !== userId) {
      throw new Error('Forbidden: You are not assigned to this project.')
    }
    
    // Narrowly scope the client data (scrub sensitive fields)
    project.client = {
      ...project.client,
      email: null,
      phone: null,
      industry: null,
      preferredChannel: null,
      internalRating: null,
    }
  }

  return project
}

export async function addNote(projectId: string, content: string, type: string) {
  const { orgId, userId, orgRole } = await auth()
  if (!orgId || !userId) throw new Error('Unauthorized')

  // Verify access
  const project = await prisma.project.findFirst({
    where: { id: projectId, businessId: orgId }
  })
  if (!project) throw new Error('Project not found')
  
  if (orgRole !== 'org:admin' && project.assigneeId !== userId) {
    throw new Error('Forbidden: You are not assigned to this project.')
  }

  await prisma.note.create({
    data: {
      projectId,
      content,
      type
    }
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function logTime(projectId: string, durationMinutes: number, isBillable: boolean) {
  const { orgId, userId, orgRole } = await auth()
  if (!orgId || !userId) throw new Error('Unauthorized')

  // Verify access
  const project = await prisma.project.findFirst({
    where: { id: projectId, businessId: orgId }
  })
  if (!project) throw new Error('Project not found')
  
  if (orgRole !== 'org:admin' && project.assigneeId !== userId) {
    throw new Error('Forbidden: You are not assigned to this project.')
  }

  await prisma.timeEntry.create({
    data: {
      projectId,
      userId,
      durationMinutes,
      isBillable,
      source: 'manual'
    }
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function addLink(projectId: string, url: string, label: string) {
  const { orgId, userId, orgRole } = await auth()
  if (!orgId || !userId) throw new Error('Unauthorized')

  // Verify access
  const project = await prisma.project.findFirst({
    where: { id: projectId, businessId: orgId }
  })
  if (!project) throw new Error('Project not found')
  
  if (orgRole !== 'org:admin' && project.assigneeId !== userId) {
    throw new Error('Forbidden: You are not assigned to this project.')
  }

  await prisma.projectLink.create({
    data: {
      projectId,
      url,
      label
    }
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteLink(linkId: string, projectId: string) {
  const { orgId, userId, orgRole } = await auth()
  if (!orgId || !userId) throw new Error('Unauthorized')

  // Verify access
  const project = await prisma.project.findFirst({
    where: { id: projectId, businessId: orgId }
  })
  if (!project) throw new Error('Project not found')
  
  if (orgRole !== 'org:admin' && project.assigneeId !== userId) {
    throw new Error('Forbidden: You are not assigned to this project.')
  }

  await prisma.projectLink.deleteMany({
    where: { id: linkId, projectId, project: { businessId: orgId } }
  })

  revalidatePath(`/dashboard/projects/${projectId}`)
}
