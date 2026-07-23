import prisma from '@/modules/core/db/prisma';
import { addAdmin, removeAdmin, requireAdmin } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Manage Admins',
};

export default async function ManageAdminsPage() {
  await requireAdmin();
  const admins = await prisma.globalAdmin.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Global Admins</h2>
        <p className="text-sm text-zinc-500">Manage who has access to this global admin panel.</p>
      </div>

      {/* Add Admin Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-xl">
        <h3 className="text-lg font-semibold mb-4">Invite New Admin</h3>
        <form action={async (formData) => {
          'use server';
          const email = formData.get('email') as string;
          if (email) await addAdmin(email);
        }} className="flex gap-4">
          <Input 
            name="email"
            type="email"
            required
            placeholder="admin@example.com"
            className="flex-1"
          />
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Add Admin
          </Button>
        </form>
        <p className="text-xs text-zinc-500 mt-3">
          When the user logs in and visits /admin for the first time, they will be prompted to set their master password.
        </p>
      </div>

      {/* Admin List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden overflow-x-auto w-full max-w-3xl">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  {admin.passwordHash ? (
                    <span className="text-green-600 font-medium">Active (Password Set)</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending Setup</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={async () => {
                    'use server';
                    await removeAdmin(admin.email);
                  }}>
                    <button type="submit" className="p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
