import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/modules/core/db/prisma';
import { PLANS } from '@/lib/subscription';

export default async function ClaimTrialPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-up?redirect_url=/claim-trial');
  }

  if (!orgId) {
    redirect('/dashboard/select-business?redirect_url=/claim-trial');
  }

  const [business, user, settings] = await Promise.all([
    prisma.business.findUnique({ where: { id: orgId } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.globalSettings.findUnique({ where: { id: 'default' } })
  ]);

  if (!user || user.hasUsedFreeTrial) {
    redirect('/dashboard?error=trial_already_used');
  }

  // Only grant if they are currently on FREE and haven't active plan
  if (business && business.subscriptionPlan === PLANS.FREE) {
    const trialDays = settings?.defaultTrialDays || 30;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Transaction to update both business plan and user's trial flag
    await prisma.$transaction([
      prisma.business.update({
        where: { id: orgId },
        data: {
          subscriptionPlan: PLANS.PRO,
          subscriptionPeriodEnd: trialEndDate
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { hasUsedFreeTrial: true }
      })
    ]);
  }

  // Add a query param to show a success toast on dashboard (if implemented)
  redirect('/dashboard?trial_activated=true');
}
