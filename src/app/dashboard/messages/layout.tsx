import { MessagingQueryProvider } from '@/modules/messaging/components/QueryProvider'
import { MessagingSidebar } from '@/modules/messaging/components/MessagingSidebar'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/modules/core/db/prisma'

export const metadata = {
  title: 'Messages',
}

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId || !orgId) return null

  const business = await prisma.business.findUnique({
    where: { id: orgId },
    select: { realtimeMessagesEnabled: true }
  })

  return (
    <MessagingQueryProvider realtimeEnabled={business?.realtimeMessagesEnabled ?? true}>
      <div className="flex h-[calc(100vh-8rem)] bg-background border rounded-xl overflow-hidden shadow-sm">
        <MessagingSidebar currentUserId={userId} isAdmin={orgRole === 'org:admin'} />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </MessagingQueryProvider>
  )
}
