'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, createContext, useContext } from 'react'

export const MessagingConfigContext = createContext<{ realtimeEnabled: boolean }>({ realtimeEnabled: true })

export function useMessagingConfig() {
  return useContext(MessagingConfigContext)
}

export function MessagingQueryProvider({ children, realtimeEnabled }: { children: React.ReactNode, realtimeEnabled: boolean }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      }
    }
  }))

  return (
    <MessagingConfigContext.Provider value={{ realtimeEnabled }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MessagingConfigContext.Provider>
  )
}

