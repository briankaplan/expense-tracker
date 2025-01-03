'use client';

import { useEffect, useCallback, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import { ReceiptDialog } from './ReceiptDialog';
import { MemoDialog } from './MemoDialog';
import { uploadReceipt } from '@/lib/services/receipts';
import { toast } from 'react-hot-toast';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'matched' | 'unmatched';
  type?: 'business' | 'personal';
  memo?: string;
  receiptUrl?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onUpdateExpense?: (id: string, updates: Partial<Expense>) => void;
  highlight?: 'unsubmitted' | 'unreceipted';
}

export function ExpenseList({ expenses, onUpdateExpense, highlight }: ExpenseListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showMemoDialog, setShowMemoDialog] = useState(false);

  useHotkeys('b', () => {
    if (!onUpdateExpense) return;
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    onUpdateExpense(currentExpense.id, { type: 'business' });
    setSelectedIndex(prev => Math.min(prev + 1, expenses.length - 1));
  }, [expenses, selectedIndex, onUpdateExpense]);

  useHotkeys('p', () => {
    if (!onUpdateExpense) return;
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    onUpdateExpense(currentExpense.id, { type: 'personal' });
    setSelectedIndex(prev => Math.min(prev + 1, expenses.length - 1));
  }, [expenses, selectedIndex, onUpdateExpense]);

  useHotkeys('r', () => {
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    setSelectedExpense(currentExpense);
    setShowReceiptDialog(true);
  }, [expenses, selectedIndex]);

  useHotkeys('m', () => {
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    setSelectedExpense(currentExpense);
    setShowMemoDialog(true);
  }, [expenses, selectedIndex]);

  useHotkeys('up', () => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useHotkeys('down', () => {
    setSelectedIndex(prev => Math.min(prev + 1, expenses.length - 1));
  }, [expenses.length]);

  const handleUploadReceipt = async (expenseId: string, file: File) => {
    try {
      const receiptUrl = await uploadReceipt(expenseId, file);
      if (onUpdateExpense) {
        await onUpdateExpense(expenseId, { 
          receiptUrl,
          status: 'matched'
        });
      }
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  const handleUpdateMemo = async (expenseId: string, memo: string) => {
    if (onUpdateExpense) {
      await onUpdateExpense(expenseId, { memo });
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('date'))
    },
    {
      accessorKey: 'description',
      header: 'Description'
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.getValue('amount'))
    },
    {
      accessorKey: 'category',
      header: 'Category'
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return type ? (
          <Badge variant={type === 'business' ? 'default' : 'secondary'}>
            {type}
          </Badge>
        ) : null;
      }
    },
    {
      accessorKey: 'status',
      header: 'Receipt',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge 
            variant={
              status === 'matched' ? 'success' : 
              status === 'unmatched' ? 'destructive' : 
              'warning'
            }
          >
            {status}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateExpense?.(expense.id, { type: 'business' })}
              className={expense.type === 'business' ? 'bg-blue-100' : ''}
            >
              B
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateExpense?.(expense.id, { type: 'personal' })}
              className={expense.type === 'personal' ? 'bg-green-100' : ''}
            >
              P
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedExpense(expense);
                setShowReceiptDialog(true);
              }}
            >
              📄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedExpense(expense);
                setShowMemoDialog(true);
              }}
            >
              ✏️
            </Button>
          </div>
        );
      }
    }
  ];

  const rowClassName = (expense: Expense) => {
    if (highlight === 'unsubmitted') {
      return 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20';
    }
    if (highlight === 'unreceipted') {
      return 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20';
    }
    return '';
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <kbd className="px-2 py-1 bg-background rounded">b</kbd> Mark as Business
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">p</kbd> Mark as Personal
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">r</kbd> View/Upload Receipt
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">m</kbd> Edit Memo
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">↑</kbd> Previous Expense
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">↓</kbd> Next Expense
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <DataTable 
            columns={columns} 
            data={expenses}
            state={{
              rowSelection: { [selectedIndex]: true }
            }}
            getRowClassName={rowClassName}
          />
        </div>
      </div>

      {selectedExpense && (
        <>
          <ReceiptDialog
            open={showReceiptDialog}
            onOpenChange={setShowReceiptDialog}
            expenseId={selectedExpense.id}
            currentReceiptUrl={selectedExpense.receiptUrl}
            onUploadReceipt={handleUploadReceipt}
          />
          <MemoDialog
            open={showMemoDialog}
            onOpenChange={setShowMemoDialog}
            expenseId={selectedExpense.id}
            currentMemo={selectedExpense.memo}
            onUpdateMemo={handleUpdateMemo}
          />
        </>
      )}
    </>
  );
} 