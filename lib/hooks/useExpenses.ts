'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpensesFromTeller, syncExpenseWithTeller } from '@/lib/services/teller';
import { useTeller } from '@/lib/providers/TellerProvider';
import { Expense } from '@/types/expenses';

export function useExpenses(dateRange?: [Date, Date]) {
  const queryClient = useQueryClient();
  const { accessToken, isConnected } = useTeller();

  // Fetch expenses from all accounts
  const { data: accountsWithTransactions = [], isLoading, error } = useQuery({
    queryKey: ['expenses', accessToken, dateRange],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve([]);
      }
      return fetchExpensesFromTeller(accessToken, dateRange);
    },
    enabled: isConnected && !!accessToken
  });

  // Flatten expenses from all accounts
  const expenses = accountsWithTransactions.reduce<Expense[]>((acc, { transactions }) => {
    return [...acc, ...transactions];
  }, []);

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Mutation for updating expense metadata
  const { mutate: updateExpense } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Expense> }) =>
      syncExpenseWithTeller(id, updates),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  // Add new expense (for manual entries)
  const { mutate: addExpense } = useMutation({
    mutationFn: (expense: Omit<Expense, 'id'>) => {
      const id = `manual_${Date.now()}`;
      return syncExpenseWithTeller(id, {
        ...expense,
        id,
        createdAt: new Date().toISOString(),
        status: 'completed',
        type: 'manual'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  return {
    expenses: sortedExpenses,
    isLoading,
    error,
    isConnected,
    updateExpense: (id: string, updates: Partial<Expense>) =>
      updateExpense({ id, updates }),
    addExpense
  };
} 