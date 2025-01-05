import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/calendar.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/Providers';
import { Sidebar } from '@/components/views/layout/Sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Expense Manager',
  description: 'Track and manage your expenses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="relative min-h-screen">
              <Sidebar />
              <div className="md:pl-[240px]">
                <div className="absolute right-4 top-4 z-40">
                  <ThemeToggle />
                </div>
                <main className="flex-1 overflow-y-auto px-4 py-12 md:px-6 md:py-8">
                  {children}
                </main>
              </div>
            </div>
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
} 