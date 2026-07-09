'use client'

import { useState } from 'react'
import { submitFeedbackResponse } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Check, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackFormProps {
  token: string
  projectName: string
  businessName: string
}

const ScoreSelector = ({ 
  value, 
  onChange, 
  label, 
  description,
}: { 
  value: number, 
  onChange: (v: number) => void, 
  label: string, 
  description?: string,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
         <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</Label>
         {description && <span className="text-xs font-mono text-zinc-500 uppercase">{description}</span>}
      </div>
      <div className="flex gap-1">
         {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = value >= num
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={cn(
                  "flex-1 py-2 sm:py-2.5 rounded text-sm font-medium transition-colors border",
                  isSelected 
                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900" 
                    : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                )}
              >
                {num}
              </button>
            )
         })}
      </div>
      <div className="flex justify-between text-xs text-zinc-400 font-medium px-1">
        <span>Needs Work</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}

export function FeedbackForm({ token, projectName, businessName }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [overallScore, setOverallScore] = useState<number>(10)
  const [dimensions, setDimensions] = useState({
    communication: 10,
    turnaround: 10,
    quality: 10,
    value: 10
  })
  const [commentText, setCommentText] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [consentToPublish, setConsentToPublish] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await submitFeedbackResponse(token, {
        overallScore,
        dimensionScores: dimensions,
        commentText: commentText.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        consentToPublish
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
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Feedback Submitted</h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Thank you for sharing your experience working on <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{projectName}</strong>.
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
          <CardTitle className="text-2xl font-semibold tracking-tight">Project Feedback</CardTitle>
          <p className="text-sm text-zinc-500">
            Tell us about your experience with <strong>{projectName}</strong>.
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-10 px-8 py-8">
            
            {/* Overall Score */}
            <div className="space-y-4">
              <ScoreSelector 
                label="Overall Satisfaction" 
                value={overallScore} 
                onChange={setOverallScore} 
                description={`${overallScore}/10`}
              />
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 w-full" />

            {/* Dimension Scores */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Detailed Ratings</h3>
                <span className="text-xs text-zinc-500">Optional</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                <ScoreSelector label="Communication" value={dimensions.communication} onChange={(v) => setDimensions(prev => ({...prev, communication: v}))} />
                <ScoreSelector label="Turnaround Time" value={dimensions.turnaround} onChange={(v) => setDimensions(prev => ({...prev, turnaround: v}))} />
                <ScoreSelector label="Asset Quality" value={dimensions.quality} onChange={(v) => setDimensions(prev => ({...prev, quality: v}))} />
                <ScoreSelector label="Value for Money" value={dimensions.value} onChange={(v) => setDimensions(prev => ({...prev, value: v}))} />
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 w-full" />

            {/* Comments & Video */}
            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="commentText" className="text-sm font-medium">
                  Additional Comments
                </Label>
                <Textarea 
                  id="commentText"
                  placeholder="What went well? What could be improved?" 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="min-h-[120px] resize-y bg-zinc-50/50 dark:bg-zinc-900/50 focus-visible:ring-zinc-500 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="videoUrl" className="text-sm font-medium">Video Testimonial Link</Label>
                  <span className="text-xs text-zinc-500">Optional</span>
                </div>
                <p className="text-xs text-zinc-500 -mt-1">Provide a link to a recorded review (Loom, YouTube, Drive).</p>
                <Input 
                  id="videoUrl"
                  type="url" 
                  placeholder="https://..." 
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="bg-zinc-50/50 dark:bg-zinc-900/50 focus-visible:ring-zinc-500 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start sm:items-center justify-between gap-4 py-4 px-1">
              <div className="space-y-1">
                <Label htmlFor="consentToPublish" className="text-sm font-medium cursor-pointer">
                  Publicly feature this feedback?
                </Label>
                <p className="text-xs text-zinc-500">
                  Allow us to use your feedback as a testimonial.
                </p>
              </div>
              <Switch 
                id="consentToPublish"
                checked={consentToPublish}
                onCheckedChange={setConsentToPublish}
                className="data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-100"
              />
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
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>

          </CardContent>
        </form>
      </Card>
    </motion.div>
  )
}
