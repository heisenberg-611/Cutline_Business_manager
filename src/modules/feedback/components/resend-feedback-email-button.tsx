'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sendFeedbackEmailAction } from '@/modules/feedback/actions'
import { Mail } from 'lucide-react'

export function ResendFeedbackEmailButton({ projectId, token }: { projectId: string, token: string }) {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      await sendFeedbackEmailAction(projectId, token)
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSend}
      disabled={isSending || sent}
    >
      <Mail className="w-4 h-4 mr-2" />
      {isSending ? 'Sending...' : sent ? 'Sent!' : 'Resend Email'}
    </Button>
  )
}
