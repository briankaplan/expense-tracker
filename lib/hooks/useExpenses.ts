'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '@/lib/services/expenses';

export interface Expense {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: 'personal' | 'business';
  status: 'pending' | 'matched' | 'missing';
  comment?: string;
  receiptUrl?: string;
}

export function useExpenses(dateRange?: [Date, Date]) {
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses', dateRange],
    queryFn: () => fetchExpenses(dateRange),
  });

  return {
    expenses,
    isLoading,
    error,
  };
} 