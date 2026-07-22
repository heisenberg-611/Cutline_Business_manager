'use client';

import { useState } from 'react';
import { updateGlobalSettings } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

type PaymentMethod = {
  id: string;
  name: string;
  accountNumber: string;
  qrCodeUrl: string;
};

export function SettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Safely parse initial JSON
  let defaultMethods: PaymentMethod[] = [];
  try {
    if (Array.isArray(initialData.paymentMethods)) {
      defaultMethods = initialData.paymentMethods;
    }
  } catch (e) {
    //
  }

  const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods);

  const handleAddMethod = () => {
    setMethods([
      ...methods, 
      { id: Date.now().toString(), name: '', accountNumber: '', qrCodeUrl: '' }
    ]);
  };

  const handleRemoveMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  const handleChange = (id: string, field: keyof PaymentMethod, value: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateGlobalSettings({ paymentMethods: methods });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <div className="space-y-4">
        {methods.map((method, index) => (
          <div key={method.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl relative bg-zinc-50 dark:bg-zinc-950/50">
            <button 
              type="button" 
              onClick={() => handleRemoveMethod(method.id)}
              className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <h4 className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">Payment Method {index + 1}</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Method Name (e.g. bKash, Nagad)</label>
                <Input 
                  required
                  value={method.name}
                  onChange={e => handleChange(method.id, 'name', e.target.value)}
                  placeholder="e.g. bKash Personal"
                  className="bg-white dark:bg-zinc-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Account Number</label>
                <Input 
                  required
                  value={method.accountNumber}
                  onChange={e => handleChange(method.id, 'accountNumber', e.target.value)}
                  placeholder="017XX-XXXXXX"
                  className="font-mono bg-white dark:bg-zinc-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">QR Code Image URL (Optional)</label>
                <Input 
                  type="url"
                  value={method.qrCodeUrl}
                  onChange={e => handleChange(method.id, 'qrCodeUrl', e.target.value)}
                  placeholder="https://..."
                  className="bg-white dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        ))}
        
        {methods.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-sm text-zinc-500">No payment methods configured.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={handleAddMethod}
          className="border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Method
        </Button>
        
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        
        {success && <span className="text-sm text-green-600 font-medium">Saved successfully!</span>}
      </div>
    </form>
  );
}
