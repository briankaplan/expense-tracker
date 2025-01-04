'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Receipt,
  Upload,
  CreditCard,
  Settings,
  Home,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[200px] flex-col bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
        <span className="font-semibold">Expense Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 