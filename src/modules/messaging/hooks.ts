'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getConversations, 
  getMessages, 
  getNewMessages,
  sendMessage, 
  markConversationRead 
} from './actions'
import { useMessagingConfig } from './components/QueryProvider'

/**
 * Polls the conversation list every 15 seconds to keep unread counts fresh.
 */
export function useConversations() {
  const { realtimeEnabled } = useMessagingConfig()

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
    refetchInterval: realtimeEnabled ? 15000 : false, // 15 seconds or manual
  })

  return {
    ...query,
    conversations: query.data || [],
  }
}

/**
 * Polls active conversation messages every 5 seconds using delta fetching.
 */
export function useConversationMessages(conversationId: string | null, currentUserId?: string) {
  const queryClient = useQueryClient()
  const { realtimeEnabled } = useMessagingConfig()
  
  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      
      const currentData = queryClient.getQueryData<{messages: any[], nextCursor?: string}>(['messages', conversationId])
      
      // If we have cached messages, only fetch the new ones
      if (currentData && currentData.messages && currentData.messages.length > 0) {
        const realMessages = currentData.messages.filter((m: any) => !m.isOptimistic)
        if (realMessages.length > 0) {
          const latestMessage = realMessages[realMessages.length - 1]
          try {
            const newMessages = await getNewMessages(conversationId, latestMessage.createdAt)
            if (newMessages.length > 0) {
              return {
                messages: [...realMessages, ...newMessages],
                nextCursor: currentData.nextCursor
              }
            }
            return currentData
          } catch (e) {
            // If delta fetch fails, fallback to standard fetch
            return getMessages(conversationId)
          }
        }
      }
      
      // No cache, fetch initial page
      return getMessages(conversationId)
    },
    refetchInterval: realtimeEnabled ? 5000 : false, // 5 seconds or manual
    enabled: !!conversationId
  })

  // Mutation to send a message optimistically or invalidate
  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      if (!conversationId) throw new Error('No active conversation')
      return sendMessage(conversationId, content)
    },
    onMutate: async (content: string) => {
      if (!conversationId) return

      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })
      await queryClient.cancelQueries({ queryKey: ['conversations'] })

      const previousMessages = queryClient.getQueryData<{messages: any[], nextCursor?: string}>(['messages', conversationId])
      const previousConversations = queryClient.getQueryData<any[]>(['conversations'])

      // Optimistically update messages
      if (previousMessages) {
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          conversationId,
          senderId: currentUserId || 'optimistic',
          content,
          createdAt: new Date(),
          sender: null,
          isOptimistic: true
        }
        
        queryClient.setQueryData(['messages', conversationId], {
          ...previousMessages,
          messages: [...previousMessages.messages, optimisticMessage]
        })
      }

      // Optimistically update conversations list (sidebar)
      if (previousConversations) {
        queryClient.setQueryData(['conversations'], previousConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastActivity: new Date(),
              messages: [{
                id: `temp-${Date.now()}`,
                content,
                createdAt: new Date()
              }]
            }
          }
          return conv
        }).sort((a, b) => {
          if (a.type === 'BROADCAST' && b.type !== 'BROADCAST') return -1;
          if (b.type === 'BROADCAST' && a.type !== 'BROADCAST') return 1;
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        }))
      }

      return { previousMessages, previousConversations }
    },
    onError: (err, newContent, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages)
      }
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: () => {
      if (!conversationId) return Promise.resolve(null)
      return markConversationRead(conversationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  return {
    messages: query.data?.messages || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    markAsRead: markReadMutation.mutate
  }
}
