'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Mail, Loader2, Check } from 'lucide-react'
import { createFeedbackRequest, sendFeedbackEmailAction } from '@/modules/feedback/actions'

interface FeedbackPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  clientId: string
  clientHasEmail: boolean
  projectName: string
}

export function FeedbackPromptModal({
  open,
  onOpenChange,
  projectId,
  clientId,
  clientHasEmail,
  projectName
}: FeedbackPromptModalProps) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [driveLink, setDriveLink] = useState('')

  // Generate the token as soon as the modal opens
  useEffect(() => {
    if (open && projectId && clientId && !token) {
      const init = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const req = await createFeedbackRequest(projectId, clientId)
          setToken(req.token)
        } catch (err: any) {
          setError(err.message || 'Failed to generate link')
        } finally {
          setIsLoading(false)
        }
      }
      init()
    }
  }, [open, projectId, clientId, token])

  // Reset state when closed
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setEmailSent(false)
        setDriveLink('')
        setError(null)
      }, 300)
    }
  }

  const feedbackLink = token 
    ? `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/feedback/${token}` 
    : ''

  const handleCopy = async () => {
    if (feedbackLink) {
      await navigator.clipboard.writeText(feedbackLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendEmail = async () => {
    if (!token) return
    setIsSending(true)
    setError(null)
    try {
      await sendFeedbackEmailAction(projectId, token, driveLink)
      setEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Client Feedback</DialogTitle>
          <DialogDescription>
            You just delivered <strong>{projectName}</strong>! Would you like to request feedback from the client?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback Link</label>
                <div className="flex gap-2">
                  <Input readOnly value={feedbackLink} className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!emailSent && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium">Final Drive Folder Link (Optional)</label>
                  <Input 
                    placeholder="https://drive.google.com/..." 
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    disabled={isSending || !clientHasEmail}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, this link will be embedded into the email so the client can access their final assets.
                  </p>
                </div>
              )}

              {emailSent ? (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" /> Email sent successfully!
                </div>
              ) : (
                <Button 
                  className="w-full mt-2" 
                  onClick={handleSendEmail} 
                  disabled={!clientHasEmail || isSending}
                >
                  {isSending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="h-4 w-4 mr-2" /> Send via Email</>
                  )}
                </Button>
              )}

              {!clientHasEmail && !emailSent && (
                <p className="text-xs text-muted-foreground text-center">
                  Client has no email address on file. Please copy the feedback link manually.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
