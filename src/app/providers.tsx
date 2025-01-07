'use client';

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { TellerProvider } from "@/components/providers/TellerProvider";
import { ExpensesProvider } from "@/lib/providers/ExpensesProvider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryProvider>
          <TellerProvider>
            <ExpensesProvider>
              {children}
            </ExpensesProvider>
          </TellerProvider>
        </QueryProvider>
      </SupabaseProvider>
      <Toaster />
    </ThemeProvider>
  );
} 