'use client';

import * as React from 'react';
import { ExpensesProvider } from '@/contexts/ExpensesContext';
import { ReceiptsProvider } from '@/contexts/ReceiptsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ExpensesProvider>
      <ReceiptsProvider>
        {children}
      </ReceiptsProvider>
    </ExpensesProvider>
  );
} 