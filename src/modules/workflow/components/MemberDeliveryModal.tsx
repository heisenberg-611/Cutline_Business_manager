'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react'
import { submitMemberDelivery } from '../actions'

interface MemberDeliveryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
}

export function MemberDeliveryModal({
  open,
  onOpenChange,
  projectId,
  projectName
}: MemberDeliveryModalProps) {
  const [driveLink, setDriveLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      await submitMemberDelivery(projectId, driveLink)
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setDriveLink('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit delivery')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If closed manually, reset state
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setSuccess(false)
        setDriveLink('')
        setError(null)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Final Delivery Details</DialogTitle>
          <DialogDescription>
            You have marked <strong>{projectName}</strong> as delivered. 
            Would you like to attach a final Drive folder link for the Admin?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="text-sm font-medium text-green-800">
                Delivery submitted successfully! Admins have been notified.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Drive Folder Link (Optional)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      placeholder="https://drive.google.com/..." 
                      className="pl-9"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Skip
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : 'Submit Delivery'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
