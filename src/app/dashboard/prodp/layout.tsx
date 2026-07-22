import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/modules/core/db/prisma';
import { canAccessProdP, getActivePlan } from '@/lib/subscription';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default async function ProdPLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/select-business');

  const business = await prisma.business.findUnique({
    where: { id: orgId },
    select: { subscriptionPlan: true, subscriptionPeriodEnd: true }
  });

  if (!business) redirect('/dashboard/select-business');

  if (!canAccessProdP(getActivePlan(business))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Pro Feature</h2>
        <p className="text-zinc-500 max-w-md mb-8">
          The ProdP feature is available on the Pro and Business plans. Upgrade your subscription to unlock it.
        </p>
        <Link 
          href="/dashboard/settings/billing" 
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          View Plans & Upgrade
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
