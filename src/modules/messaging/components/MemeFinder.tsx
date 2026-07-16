'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'

// You need to set this in your .env.local file: NEXT_PUBLIC_GIPHY_API_KEY
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY

interface MemeFinderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function MemeFinder({ open, onOpenChange, onSelect }: MemeFinderProps) {
  const [query, setQuery] = useState('')
  const [memes, setMemes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMemes = async (searchQuery: string) => {
    if (!GIPHY_API_KEY) {
      setError('Giphy API key is missing. Please add NEXT_PUBLIC_GIPHY_API_KEY to your environment variables.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const endpoint = searchQuery.trim() 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20&rating=pg-13`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=pg-13`
      
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to fetch memes')
      
      const data = await res.json()
      setMemes(data.data || [])
    } catch (err: any) {
      console.error(err)
      setError('Failed to load memes. ' + (err.message || ''))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Fetch trending memes when opened if query is empty
      if (memes.length === 0) {
        fetchMemes(query)
      }
    }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchMemes(query)
      }
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Meme Finder</DialogTitle>
          <DialogDescription>
            Search and share memes from Giphy
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search for memes..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 rounded-md border border-zinc-200 dark:border-white/10 p-2 bg-zinc-50 dark:bg-zinc-950/50">
          {error ? (
            <div className="h-full flex items-center justify-center text-sm text-red-500 text-center p-4">
              {error}
            </div>
          ) : isLoading && memes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : memes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {memes.map((meme) => (
                <button
                  key={meme.id}
                  onClick={() => {
                    onSelect(meme.images.original?.mp4 || meme.images.downsized_small?.mp4 || meme.images.fixed_height?.mp4 || meme.images.original?.url)
                    onOpenChange(false)
                  }}
                  className="relative group rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-square focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={meme.images.fixed_height?.webp || meme.images.fixed_height?.url} 
                    alt={meme.title || 'Meme'} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">
              No memes found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
