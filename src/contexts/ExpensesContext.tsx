'use client';

import * as React from 'react';
import { type Expense } from '@/types/expenses';

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

const ExpensesContext = React.createContext<ExpensesContextType | undefined>(undefined);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  const addExpense = React.useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Math.random().toString(36).slice(2) }]);
  }, []);

  const updateExpense = React.useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  }, []);

  const deleteExpense = React.useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = React.useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within a ExpensesProvider');
  }
  return context;
} 