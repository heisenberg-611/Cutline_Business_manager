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
      className="ml-2 p-1 inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
      title={customLimit !== null ? `Custom Limit: ${customLimit} projects` : "Set Custom Project Limit"}
    >
      <Settings2 className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      {customLimit !== null && (
        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
          Limit: {customLimit}
        </span>
      )}
    </button>
  );
}
