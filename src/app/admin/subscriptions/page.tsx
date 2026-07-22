import prisma from '@/modules/core/db/prisma';
import { approveRequest, rejectRequest } from './actions';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export const metadata = {
  title: 'Subscriptions Admin',
};

export default async function AdminSubscriptionsPage() {
  const requests = await prisma.subscriptionRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { business: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Subscription Requests</h2>
        <p className="text-sm text-zinc-500">Approve or reject manual payments submitted by users.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Trx ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {req.business.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 capitalize">
                  {req.planRequested.toLowerCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  {req.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-900 dark:text-zinc-100">
                  {req.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={req.status === 'PENDING' ? 'outline' : req.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {req.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {req.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <form action={async () => {
                        'use server';
                        await approveRequest(req.id, req.businessId, req.planRequested);
                      }}>
                        <button type="submit" className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="w-5 h-5" />
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await rejectRequest(req.id);
                      }}>
                        <button type="submit" className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                          <X className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
