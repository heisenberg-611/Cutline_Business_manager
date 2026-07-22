import prisma from '@/modules/core/db/prisma';
import { Users, Briefcase, Activity, CreditCard } from 'lucide-react';

export const metadata = {
  title: 'Admin Overview',
};

export default async function AdminOverviewPage() {
  const [totalBusinesses, totalUsers, pendingRequests, approvedRequests] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.subscriptionRequest.count({ where: { status: 'PENDING' } }),
    prisma.subscriptionRequest.count({ where: { status: 'APPROVED' } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Overview</h2>
        <p className="text-sm text-zinc-500">High-level metrics for Cutline OS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Businesses</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalBusinesses}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pendingRequests}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Paid Subscriptions</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{approvedRequests}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
