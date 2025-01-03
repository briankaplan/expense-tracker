import { type ReactNode } from 'react';
import { AppShell } from '@/components/views/layout/AppShell';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Expense Manager',
  description: 'Track and manage your expenses',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
} 