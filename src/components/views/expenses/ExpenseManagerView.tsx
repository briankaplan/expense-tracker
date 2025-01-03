'use client';

import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'matched' | 'unmatched';
}

interface ExpenseManagerViewProps {
  expenses: Expense[];
  isLoading?: boolean;
}

export function ExpenseManagerView({ expenses, isLoading = false }: ExpenseManagerViewProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const matchedExpenses = expenses
    .filter(exp => exp.status === 'matched')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const unmatchedExpenses = expenses
    .filter(exp => exp.status === 'unmatched')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses
    .filter(exp => exp.status === 'pending')
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-8">
      <ExpenseSummary
        totalExpenses={totalExpenses}
        matchedExpenses={matchedExpenses}
        unmatchedExpenses={unmatchedExpenses}
        pendingExpenses={pendingExpenses}
      />
      <ExpenseList expenses={expenses} />
    </div>
  );
} 