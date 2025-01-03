import { type ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/views/layout/AppShell';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { TellerProvider } from '@/lib/providers/TellerProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Expense Manager',
    template: '%s | Expense Manager'
  },
  description: 'Smart expense management with receipt matching'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TellerProvider>
          <AppShell>{children}</AppShell>
        </TellerProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 