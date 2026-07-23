'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { updateBusinessCustomLimit } from '../actions';

export function BusinessLimitEditor({ 
  businessId, 
  customLimit 
}: { 
  businessId: string; 
  customLimit: number | null 
}) {
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    const defaultText = customLimit !== null ? String(customLimit) : '';
    const result = window.prompt("Enter a custom project limit for this organization (leave empty to use default plan limits):", defaultText);
    
    if (result === null) return; // User cancelled
    
    const parsed = result.trim() === '' ? null : parseInt(result, 10);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      alert("Please enter a valid positive number");
      return;
    }

    setLoading(true);
    const res = await updateBusinessCustomLimit(businessId, parsed);
    setLoading(false);
    
    if (res?.error) {
      alert(res.error);
    }
  };

  return (
    <button 
      onClick={handleEdit}
      disabled={loading}
      className="ml-2 px-2 py-1 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 border border-zinc-200 dark:border-white/10 rounded-md transition-colors"
      title={customLimit !== null ? `Custom Limit: ${customLimit} projects` : "Set Custom Project Limit"}
    >
      <Settings2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {customLimit !== null ? (
        <span>Limit: {customLimit}</span>
      ) : (
        <span>Set Limit</span>
      )}
    </button>
  );
}
