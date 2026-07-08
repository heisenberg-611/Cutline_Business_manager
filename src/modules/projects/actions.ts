'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/modules/core/db/prisma'

export async function createProject(data: FormData) {
  const { orgId } = await auth()
  
  if (!orgId) {
    throw new Error('Unauthorized: No active business selected.')
  }

  const clientId = data.get('clientId') as string
  const title = data.get('title') as string
  const type = data.get('type') as string
  const priority = data.get('priority') as string
  const deadlineStr = data.get('deadline') as string

  if (!title || title.trim() === '') {
    throw new Error('Title is required')
  }

  if (!clientId || clientId.trim() === '') {
    throw new Error('Client is required')
  }

  const deadline = deadlineStr ? new Date(deadlineStr) : null

  await prisma.project.create({
    data: {
      businessId: orgId,
      clientId,
      title,
      type: type || null,
      priority: priority || null,
      deadline
    }
  })

  revalidatePath('/dashboard/projects')
}

export async function getProjects(orgId: string) {
  if (!orgId) {
    return []
  }

  return await prisma.project.findMany({
    where: {
      businessId: orgId
    },
    include: {
      client: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
