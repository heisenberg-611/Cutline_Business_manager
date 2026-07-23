import Link from 'next/link';
import prisma from '@/modules/core/db/prisma';
import { cookies } from 'next/headers';
import { AdminAuthForm } from './components/AdminAuthForm';
import { AdminSidebar } from './components/AdminSidebar';
import { logoutAdmin } from './actions';
import { ShieldAlert } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth Flow: Check for admin_session cookie
  const cookieStore = await cookies();
  const adminEmail = cookieStore.get('admin_session')?.value;

  // If no session cookie, or if the user doesn't exist in the DB, show the login screen
  let isAuthenticated = false;

  if (adminEmail) {
    const globalAdmin = await prisma.globalAdmin.findUnique({
      where: { email: adminEmail },
    });
    if (globalAdmin && globalAdmin.passwordHash) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Authentication</h2>
          <p className="text-zinc-500 mb-6 text-sm">
            Please enter your admin email and master password to continue.
          </p>
          <AdminAuthForm />
        </div>
      </div>
    );
  }

  // Render the Admin Panel
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 flex flex-row text-foreground">
      {/* Sidebar */}
      <AdminSidebar adminEmail={adminEmail!} logoutAction={logoutAdmin} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
