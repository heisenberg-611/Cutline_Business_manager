import prisma from '@/modules/core/db/prisma'

export async function getOutstandingInvoices(businessId: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      businessId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] }
    },
    select: {
      id: true,
      dueDate: true,
      amountDueCents: true,
      currency: true
    }
  })

  const now = new Date()
  const buckets = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0
  }

  invoices.forEach(inv => {
    if (!inv.dueDate) return
    const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysOverdue <= 0) return // Not overdue yet technically, but we might want to show them? The spec says "aging buckets" usually implies overdue.
    
    if (daysOverdue <= 30) buckets['0-30'] += inv.amountDueCents
    else if (daysOverdue <= 60) buckets['31-60'] += inv.amountDueCents
    else if (daysOverdue <= 90) buckets['61-90'] += inv.amountDueCents
    else buckets['90+'] += inv.amountDueCents
  })

  return buckets
}

export async function getRevenueSummary(businessId: string, startDate: Date, endDate: Date) {
  // Cash-basis (Payments received)
  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      createdAt: { gte: startDate, lte: endDate }
    }
  })
  const cashRevenue = payments.reduce((sum, p) => sum + p.amountCents, 0)

  // Accrual-basis (Invoices issued)
  const invoices = await prisma.invoice.findMany({
    where: {
      businessId,
      issuedAt: { gte: startDate, lte: endDate },
      status: { notIn: ['DRAFT', 'VOID', 'CREDIT_NOTE'] }
    }
  })
  const accrualRevenue = invoices.reduce((sum, inv) => sum + inv.totalCents, 0)

  return { cashRevenue, accrualRevenue }
}

export async function getProfitByProject(businessId: string, projectId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { businessId, projectId, status: { notIn: ['DRAFT', 'VOID', 'CREDIT_NOTE'] } },
    include: { payments: true }
  })
  
  const expenses = await prisma.expense.findMany({
    where: { businessId, projectId }
  })

  const revenueCents = invoices.reduce((sum, inv) => 
    sum + inv.payments.reduce((pSum, p) => pSum + p.amountCents, 0)
  , 0)
  
  const expenseCents = expenses.reduce((sum, exp) => sum + exp.amountCents, 0)

  return {
    revenueCents,
    expenseCents,
    profitCents: revenueCents - expenseCents
  }
}

export async function getAgingReport(businessId: string) {
  return getOutstandingInvoices(businessId)
}

export async function getStudioHealth(businessId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { cashRevenue } = await getRevenueSummary(businessId, startOfMonth, now)
  
  const outstandingInvoices = await prisma.invoice.findMany({
    where: {
      businessId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] }
    }
  })
  
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amountDueCents, 0)
  const totalOverdue = outstandingInvoices
    .filter(inv => inv.status === 'OVERDUE' || (inv.dueDate && inv.dueDate < now))
    .reduce((sum, inv) => sum + inv.amountDueCents, 0)

  // Simple DSO calculation: (Accounts Receivable / Total Credit Sales) * Number of Days
  // For MVP, just returning basic metrics.
  
  return {
    revenueMTD: cashRevenue,
    outstanding: totalOutstanding,
    overdue: totalOverdue,
    dso: 0 // Placeholder
  }
}
