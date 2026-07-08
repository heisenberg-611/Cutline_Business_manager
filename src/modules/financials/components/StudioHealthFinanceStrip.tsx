import React from 'react'

interface Props {
  data: {
    revenueMTD: number
    outstanding: number
    overdue: number
    dso: number
  }
}

const formatMoney = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function StudioHealthFinanceStrip({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Revenue (MTD)</h3>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">{formatMoney(data.revenueMTD)}</p>
      </div>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Outstanding Invoices</h3>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">{formatMoney(data.outstanding)}</p>
      </div>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Overdue</h3>
        <p className="text-2xl font-semibold text-red-600 dark:text-red-500 mt-1">{formatMoney(data.overdue)}</p>
      </div>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Days Sales Outstanding</h3>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">{data.dso || 'N/A'}</p>
      </div>
    </div>
  )
}
