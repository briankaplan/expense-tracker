'use client';

import { type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-muted/40 px-4 py-6 md:block">
            <Sidebar />
            <Link 
              href="/nexus" 
              className="flex items-center px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              🛠️ Nexus Dashboard
            </Link>
          </aside>
          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
} 