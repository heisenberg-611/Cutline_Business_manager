'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteFeedbackResponse } from '@/modules/feedback/actions'
import { Trash2 } from 'lucide-react'

export function DeleteFeedbackButton({ responseId }: { responseId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feedback response?')) return
    
    setIsDeleting(true)
    try {
      await deleteFeedbackResponse(responseId)
    } catch (err) {
      console.error(err)
      alert('Failed to delete response')
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
