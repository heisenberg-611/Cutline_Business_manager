'use client'

import dynamic from 'next/dynamic'

export const ProdPTabsWrapper = dynamic(
  () => import('./ProdPTabs').then(mod => mod.ProdPTabs),
  { ssr: false }
)
