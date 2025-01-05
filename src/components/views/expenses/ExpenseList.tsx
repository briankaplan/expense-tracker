'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import { ReceiptDialog } from './ReceiptDialog';
import { DescriptionDialog } from './DescriptionDialog';
import { uploadReceipt } from '@/lib/services/receipts';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Edit, 
  Receipt, 
  AlertCircle, 
  Briefcase, 
  Home,
  Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);

  // Debug when props change
  useEffect(() => {
    console.log('ExpenseList props updated:', {
      expensesCount: expenses.length,
      hasUpdateFn: !!onUpdateExpense,
      expenses: expenses
    });
  }, [expenses, onUpdateExpense]);

  // Calculate totals
  const totals = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc.total += expense.amount;
      if (expense.type === 'business') {
        acc.business += expense.amount;
      } else if (expense.type === 'personal') {
        acc.personal += expense.amount;
      } else {
        acc.uncategorized += expense.amount;
      }
      return acc;
    }, {
      total: 0,
      business: 0,
      personal: 0,
      uncategorized: 0
    });
  }, [expenses]);

  useHotkeys('b', () => {
    if (!onUpdateExpense) {
      console.warn('No update function provided for business hotkey');
      return;
    }
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    onUpdateExpense(currentExpense.id, { type: 'business' });
    setSelectedIndex(prev => Math.min(prev + 1, expenses.length - 1));
  }, [expenses, selectedIndex, onUpdateExpense]);

  useHotkeys('p', () => {
    if (!onUpdateExpense) {
      console.warn('No update function provided for personal hotkey');
      return;
    }
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

  useHotkeys('d', () => {
    const currentExpense = expenses[selectedIndex];
    if (!currentExpense) return;
    
    setSelectedExpense(currentExpense);
    setShowDescriptionDialog(true);
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
      if (!onUpdateExpense) {
        console.warn('No update function provided for receipt upload');
        return;
      }
      await onUpdateExpense(expenseId, { 
        receiptUrl,
        status: 'matched'
      });
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  const handleUpdateDescription = async (expenseId: string, description: string) => {
    if (!onUpdateExpense) {
      console.warn('No update function provided for description update');
      return;
    }
    await onUpdateExpense(expenseId, { description });
  };

  const handleBusinessClick = async (expense: Expense) => {
    console.log('Business button clicked', {
      id: expense.id,
      currentType: expense.type,
      newType: expense.type === 'business' ? undefined : 'business'
    });

    if (!onUpdateExpense) {
      console.warn('No onUpdateExpense function provided');
      return;
    }

    try {
      const newType = expense.type === 'business' ? undefined : 'business';
      await onUpdateExpense(expense.id, { type: newType });
      console.log('Business update successful');
    } catch (error) {
      console.error('Error in business click handler:', error);
      toast.error('Failed to update expense type');
    }
  };

  const handlePersonalClick = async (expense: Expense) => {
    console.log('Personal button clicked', {
      id: expense.id,
      currentType: expense.type,
      newType: expense.type === 'personal' ? undefined : 'personal'
    });

    if (!onUpdateExpense) {
      console.warn('No onUpdateExpense function provided');
      return;
    }

    try {
      const newType = expense.type === 'personal' ? undefined : 'personal';
      await onUpdateExpense(expense.id, { type: newType });
      console.log('Personal update successful');
    } catch (error) {
      console.error('Error in personal click handler:', error);
      toast.error('Failed to update expense type');
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'receiptUrl',
      header: 'Receipt',
      cell: ({ row }) => {
        const expense = row.original;
        const hasReceipt = Boolean(expense.receiptUrl);
        
        return (
          <div className="relative group">
            <div 
              className={cn(
                "w-12 h-12 rounded-lg overflow-hidden border flex items-center justify-center cursor-pointer",
                !hasReceipt && "bg-red-50 dark:bg-red-900/10"
              )}
              onClick={() => {
                setSelectedExpense(expense);
                setShowReceiptDialog(true);
              }}
            >
              {hasReceipt ? (
                <>
                  <img 
                    src={expense.receiptUrl} 
                    alt="Receipt" 
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Preview */}
                  <div className="absolute hidden group-hover:block top-0 left-16 z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-2 border">
                      <img 
                        src={expense.receiptUrl} 
                        alt="Receipt Preview" 
                        className="w-48 h-auto rounded"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-red-500 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 w-14 h-14 text-center">
              <span className="text-2xl font-bold">{date.getDate()}</span>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleString('default', { month: 'short' })}
              </span>
            </div>
          </div>
        );
      }
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
      id: 'actions',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleBusinessClick(expense)}
              className={cn(
                "h-11 w-11 transition-all",
                expense.type === 'business' 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500' 
                  : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400'
              )}
            >
              <Briefcase className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handlePersonalClick(expense)}
              className={cn(
                "h-11 w-11 transition-all",
                expense.type === 'personal' 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-500' 
                  : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400'
              )}
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedExpense(expense);
                setShowDescriptionDialog(true);
              }}
              className="h-11 w-11"
            >
              <Edit className="h-6 w-6" />
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
    if (expense.type === 'business') {
      return 'bg-blue-50/50 dark:bg-blue-900/10';
    }
    if (expense.type === 'personal') {
      return 'bg-orange-50/50 dark:bg-orange-900/10';
    }
    return '';
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => {
    const date = new Date(expense.date);
    
    return (
      <div className={cn(
        "p-4 border rounded-lg space-y-3",
        rowClassName(expense)
      )}>
        <div className="flex justify-between items-start gap-4">
          <div className="relative group">
            <div 
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center cursor-pointer",
                !expense.receiptUrl && "bg-red-50 dark:bg-red-900/10"
              )}
              onClick={() => {
                setSelectedExpense(expense);
                setShowReceiptDialog(true);
              }}
            >
              {expense.receiptUrl ? (
                <>
                  <img 
                    src={expense.receiptUrl} 
                    alt="Receipt" 
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Preview */}
                  <div className="absolute hidden group-hover:block top-0 left-20 z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-2 border">
                      <img 
                        src={expense.receiptUrl} 
                        alt="Receipt Preview" 
                        className="w-48 h-auto rounded"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-red-500 dark:text-red-400">
                  <AlertCircle className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium">{expense.description}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 w-14 h-14 text-center">
                <span className="text-2xl font-bold">{date.getDate()}</span>
                <span className="text-xs text-muted-foreground">
                  {date.toLocaleString('default', { month: 'short' })}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatCurrency(expense.amount)}</div>
            <div className="text-sm text-muted-foreground">{expense.category}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {expense.type && (
              <Badge 
                variant={expense.type === 'business' ? 'default' : 'secondary'}
                className={cn(
                  expense.type === 'business' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                )}
              >
                {expense.type}
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleBusinessClick(expense)}
              className={cn(
                "h-11 w-11 transition-all",
                expense.type === 'business' 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500' 
                  : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400'
              )}
            >
              <Briefcase className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handlePersonalClick(expense)}
              className={cn(
                "h-11 w-11 transition-all",
                expense.type === 'personal' 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 ring-2 ring-orange-500' 
                  : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400'
              )}
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedExpense(expense);
                setShowDescriptionDialog(true);
              }}
              className="h-11 w-11"
            >
              <Edit className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Totals Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Business</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.business)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Personal</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.personal)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Uncategorized</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.uncategorized)}</div>
          </div>
        </div>

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
              <kbd className="px-2 py-1 bg-background rounded">d</kbd> Edit Description
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">↑</kbd> Previous Expense
            </div>
            <div>
              <kbd className="px-2 py-1 bg-background rounded">↓</kbd> Next Expense
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
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
          <DescriptionDialog
            open={showDescriptionDialog}
            onOpenChange={setShowDescriptionDialog}
            expenseId={selectedExpense.id}
            currentDescription={selectedExpense.description}
            onUpdateDescription={handleUpdateDescription}
          />
        </>
      )}
    </>
  );
} 