'use client';

import { useState } from 'react';
import { loginAdmin } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdminAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await loginAdmin(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email Address
        </label>
        <Input 
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@cutlineos.com"
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Master Password
        </label>
        <Input 
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full"
        />
        <p className="text-xs text-zinc-500 mt-1">
          If this is your first time logging in, the password you enter here will become your master password.
        </p>
      </div>
      
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      
      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
        {loading ? 'Processing...' : 'Unlock Panel'}
      </Button>
    </form>
  );
}
