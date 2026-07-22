import { requireAdmin } from '../actions';
import prisma from '@/modules/core/db/prisma';
import { OrganizationsTable } from './components/OrganizationsTable';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Organizations | Admin',
};

export default async function OrganizationsPage() {
  await requireAdmin();

  const businesses = await prisma.business.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      subscriptionPlan: true,
      subscriptionPeriodEnd: true,
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-wide uppercase text-sm">Directory</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Organizations</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          Absolute authority management over all organizations on the platform. You can force-upgrade plans, manually set expiration dates, or revoke access instantly.
        </p>
      </div>

      <OrganizationsTable businesses={businesses} />
    </div>
  );
}
