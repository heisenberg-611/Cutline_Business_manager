import React from 'react'
import { TrendingUp, AlertTriangle, Calendar, Activity, Star, Clock } from 'lucide-react'

interface Props {
  variant?: 'main' | 'finance'
  data: {
    revenueMTD: number
    revenueLastMonth: number
    revenueDelta: number
    outstanding: number
    overdue: number
    utilization: number
    atRiskCount: number
    avgFeedback: number
    dso?: number
    currency?: string
  }
}

export function StudioHealthFinanceStrip({ data, variant = 'main' }: Props) {
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  return (
    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-white/10 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      
      {/* Revenue MTD (Always shown, or shown differently?) */}
      {/* Both main and finance show revenue */}
      <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
          <TrendingUp className="w-4 h-4" />
          <h3 className="text-xs font-medium uppercase tracking-wider">Revenue (MTD)</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-mono text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(data.revenueMTD)}
          </p>
          {data.revenueLastMonth > 0 && (
            <span className={`text-xs font-medium ${data.revenueDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {data.revenueDelta >= 0 ? '+' : ''}{data.revenueDelta.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Finance variant: Outstanding */}
      {variant === 'finance' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Outstanding</h3>
          </div>
          <p className="text-3xl font-mono text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(data.outstanding)}
          </p>
        </div>
      )}

      {/* Main variant: Utilization */}
      {variant === 'main' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <Activity className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Utilization</h3>
          </div>
          <p className="text-3xl font-mono text-zinc-900 dark:text-white tracking-tight">
            {data.utilization.toFixed(1)}%
          </p>
        </div>
      )}

      {/* Main variant: At-Risk Deadlines */}
      {variant === 'main' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <Calendar className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">At-Risk Deadlines</h3>
          </div>
          <p className={`text-3xl font-mono tracking-tight ${data.atRiskCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-900 dark:text-white'}`}>
            {data.atRiskCount}
          </p>
        </div>
      )}

      {/* Overdue (Finance variant only, per latest request) */}
      {variant === 'finance' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-red-500/80 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Overdue Invoices</h3>
          </div>
          <p className={`text-3xl font-mono tracking-tight ${data.overdue > 0 ? 'text-red-600 dark:text-red-500' : 'text-zinc-900 dark:text-white'}`}>
            {formatMoney(data.overdue)}
          </p>
        </div>
      )}

      {/* Main variant: Avg Feedback */}
      {variant === 'main' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <Star className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">Avg Feedback</h3>
          </div>
          <p className="text-3xl font-mono text-zinc-900 dark:text-white tracking-tight flex items-center gap-1">
            {data.avgFeedback > 0 ? data.avgFeedback.toFixed(1) : 'N/A'}
          </p>
        </div>
      )}

      {/* Finance variant: DSO */}
      {variant === 'finance' && (
        <div className="flex-1 p-5 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-medium uppercase tracking-wider">DSO</h3>
          </div>
          <p className="text-3xl font-mono text-zinc-900 dark:text-white tracking-tight flex items-center gap-1">
            {data.dso !== undefined ? data.dso.toFixed(0) : '0'} <span className="text-sm font-medium text-zinc-500">days</span>
          </p>
        </div>
      )}

    </div>
  )
}
