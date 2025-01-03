'use client';

import { AppShell } from './AppShell';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}