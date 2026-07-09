'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleTestimonialPublishStatus } from '../actions'

export function TogglePublishButton({ testimonialId, isPublished }: { testimonialId: string, isPublished: boolean }) {
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    try {
      setIsPending(true)
      await toggleTestimonialPublishStatus(testimonialId, !isPublished)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button onClick={handleToggle} disabled={isPending} variant={isPublished ? 'outline' : 'default'} size="sm">
      {isPending ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}
    </Button>
  )
}
