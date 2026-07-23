import { requireAdmin } from '../actions';
import prisma from '@/modules/core/db/prisma';
import { Flag, MessageSquare, ExternalLink, Lightbulb, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { PaginationControls } from '../components/PaginationControls';
import { FeedbackActions } from './components/FeedbackActions';

export const metadata = {
  title: 'Platform Feedback | Admin',
};

export default async function PlatformFeedbackPage(props: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();

  const resolvedParams = await props.searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const statusFilter = resolvedParams?.status;
  const ITEMS_PER_PAGE = 20;

  const whereClause = statusFilter ? { status: statusFilter } : {};

  const [totalItems, feedbacks] = await prisma.$transaction([
    prisma.platformFeedback.count({ where: whereClause }),
    prisma.platformFeedback.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
    })
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea': return <Lightbulb className="w-4 h-4 text-emerald-500" />;
      case 'issue': return <Bug className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 ring-blue-500/10 dark:bg-blue-900/20 dark:text-blue-400';
      case 'REVIEWED': return 'bg-amber-50 text-amber-700 ring-amber-500/10 dark:bg-amber-900/20 dark:text-amber-400';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 ring-emerald-500/10 dark:bg-emerald-900/20 dark:text-emerald-400';
      default: return 'bg-zinc-50 text-zinc-700 ring-zinc-500/10 dark:bg-zinc-900/20 dark:text-zinc-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Flag className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-wide uppercase text-sm">Feedback</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">User Submissions</h1>
          <p className="mt-2 text-zinc-500 max-w-2xl">
            Review and manage ideas, issues, and feedback submitted by users across the platform.
          </p>
        </div>
        
        <div className="flex bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm shrink-0">
          <a href="/hq/feedback" className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${!statusFilter ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>All</a>
          <a href="/hq/feedback?status=NEW" className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'NEW' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>New</a>
          <a href="/hq/feedback?status=REVIEWED" className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === 'REVIEWED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Reviewed</a>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden overflow-x-auto w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 uppercase border-b border-zinc-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium w-1/4">User / Contact</th>
                <th className="px-6 py-4 font-medium w-1/2">Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {fb.email || 'Anonymous'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {format(new Date(fb.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {fb.userId && (
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          User: {fb.userId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(fb.type)}
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize text-xs tracking-wider">
                          {fb.type}
                        </span>
                        {fb.url && (
                          <a href={fb.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-indigo-500 hover:underline">
                            <ExternalLink className="w-3 h-3" /> URL
                          </a>
                        )}
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed text-sm">
                        {fb.message}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${getStatusColor(fb.status)}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <FeedbackActions id={fb.id} currentStatus={fb.status} />
                  </td>
                </tr>
              ))}
              
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No feedback entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        )}
      </div>
    </div>
  );
}
