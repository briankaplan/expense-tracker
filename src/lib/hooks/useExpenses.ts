'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';
import type { Expense } from '@/types';

export function useExpenses() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Expense> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('expenses')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
    },
  });

  const getExpenseById = useCallback((id: string) => {
    return expenses.find(expense => expense.id === id);
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
  };
} 