"use client";

import Link from 'next/link';
import { LayoutDashboard, FolderKanban, Users, FileText, Settings, LogOut, Receipt } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { signOut } from 'next-auth/react';

interface SidebarProps {
  role?: 'worker' | 'admin';
}

export function Sidebar({ role = 'worker' }: SidebarProps) {
  const pathname = usePathname();

  const workerLinks = [
    { href: '/worker/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/worker/projects', label: 'Projects', icon: FolderKanban },
    { href: '/worker/finance', label: 'Invoices', icon: Receipt },
    { href: '/worker/performance', label: 'Performance', icon: FileText },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Manage Projects', icon: FolderKanban },
    { href: '/admin/workers', label: 'Workers', icon: Users },
    { href: '/admin/finance', label: 'Finance & Approval', icon: Receipt },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
  ];

  const inferredRole = pathname?.startsWith('/admin') ? 'admin' : role;
  const links = inferredRole === 'admin' ? adminLinks : workerLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 dark:bg-slate-950 text-white border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-emerald-400">AgencyApp</h1>
      </div>
      <ScrollArea className="flex-1 py-6 px-3">
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-800/50",
                    isActive ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
