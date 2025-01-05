'use client';

import { useState, useEffect } from 'react';
import { useTeller } from '@/lib/providers/TellerProvider';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: {
    name: string;
  };
  type: 'personal' | 'business';
  status: 'pending' | 'posted';
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { tellerClient } = useTeller();

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setIsLoading(true);
        // If we have a Teller client, fetch real transaction data
        if (tellerClient) {
          const transactions = await tellerClient.getTransactions();
          const mappedExpenses = transactions.map(tx => ({
            id: tx.id,
            amount: Math.abs(tx.amount),
            description: tx.description,
            category: tx.category || 'Uncategorized',
            date: tx.date,
            merchant: {
              name: tx.merchant?.name || 'Unknown Merchant'
            },
            type: tx.amount < 0 ? 'personal' : 'business',
            status: tx.status || 'posted'
          }));
          setExpenses(mappedExpenses);
        } else {
          // Otherwise, use mock data
          const mockExpenses: Expense[] = [
            {
              id: '1',
              amount: 42.99,
              description: 'Office Supplies',
              category: 'Business',
              date: new Date().toISOString(),
              merchant: { name: 'Office Depot' },
              type: 'business',
              status: 'posted'
            },
            {
              id: '2',
              amount: 12.50,
              description: 'Coffee',
              category: 'Food & Drink',
              date: new Date().toISOString(),
              merchant: { name: 'Starbucks' },
              type: 'personal',
              status: 'posted'
            }
          ];
          setExpenses(mockExpenses);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch expenses'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenses();
  }, [tellerClient]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const getExpensesByType = (type: 'personal' | 'business') => {
    return expenses.filter(expense => expense.type === type);
  };

  const getTotalExpenses = (type?: 'personal' | 'business') => {
    return expenses
      .filter(expense => !type || expense.type === type)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByType,
    getTotalExpenses
  };
} 