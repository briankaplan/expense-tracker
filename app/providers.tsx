'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TellerProvider } from '@/lib/providers/TellerProvider';
import { ExpensesProvider } from '@/lib/providers/ExpensesProvider';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { createBrowserClient } from '@supabase/ssr';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [supabaseClient] = useState(() => 
        createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <TellerProvider>
                    <ExpensesProvider>
                        {children}
                        <Toaster />
                    </ExpensesProvider>
                </TellerProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
} 