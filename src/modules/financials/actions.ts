'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/modules/core/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type LineItemInput = {
  description: string
  amount: number // in cents
}

export type InvoiceInput = {
  clientId: string
  projectId?: string
  dueDate?: string
  lineItems: LineItemInput[]
}

export async function createInvoice(input: InvoiceInput) {
  const { orgId } = await auth()
  
  if (!orgId) {
    throw new Error('Unauthorized')
  }

  if (!input.clientId) {
    throw new Error('Client is required')
  }

  if (!input.lineItems || input.lineItems.length === 0) {
    throw new Error('At least one line item is required')
  }

  const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = 0 // Simple MVP, no tax logic yet
  const total = subtotal + taxAmount

  await prisma.invoice.create({
    data: {
      businessId: orgId,
      clientId: input.clientId,
      projectId: input.projectId || null,
      subtotal,
      taxAmount,
      total,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      status: 'DRAFT',
      lineItems: {
        create: input.lineItems.map(item => ({
          description: item.description,
          amount: item.amount,
          sourceType: 'manual'
        }))
      }
    }
  })

  revalidatePath('/dashboard/financials')
  redirect('/dashboard/financials')
}

export async function getInvoices(orgId: string) {
  if (!orgId) return []

  return await prisma.invoice.findMany({
    where: { businessId: orgId },
    include: {
      client: true,
      project: true,
      lineItems: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
