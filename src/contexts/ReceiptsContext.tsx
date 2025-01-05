'use client';

import * as React from 'react';
import { type Receipt } from '@/types/receipts';

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
}

const ReceiptsContext = React.createContext<ReceiptsContextType | undefined>(undefined);

export function ReceiptsProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);

  const addReceipt = React.useCallback((receipt: Omit<Receipt, 'id'>) => {
    setReceipts(prev => [...prev, { ...receipt, id: Math.random().toString(36).slice(2) }]);
  }, []);

  const updateReceipt = React.useCallback((id: string, updates: Partial<Receipt>) => {
    setReceipts(prev =>
      prev.map(receipt =>
        receipt.id === id ? { ...receipt, ...updates } : receipt
      )
    );
  }, []);

  const deleteReceipt = React.useCallback((id: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
  }, []);

  return (
    <ReceiptsContext.Provider
      value={{
        receipts,
        addReceipt,
        updateReceipt,
        deleteReceipt,
      }}
    >
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const context = React.useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
} 