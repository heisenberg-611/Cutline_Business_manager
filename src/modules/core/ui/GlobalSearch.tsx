'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { globalSearch } from '@/modules/core/actions'
import { Folder, User, FileText, Package2 } from 'lucide-react'

type SearchResult = Awaited<ReturnType<typeof globalSearch>>[number]

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(query)
        setResults(res)
      })
    }, 200) // debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <Folder className="mr-2 h-4 w-4 text-zinc-500" />
      case 'Client': return <User className="mr-2 h-4 w-4 text-zinc-500" />
      case 'Invoice': return <FileText className="mr-2 h-4 w-4 text-zinc-500" />
      case 'Asset': return <Package2 className="mr-2 h-4 w-4 text-zinc-500" />
      default: return null
    }
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false} className="rounded-lg border shadow-md">
        <CommandInput 
        placeholder="Search projects, invoices, or clients..." 
        value={query} 
        onValueChange={setQuery} 
      />
      <CommandList>
        <CommandEmpty>{isPending ? 'Searching...' : 'No results found.'}</CommandEmpty>
        
        {Object.entries(groupedResults).map(([type, items]) => (
          <CommandGroup key={type} heading={type}>
            {items.map((item) => (
              <CommandItem
                key={`${item.type}-${item.id}`}
                value={`${item.type}-${item.id}`}
                onSelect={() => handleSelect(item.href)}
              >
                {getIcon(item.type)}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      </Command>
    </CommandDialog>
  )
}
