'use client';

import { ExpenseManagerView } from '@/components/views/expenses/ExpenseManagerView';
import { useExpenses } from '@/lib/hooks/useExpenses';

export default function ExpensesPage() {
  const {
    expenses,
    isLoading,
    addExpense: addExpenseMutation,
    updateExpense: updateExpenseMutation,
    deleteExpense: deleteExpenseMutation,
    getExpenseById,
  } = useExpenses();

  const handleAddExpense = async (expense: NewExpense) => {
    await addExpenseMutation.mutateAsync(expense);
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    await updateExpenseMutation.mutateAsync({ id, ...updates });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpenseMutation.mutateAsync(id);
  };

  return (
    <ExpenseManagerView
      expenses={expenses}
      isLoading={isLoading}
      onUpdateExpense={handleUpdateExpense}
      onDeleteExpense={handleDeleteExpense}
      onAddExpense={handleAddExpense}
      getExpenseById={getExpenseById}
    />
  );
} 