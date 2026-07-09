'use client'

import { useState } from 'react'
import { submitIntakeForm } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CheckCircle2, FileText, Link, Video } from 'lucide-react'

interface IntakeFormProps {
  businessId: string
  businessName: string
}

export function IntakeForm({ businessId, businessName }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectType, setProjectType] = useState('')
  const [scriptText, setScriptText] = useState('')
  const [scriptLink, setScriptLink] = useState('')
  const [rawFootageLink, setRawFootageLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await submitIntakeForm(businessId, {
        clientName,
        clientEmail,
        projectTitle,
        projectType,
        scriptText,
        scriptLink,
        rawFootageLink
      })
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
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Project Submitted</h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Your project request has been sent successfully to <strong>{businessName}</strong>. We will be in touch soon!
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
        <CardHeader className="space-y-1.5 pb-8 pt-10 px-8 border-b border-zinc-100 dark:border-zinc-900">
          <CardDescription className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            {businessName}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight">Start a Project</CardTitle>
          <p className="text-sm text-zinc-500">
            Fill out the details below to kick off your new project.
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8 py-8">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-2">Your Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="clientName" required value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="clientEmail" type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-2">Project Details</h3>
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title <span className="text-red-500">*</span></Label>
                <Input id="projectTitle" required placeholder="e.g. Summer Campaign Video" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Input id="projectType" placeholder="e.g. YouTube Long-form, Reel, Corporate" value={projectType} onChange={e => setProjectType(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-2">Assets & Brief</h3>
              
              <div className="space-y-2">
                <Label htmlFor="scriptText" className="flex items-center gap-2"><FileText className="w-4 h-4"/> Script / Brief / Notes</Label>
                <Textarea 
                  id="scriptText" 
                  placeholder="Paste your script or provide detailed notes here..." 
                  className="min-h-[120px]"
                  value={scriptText} 
                  onChange={e => setScriptText(e.target.value)} 
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="scriptLink" className="flex items-center gap-2"><Link className="w-4 h-4"/> External Script Link</Label>
                <Input id="scriptLink" type="url" placeholder="https://docs.google.com/..." value={scriptLink} onChange={e => setScriptLink(e.target.value)} />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="rawFootageLink" className="flex items-center gap-2"><Video className="w-4 h-4"/> Raw Footage Link</Label>
                <Input id="rawFootageLink" type="url" placeholder="https://drive.google.com/..." value={rawFootageLink} onChange={e => setRawFootageLink(e.target.value)} />
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
              {isSubmitting ? 'Submitting...' : 'Submit Project Request'}
            </Button>

          </CardContent>
        </form>
      </Card>
    </motion.div>
  )
}
