'use client'

import dynamic from 'next/dynamic'

export const PipelineBoardWrapper = dynamic(
  () => import('./PipelineBoard'),
  { ssr: false }
)
