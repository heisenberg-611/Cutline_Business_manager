import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInvoices } from '@/modules/financials/actions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export default async function FinancialsPage() {
  const { orgId } = await auth()
  
  if (!orgId) {
    redirect('/dashboard/select-business')
  }

  const invoices = await getInvoices(orgId)

  // Format currency
  const formatCurrency = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h3 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            Financials
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Track invoices, payments, and studio profitability.
          </p>
        </div>
        <Link href="/dashboard/financials/new">
          <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Basic Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0))}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Total Paid (All Time)</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0))}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-sm font-medium text-zinc-500 mb-1">Draft Invoices</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {invoices.filter(i => i.status === 'DRAFT').length}
          </div>
        </div>
      </div>
      
      {/* Invoices Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            <p>No invoices found. Click "New Invoice" to create your first one!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    <span className="opacity-50">#</span>{invoice.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore */}
                    {invoice.client?.displayName || '-'}
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore */}
                    {invoice.project?.title || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
