'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { updateFeedbackStatus, deleteFeedback } from '../actions';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function FeedbackActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    const result = await updateFeedbackStatus(id, status);
    if (result.success) {
      toast.success(`Marked as ${status}`);
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    setIsDeleting(true);
    const result = await deleteFeedback(id);
    if (result.success) {
      toast.success('Feedback deleted');
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button disabled={isDeleting || isUpdating} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 disabled:opacity-50 outline-none" />}>
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 py-1 z-50">
        {currentStatus !== 'NEW' && (
          <DropdownMenuItem
            onClick={() => handleUpdateStatus('NEW')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-default"
          >
              <Eye className="w-4 h-4 text-blue-500" />
              Mark as New
            </DropdownMenuItem>
          )}
          
          {currentStatus !== 'REVIEWED' && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus('REVIEWED')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-default"
            >
              <Eye className="w-4 h-4 text-amber-500" />
              Mark as Reviewed
            </DropdownMenuItem>
          )}
          
          {currentStatus !== 'RESOLVED' && (
            <DropdownMenuItem
              onClick={() => handleUpdateStatus('RESOLVED')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 outline-none cursor-default"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Resolved
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 outline-none cursor-default"
          >
            <Trash2 className="w-4 h-4" />
            Delete Feedback
          </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
