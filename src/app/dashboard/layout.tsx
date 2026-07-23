import { AppLayout } from '@/modules/core/ui/AppLayout'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/modules/core/db/prisma'
import { GlobalAlerts } from './components/GlobalAlerts'
import { getActivePlan, canInviteMembers } from '@/lib/subscription'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, orgId } = await auth()
  let initialNavPreferences: { href: string; visible: boolean }[] | undefined = undefined
  let initialQuickActionPreferences: { id: string; visible: boolean }[] | undefined = undefined
  let initialNotificationPreferences: { tone: string; dnd: boolean } | undefined = undefined

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { navPreferences: true, quickActionPreferences: true, notificationPreferences: true }
    })
    
    if (user?.navPreferences) {
      initialNavPreferences = user.navPreferences as { href: string; visible: boolean }[]
    }
    if (user?.quickActionPreferences) {
      initialQuickActionPreferences = user.quickActionPreferences as { id: string; visible: boolean }[]
    }
    if (user?.notificationPreferences) {
      initialNotificationPreferences = user.notificationPreferences as { tone: string; dnd: boolean }
    }
  }

  const [activeAlerts, globalSettings] = await Promise.all([
    prisma.systemAlert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.globalSettings.findUnique({ where: { id: 'default' } })
  ]);

  if (globalSettings?.maintenanceMode) {
    redirect('/maintenance');
  }

  let canInvite = false;
  if (orgId) {
    const business = await prisma.business.findUnique({
      where: { id: orgId },
      select: { subscriptionPlan: true, subscriptionPeriodEnd: true }
    });
    if (business) {
      canInvite = canInviteMembers(getActivePlan(business));
    }
  }

  return (
    <>
      <GlobalAlerts alerts={activeAlerts} />
      <AppLayout 
        initialNavPreferences={initialNavPreferences} 
        initialQuickActionPreferences={initialQuickActionPreferences} 
        initialNotificationPreferences={initialNotificationPreferences}
        canInvite={canInvite}
        globalSettings={{
          termsUrl: globalSettings?.termsUrl,
          privacyUrl: globalSettings?.privacyUrl,
          supportEmail: globalSettings?.supportEmail
        }}
      >
        {children}
      </AppLayout>
    </>
  )
}
