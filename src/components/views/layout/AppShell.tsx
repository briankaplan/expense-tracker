'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 overflow-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 