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
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  
  const { cashRevenue } = await getRevenueSummary(businessId, startOfMonth, now)
  const { cashRevenue: lastMonthRevenue } = await getRevenueSummary(businessId, startOfLastMonth, endOfLastMonth)
  
  const revenueDelta = lastMonthRevenue > 0 
    ? ((cashRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0
  
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

  // Utilization calculation
  const daysInPeriod = Math.max(1, (now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24))
  const weeksInPeriod = daysInPeriod / 7
  
  const memberships = await prisma.businessMembership.findMany({
    where: { businessId }
  })
  
  const totalAvailableHours = memberships.reduce((sum, m) => sum + (m.weeklyCapacityHours * weeksInPeriod), 0)
  
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      project: { businessId },
      isBillable: true,
      createdAt: { gte: startOfMonth }
    }
  })
  
  const billableHours = timeEntries.reduce((sum, t) => sum + t.durationMinutes, 0) / 60
  
  const utilization = totalAvailableHours > 0 ? (billableHours / totalAvailableHours) * 100 : 0

  // At-risk deadlines
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  const activeProjects = await prisma.project.findMany({
    where: { businessId, isArchived: false },
    include: { 
      statusStage: true,
      stageHistory: { orderBy: { enteredAt: 'desc' }, take: 1 }
    }
  })

  let atRiskCount = 0
  activeProjects.forEach(p => {
    if (p.statusStage?.name.toLowerCase().includes('final')) return

    let isAtRisk = false
    if (p.deadline && p.deadline <= threeDaysFromNow) {
      isAtRisk = true
    }

    if (!isAtRisk && p.statusStage?.estimatedHours && p.stageHistory[0]) {
      const hoursInStage = (now.getTime() - p.stageHistory[0].enteredAt.getTime()) / (1000 * 60 * 60)
      if (hoursInStage > p.statusStage.estimatedHours) {
        isAtRisk = true
      }
    }

    if (isAtRisk) atRiskCount++
  })

  // Average client feedback
  const feedback = await prisma.feedbackResponse.findMany({
    where: { businessId }
  })
  const avgFeedback = feedback.length > 0 
    ? feedback.reduce((sum, f) => sum + f.overallScore, 0) / feedback.length
    : 0

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { defaultCurrency: true }
  })

  return {
    revenueMTD: cashRevenue,
    revenueLastMonth: lastMonthRevenue,
    revenueDelta,
    outstanding: totalOutstanding,
    overdue: totalOverdue,
    utilization,
    atRiskCount,
    avgFeedback,
    currency: business?.defaultCurrency || 'USD'
  }
}

export async function getRevenueTrend(businessId: string) {
  const now = new Date()
  const trend = []

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const { cashRevenue } = await getRevenueSummary(businessId, start, end)
    
    trend.push({
      month: start.toLocaleString('default', { month: 'short' }),
      revenue: cashRevenue / 100 // Convert to dollars for chart
    })
  }

  return trend
}
