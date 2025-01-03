'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserNav } from './UserNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-4">
          <Link href="/" className="font-semibold">
            Expense Manager
          </Link>
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
} 