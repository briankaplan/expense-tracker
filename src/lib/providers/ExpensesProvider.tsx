'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService } from '../services/DatabaseService';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  merchant?: string;
  type?: 'business' | 'personal';
  status?: 'pending' | 'matched';
  receipt_id?: string;
  details?: Record<string, any>;
}

interface ExpensesContextType {
  expenses: Expense[];
  isLoading: boolean;
  refetchExpenses: () => Promise<void>;
  addExpense: {
    mutateAsync: (expense: Omit<Expense, 'id'>) => Promise<void>;
  };
  updateExpense: {
    mutateAsync: (params: { id: string } & Partial<Expense>) => Promise<void>;
  };
  deleteExpense: {
    mutateAsync: (id: string) => Promise<void>;
  };
  getExpenseById: (id: string) => Expense | undefined;
  matchReceipt: (params: { expenseId: string; receiptId: string }) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  isLoading: false,
  refetchExpenses: async () => {},
  addExpense: {
    mutateAsync: async () => {},
  },
  updateExpense: {
    mutateAsync: async () => {},
  },
  deleteExpense: {
    mutateAsync: async () => {},
  },
  getExpenseById: () => undefined,
  matchReceipt: async () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await DatabaseService.getExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = {
    mutateAsync: async (expense: Omit<Expense, 'id'>) => {
      try {
        await DatabaseService.createExpense(expense);
        await fetchExpenses();
      } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
    },
  };

  const updateExpense = {
    mutateAsync: async ({ id, ...updates }: { id: string } & Partial<Expense>) => {
      try {
        await DatabaseService.updateExpense(id, updates);
        await fetchExpenses();
      } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
      }
    },
  };

  const deleteExpense = {
    mutateAsync: async (id: string) => {
      try {
        await DatabaseService.deleteExpense(id);
        await fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
    },
  };

  const getExpenseById = (id: string) => {
    return expenses.find(expense => expense.id === id);
  };

  const matchReceipt = async ({ expenseId, receiptId }: { expenseId: string; receiptId: string }) => {
    try {
      await DatabaseService.updateExpense(expenseId, {
        receipt_id: receiptId,
        status: 'matched',
      });
      await fetchExpenses();
    } catch (error) {
      console.error('Error matching receipt:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        isLoading,
        refetchExpenses: fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenseById,
        matchReceipt,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
} 