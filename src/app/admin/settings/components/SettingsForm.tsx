'use client';

import { useState } from 'react';
import { updateGlobalSettings } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: initialData.paymentMethod || '',
    paymentNumber: initialData.paymentNumber || '',
    qrCodeUrl: initialData.qrCodeUrl || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateGlobalSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Payment Method Label
        </label>
        <Input 
          type="text"
          required
          value={formData.paymentMethod}
          onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
          placeholder="e.g. bKash Personal / Nagad"
          className="w-full"
        />
        <p className="text-xs text-zinc-500 mt-1">This label is shown above the payment number.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Payment Account Number
        </label>
        <Input 
          type="text"
          required
          value={formData.paymentNumber}
          onChange={e => setFormData({ ...formData, paymentNumber: e.target.value })}
          placeholder="017XX-XXXXXX"
          className="w-full font-mono"
        />
        <p className="text-xs text-zinc-500 mt-1">The number users should send money to.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          QR Code Image URL (Optional)
        </label>
        <Input 
          type="url"
          value={formData.qrCodeUrl}
          onChange={e => setFormData({ ...formData, qrCodeUrl: e.target.value })}
          placeholder="https://example.com/my-qr-code.png"
          className="w-full"
        />
        <p className="text-xs text-zinc-500 mt-1">Provide a direct link to an image. If empty, the QR section will be hidden on checkout.</p>
      </div>

      {formData.qrCodeUrl && (
        <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg inline-block">
          <p className="text-xs font-medium text-zinc-500 mb-2">Preview:</p>
          <img src={formData.qrCodeUrl} alt="QR Code Preview" className="w-32 h-32 object-contain" onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5JbnZhbGlkIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }} />
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        {success && <span className="ml-3 text-sm text-green-600 font-medium">Saved successfully!</span>}
      </div>
    </form>
  );
}
