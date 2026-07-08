import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/modules/core/db/prisma'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const { orgId } = await auth()

  if (!orgId) {
    redirect('/dashboard/select-business')
  }

  // Fetch metrics data
  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({
      where: { businessId: orgId },
      include: { statusStage: true, client: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoice.findMany({
      where: { businessId: orgId }
    })
  ])

  const activeProjectsCount = projects.filter(p => !p.statusStage?.name.toLowerCase().includes('final') && !p.statusStage?.name.toLowerCase().includes('archive')).length
  const overdueInvoicesCount = invoices.filter(i => i.status === 'OVERDUE').length
  const totalOutstanding = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amountDueCents, 0)

  const formatCurrency = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  }

  // Check for at-risk deadlines (due within 3 days or already past due, and not in final stage)
  const now = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  const atRiskProjectsCount = projects.filter(p => {
    if (!p.deadline) return false
    const isFinal = p.statusStage?.name.toLowerCase().includes('final') || p.statusStage?.name.toLowerCase().includes('archive')
    if (isFinal) return false
    
    return p.deadline <= threeDaysFromNow
  }).length

  const recentProjects = projects.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
          Studio Dashboard
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-zinc-500">
          Welcome to your Cutline dashboard. Here is a high-level overview of your studio health.
        </p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500">Active Projects</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{activeProjectsCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500">Total Outstanding</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{formatCurrency(totalOutstanding)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500">Overdue Invoices</div>
          <div className={`mt-2 text-3xl font-bold tracking-tight ${overdueInvoicesCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {overdueInvoicesCount}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500">At-Risk Deadlines</div>
          <div className={`mt-2 text-3xl font-bold tracking-tight ${atRiskProjectsCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {atRiskProjectsCount}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <h3 className="text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            Recent Projects
          </h3>
        </div>
        {recentProjects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No projects yet.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentProjects.map(project => (
              <li key={project.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Link href={`/dashboard/projects/${project.id}`} className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{project.client.displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                      {project.statusStage?.name || 'Unassigned'}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
