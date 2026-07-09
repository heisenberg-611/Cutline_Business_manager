'use client'

import { useState } from 'react'
import { submitReviewNotes } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle2, MessageSquare, ExternalLink, Link as LinkIcon } from 'lucide-react'

interface ReviewFormProps {
  token: string
  projectName: string
  businessName: string
  draftLink: string | null
}

export function ReviewForm({ token, projectName, businessName, draftLink }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [notes, setNotes] = useState('')
  const [links, setLinks] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await submitReviewNotes(token, notes, links)
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto w-full"
      >
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="pt-16 pb-16 text-center space-y-6">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Review Sent</h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your notes have been sent to <strong>{businessName}</strong>. They will notify you once updates are made!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1.5 pb-8 pt-10 px-8 border-b border-zinc-100 dark:border-zinc-900 text-center">
          <CardDescription className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            {businessName}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight">Review: {projectName}</CardTitle>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Please review the latest draft and provide your feedback or any additional assets below.
          </p>
          
          {draftLink && (
            <div className="pt-4">
              <a 
                href={draftLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium transition-colors"
              >
                View Latest Draft <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8 py-8">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Fixes & Feedback</Label>
                <Textarea 
                  id="notes" 
                  placeholder="What needs to be changed? Please be as specific as possible (include timestamps if applicable)..." 
                  className="min-h-[160px]"
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="links" className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Additional Links</Label>
                <p className="text-xs text-zinc-500 -mt-1">Provide any links to new scripts, assets, or reference videos.</p>
                <Input 
                  id="links" 
                  placeholder="https://..." 
                  value={links} 
                  onChange={e => setLinks(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded text-sm border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Revisions'}
            </Button>

          </CardContent>
        </form>
      </Card>
    </motion.div>
  )
}
