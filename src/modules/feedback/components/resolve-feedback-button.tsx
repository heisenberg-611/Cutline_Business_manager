'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { resolveFeedbackAction } from '../actions'

export function ResolveFeedbackButton({ requestId }: { requestId: string }) {
  const [isResolving, setIsResolving] = useState(false)

  const handleResolve = async () => {
    setIsResolving(true)
    try {
      await resolveFeedbackAction(requestId)
    } catch (err) {
      console.error(err)
      alert('Failed to resolve feedback')
      setIsResolving(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/30"
      onClick={handleResolve}
      disabled={isResolving}
      title="Mark as resolved"
    >
      <Check className="h-4 w-4" />
    </Button>
  )
}
