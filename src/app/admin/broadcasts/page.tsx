import { requireAdmin } from '../actions';
import prisma from '@/modules/core/db/prisma';
import { Megaphone } from 'lucide-react';
import { BroadcastClient } from './components/BroadcastClient';
import { PaginationControls } from '../components/PaginationControls';

export const metadata = {
  title: 'Global Broadcasts | Admin',
};

export default async function BroadcastsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await props.searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const ITEMS_PER_PAGE = 20;

  const [totalAlerts, alerts] = await prisma.$transaction([
    prisma.systemAlert.count(),
    prisma.systemAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
    })
  ]);

  const totalPages = Math.ceil(totalAlerts / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-wide uppercase text-sm">System</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Global Broadcasts</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          Create and manage system-wide alerts that appear at the top of the dashboard for all users.
        </p>
      </div>

      <BroadcastClient alerts={alerts} />
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden">
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalAlerts}
        />
      </div>
    </div>
  );
}
