'use client';

import { useState } from 'react';
import { ExpenseList } from './ExpenseList';
import { AddExpenseDialog } from './AddExpenseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useExpenses } from '@/lib/providers/ExpensesProvider';
import { useReceipts } from '@/lib/hooks/useReceipts';
import { toast } from 'react-hot-toast';
import type { Expense } from '@/types/expenses';

interface ExpenseManagerViewProps {
  expenses: Expense[];
  isLoading: boolean;
  onExpenseUpdate: (params: { id: string; updates: Partial<Expense> }) => void;
  onDeleteExpense?: (id: string) => void;
  onAddExpense?: (expense: Omit<Expense, 'id'>) => void;
  getExpenseById?: (id: string) => Expense | undefined;
}

export function ExpenseManagerView({ 
  expenses: initialExpenses = [], 
  isLoading,
  onExpenseUpdate,
  onDeleteExpense,
  onAddExpense,
  getExpenseById
}: ExpenseManagerViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addExpense, matchReceipt } = useExpenses();
  const { receipts } = useReceipts();

  const filteredExpenses = (initialExpenses || []).filter(expense => {
    if (!expense) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      expense.merchant?.toLowerCase().includes(searchLower) ||
      expense.category?.toLowerCase().includes(searchLower) ||
      expense.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleExpenseUpdate = async (expense: Expense) => {
    try {
      await onExpenseUpdate({ id: expense.id, updates: expense });
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleExpenseSubmit = async (expense: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type?: 'business' | 'personal';
    memo?: string;
    receipt?: File;
    source: 'manual' | 'import';
    paymentMethod: 'credit' | 'checking' | 'cash';
    merchant?: string;
  }) => {
    try {
      const newExpense: Omit<Expense, 'id' | 'createdAt'> = {
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        type: expense.type,
        merchant: expense.merchant,
        status: 'pending'
      };

      if (onAddExpense) {
        await onAddExpense(newExpense as Omit<Expense, 'id'>);
      } else {
        await addExpense.mutateAsync(newExpense as Omit<Expense, 'id'>);
      }
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleReceiptMatch = async (expenseId: string, receiptId: string) => {
    try {
      await matchReceipt({ expenseId, receiptId });
      const matchedReceipt = receipts?.find(r => r.id === receiptId);
      if (matchedReceipt) {
        const expense = filteredExpenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        const updatedExpense: Expense = {
          ...expense,
          details: {
            ...(expense.details || {}),
            receiptUrl: matchedReceipt.url
          },
          status: 'matched',
          receipt_id: receiptId
        };
        await handleExpenseUpdate(updatedExpense);
      }
    } catch (error) {
      console.error('Failed to match receipt:', error);
      toast.error('Failed to match receipt');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <ExpenseList
        expenses={filteredExpenses}
        onExpenseUpdate={handleExpenseUpdate}
        onReceiptMatch={handleReceiptMatch}
        onDelete={onDeleteExpense}
      />

      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
} 