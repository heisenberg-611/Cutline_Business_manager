'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/modules/core/db/prisma'

export async function createClient(data: FormData) {
  const { orgId } = await auth()
  
  if (!orgId) {
    throw new Error('Unauthorized: No active business selected.')
  }

  const displayName = data.get('displayName') as String
  const companyName = data.get('companyName') as String
  const industry = data.get('industry') as String
  const preferredChannel = data.get('preferredChannel') as String

  if (!displayName || displayName.trim() === '') {
    throw new Error('Display Name is required')
  }

  await prisma.client.create({
    data: {
      businessId: orgId,
      displayName: displayName.toString(),
      companyName: companyName ? companyName.toString() : null,
      industry: industry ? industry.toString() : null,
      preferredChannel: preferredChannel ? preferredChannel.toString() : null,
      internalRating: 3 // Default 3 stars
    }
  })

  revalidatePath('/dashboard/clients')
}

export async function getClients(orgId: string) {
  if (!orgId) {
    return []
  }

  return await prisma.client.findMany({
    where: {
      businessId: orgId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
