'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { convertToTestimonial } from '../actions'

export function ConvertTestimonialButton({ responseId, defaultText }: { responseId: string, defaultText: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleConvert = async () => {
    try {
      setIsPending(true)
      await convertToTestimonial(responseId, defaultText)
      alert('Converted to Testimonial successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button onClick={handleConvert} disabled={isPending} variant="outline" size="sm">
      {isPending ? 'Converting...' : 'Convert to Testimonial'}
    </Button>
  )
}
