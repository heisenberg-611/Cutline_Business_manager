'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md mt-1 border border-zinc-100 dark:border-zinc-800">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-zinc-900 dark:text-zinc-100 hover:underline break-all font-mono flex-1"
      >
        {url}
      </a>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-7 w-7 shrink-0 bg-white dark:bg-zinc-950" 
        onClick={handleCopy}
        title="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
      </Button>
    </div>
  )
}
