'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  Settings,
  CreditCard,
  Brain,
  Shield,
  Repeat
} from 'lucide-react';

const isAdmin = process.env.NEXT_PUBLIC_ADMIN_MODE === 'true';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const links: SidebarLink[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: CreditCard,
  },
  {
    href: '/receipts',
    label: 'Receipts',
    icon: Receipt,
  },
  {
    href: '/subscriptions',
    label: 'Subscriptions',
    icon: Repeat,
  },
  {
    href: '/nexus',
    label: 'Nexus Control',
    icon: Brain,
    adminOnly: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-[240px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col gap-4">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <Shield className="h-6 w-6" />
            <span>Expense Manager</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto">
          <nav className="grid items-start px-4 text-sm font-medium">
            {links.map((link) => {
              // Skip admin-only links for non-admin users
              if (link.adminOnly && !isAdmin) return null;

              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground',
                    isActive && 'bg-muted text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 