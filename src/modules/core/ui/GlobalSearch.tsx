'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { globalSearch } from '@/modules/core/actions'
import { FileText, Folder, Loader2, Package2, ReceiptText, User } from 'lucide-react'

type SearchResult = Awaited<ReturnType<typeof globalSearch>>[number]

const SEARCH_GROUPS = [
  { type: 'Project', label: 'Projects' },
  { type: 'Client', label: 'Clients' },
  { type: 'Invoice', label: 'Invoices' },
  { type: 'Expense', label: 'Expenses' },
  { type: 'Asset', label: 'Assets' },
] as const

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()
  const requestId = useRef(0)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setError(false)
      return
    }

    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      setResults([])
      setError(false)
      return
    }

    const currentRequestId = ++requestId.current
    setError(false)

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await globalSearch(normalizedQuery)
          if (currentRequestId === requestId.current) setResults(res)
        } catch {
          if (currentRequestId === requestId.current) {
            setResults([])
            setError(true)
          }
        }
      })
    }, 250)

    return () => clearTimeout(timer)
  }, [open, query])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'Client': return <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      case 'Invoice': return <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'Expense': return <ReceiptText className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'Asset': return <Package2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      default: return null
    }
  }

  const groupedResults = SEARCH_GROUPS.map(group => ({
    ...group,
    items: results.filter(result => result.type === group.type)
  })).filter(group => group.items.length > 0)

  const emptyMessage = error
    ? 'Search is temporarily unavailable.'
    : isPending
      ? 'Searching…'
      : query.trim().length < 2
        ? 'Type at least 2 characters to search.'
        : 'No matching records found.'

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Search projects, clients, invoices, expenses, or assets..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <span className="inline-flex items-center gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {emptyMessage}
            </span>
          </CommandEmpty>
        
          {groupedResults.map(({ type, label, items }) => (
          <CommandGroup key={type} heading={`${label} (${items.length})`}>
            {items.map(item => (
              <CommandItem
                key={`${item.type}-${item.id}`}
                value={`${item.type}-${item.id}`}
                onSelect={() => handleSelect(item.href)}
              >
                {getIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{item.title}</div>
                  {item.subtitle && <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>}
                </div>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>↑↓ to navigate</span>
          <span>↵ to open · Esc to close</span>
        </div>
      </Command>
    </CommandDialog>
  )
}
