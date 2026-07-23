'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Users, CreditCard, Activity, LogOut, ShieldAlert, Settings, Building2, Megaphone, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/hq', label: 'Overview', icon: Home, exact: true },
  { href: '/hq/subscriptions', label: 'Subscriptions', icon: Activity },
  { href: '/hq/finances', label: 'Finances', icon: CreditCard },
  { href: '/hq/messages', label: 'Messages', icon: MessageSquare },
  { href: '/hq/organizations', label: 'Organizations', icon: Building2 },
  { href: '/hq/users', label: 'Users', icon: Users },
  { href: '/hq/broadcasts', label: 'Broadcasts', icon: Megaphone },
  { href: '/hq/audit', label: 'Audit Logs', icon: ShieldCheck },
  { href: '/hq/admins', label: 'Admins', icon: ShieldAlert },
  { href: '/hq/settings', label: 'Platform Settings', icon: Settings },
];

export function AdminSidebar({ 
  adminEmail, 
  logoutAction 
}: { 
  adminEmail: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname() || '';
  const [optimisticPathname, setOptimisticPathname] = useState(pathname);

  // Sync back when actual pathname updates
  useEffect(() => {
    setOptimisticPathname(pathname);
  }, [pathname]);

  return (
    <aside className="w-full md:w-64 bg-background/60 backdrop-blur-xl border-r border-border/50 flex flex-col shadow-2xl z-20">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <img src="/icon.svg" alt="Cutline OS" className="w-8 h-8 mr-3 rounded-md object-cover shadow-sm" />
        <h1 className="font-bold text-foreground tracking-tight">Cutline Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? optimisticPathname === item.href : optimisticPathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOptimisticPathname(item.href)}
              className={`group relative z-0 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="adminNavPill"
                  className="absolute inset-0 bg-primary shadow-sm rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50 space-y-2 bg-background/40">
        <div className="text-xs text-muted-foreground text-center mb-2 truncate font-medium">
          {adminEmail}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Lock Panel
          </button>
        </form>
        <Link href="/dashboard" className="block text-center text-sm text-primary font-medium hover:underline mt-2">
          ← Back to App
        </Link>
      </div>
    </aside>
  );
}
