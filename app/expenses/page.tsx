'use client';

import { ExpenseManagerView } from '@/components/views/expenses/ExpenseManagerView';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// TODO: Replace with real data fetching
const mockExpenses = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Grocery Shopping',
    amount: 125.50,
    category: 'Food',
    status: 'matched' as const,
    source: 'import' as const,
    paymentMethod: 'credit' as const,
    type: 'personal' as const,
    reportSubmitted: false
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Gas Station',
    amount: 45.00,
    category: 'Transportation',
    status: 'pending' as const,
    source: 'import' as const,
    paymentMethod: 'credit' as const,
    type: 'business' as const,
    reportSubmitted: false
  }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses);

  const handleUpdateExpense = async (id: string, updates: any) => {
    console.log('Updating expense:', { id, updates });
    
    // Update the expense in the local state
    setExpenses(prevExpenses => 
      prevExpenses.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );

    // TODO: Update in the database
    return Promise.resolve();
  };

  const handleAddExpense = (expense: any) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).slice(2),
      reportSubmitted: false
    };
    
    // Update the expenses state with the new expense
    setExpenses(prev => [...prev, newExpense]);
    
    // Return the new expense for any additional processing
    return newExpense;
  };

  const handleCreateReport = async (type: 'business' | 'personal') => {
    console.log('Creating report for:', type);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get expenses for this report
    const reportExpenses = expenses.filter(exp => 
      exp.type === type && !exp.reportSubmitted
    );

    console.log(`Creating ${type} report with ${reportExpenses.length} expenses:`, reportExpenses);
    
    // In a real app, you would send these to your backend
    // For now, we'll just simulate success
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto py-6">
      <ExpenseManagerView 
        expenses={expenses}
        onUpdateExpense={handleUpdateExpense}
        onAddExpense={handleAddExpense}
        onCreateReport={handleCreateReport}
      />
    </div>
  );
} 