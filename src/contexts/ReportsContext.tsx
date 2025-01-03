'use client';

import { createContext, useContext, useState } from 'react';
import type { Report, ReportFilters, ReportSort, ReceiptMatch } from '@/types/reports';

interface ReportsContextType {
  reports: Report[];
  activeReport?: Report;
  filters: ReportFilters;
  sort: ReportSort;
  suggestedMatches: ReceiptMatch[];
  setFilters: (filters: ReportFilters) => void;
  setSort: (sort: ReportSort) => void;
  closeReport: (id: string) => Promise<void>;
  reopenReport: (id: string) => Promise<void>;
  matchReceipt: (expenseId: string, receiptId: string) => Promise<void>;
  unmatchReceipt: (expenseId: string) => Promise<void>;
  updateComment: (expenseId: string, comment: string) => Promise<void>;
  batchUploadReceipts: (files: File[]) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  // ... implementation
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
} 