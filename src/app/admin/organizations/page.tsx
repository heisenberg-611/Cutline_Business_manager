import { requireAdmin } from '../actions';
import prisma from '@/modules/core/db/prisma';
import { OrganizationsTable } from './components/OrganizationsTable';
import { Building2 } from 'lucide-react';
import { PaginationControls } from '../components/PaginationControls';

export const metadata = {
  title: 'Organizations | Admin',
};

export default async function OrganizationsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await props.searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const ITEMS_PER_PAGE = 20;

  const [totalBusinesses, businesses] = await prisma.$transaction([
    prisma.business.count(),
    prisma.business.findMany({
      orderBy: { name: 'asc' },
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionPeriodEnd: true,
      }
    })
  ]);

  const totalPages = Math.ceil(totalBusinesses / ITEMS_PER_PAGE);

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
      <div className="bg-white dark:bg-zinc-950 rounded-b-xl border-x border-b border-zinc-200 dark:border-white/10 -mt-1 shadow-sm overflow-hidden">
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalBusinesses}
        />
      </div>
    </div>
  );
}
