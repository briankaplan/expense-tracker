'use client';

import { useState, useMemo } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { PlusCircle, FileText } from 'lucide-react';
import { AddExpenseDialog } from './AddExpenseDialog';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { ConfirmReportDialog } from './ConfirmReportDialog';

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
  lastReportDate?: string;
  submitted?: boolean;
  needsReceipt?: boolean;
  reportSubmitted?: boolean;
}

interface ExpenseManagerViewProps {
  expenses: Expense[];
  isLoading?: boolean;
  onCreateReport: (type: 'business' | 'personal') => Promise<void>;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
}

export function ExpenseManagerView({ 
  expenses,
  isLoading = false,
  onCreateReport,
  onAddExpense,
  onUpdateExpense
}: ExpenseManagerViewProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState<'business' | 'personal' | null>(null);
  const [reportToConfirm, setReportToConfirm] = useState<'business' | 'personal' | null>(null);

  // Filter out expenses that have been submitted in reports
  const activeExpenses = useMemo(() => {
    return expenses.filter(exp => !exp.reportSubmitted);
  }, [expenses]);

  // Sort and filter expenses
  const sortedExpenses = useMemo(() => {
    const filtered = activeExpenses.filter(exp => {
      if (!dateRange?.from) return true;
      const expDate = new Date(exp.date);
      return expDate >= dateRange.from && 
             (!dateRange.to || expDate <= dateRange.to);
    });

    // Sort by submission status first, then by date
    return filtered.sort((a, b) => {
      // First sort by submission status
      if (!a.submitted && b.submitted) return -1;
      if (a.submitted && !b.submitted) return 1;

      // Then sort by receipt status
      if (!a.receiptUrl && b.receiptUrl) return -1;
      if (a.receiptUrl && !b.receiptUrl) return 1;

      // Finally sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activeExpenses, dateRange]);

  // Group expenses by type
  const {
    businessExpenses,
    personalExpenses,
    businessTotal,
    personalTotal,
  } = useMemo(() => {
    const business = sortedExpenses.filter(exp => exp.type === 'business');
    const personal = sortedExpenses.filter(exp => exp.type === 'personal');

    return {
      businessExpenses: business,
      personalExpenses: personal,
      businessTotal: business.reduce((sum, exp) => sum + exp.amount, 0),
      personalTotal: personal.reduce((sum, exp) => sum + exp.amount, 0),
    };
  }, [sortedExpenses]);

  // Handle report creation
  const handleCreateReport = async (type: 'business' | 'personal') => {
    const toastId = toast.loading(
      `Creating ${type} expense report...`, 
      { position: 'top-right' }
    );

    try {
      setIsCreatingReport(type);
      await onCreateReport(type);
      
      const expensesToUpdate = sortedExpenses
        .filter(exp => exp.type === type)
        .map(exp => exp.id);

      await Promise.all(
        expensesToUpdate.map(id => onUpdateExpense(id, { reportSubmitted: true }))
      );

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} report created successfully!`,
        { id: toastId }
      );
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error(
        `Failed to create ${type} report. Please try again.`,
        { id: toastId }
      );
    } finally {
      setIsCreatingReport(null);
      setReportToConfirm(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <DatePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-[200px]"
        />
        <Button onClick={() => setShowAddExpense(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Manual Expense
        </Button>
      </div>

      {/* Business and Personal Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Business Summary Card */}
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Business Expenses</h3>
            <Button 
              variant="outline"
              onClick={() => setReportToConfirm('business')}
              disabled={businessExpenses.length === 0 || isCreatingReport !== null}
              loading={isCreatingReport === 'business'}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isCreatingReport === 'business' ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
          <div className="text-2xl font-bold mb-2">
            {formatCurrency(businessTotal)}
          </div>
        </div>

        {/* Personal Summary Card */}
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Personal Expenses</h3>
            <Button 
              variant="outline"
              onClick={() => setReportToConfirm('personal')}
              disabled={personalExpenses.length === 0 || isCreatingReport !== null}
              loading={isCreatingReport === 'personal'}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isCreatingReport === 'personal' ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
          <div className="text-2xl font-bold mb-2">
            {formatCurrency(personalTotal)}
          </div>
        </div>
      </div>

      {/* Main Expense List */}
      <ExpenseList 
        expenses={sortedExpenses}
        onUpdateExpense={onUpdateExpense}
        highlight="unsubmitted"
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onSubmit={onAddExpense}
      />

      <ConfirmReportDialog
        open={reportToConfirm !== null}
        onOpenChange={(open) => !open && setReportToConfirm(null)}
        onConfirm={() => reportToConfirm && handleCreateReport(reportToConfirm)}
        type={reportToConfirm || 'business'}
        expenseCount={reportToConfirm === 'business' ? businessExpenses.length : personalExpenses.length}
        totalAmount={reportToConfirm === 'business' ? businessTotal : personalTotal}
        unreceipted={reportToConfirm === 'business' 
          ? businessExpenses.filter(exp => !exp.receiptUrl || exp.status === 'unmatched').length
          : personalExpenses.filter(exp => !exp.receiptUrl || exp.status === 'unmatched').length
        }
        isLoading={isCreatingReport !== null}
      />
    </div>
  );
} 