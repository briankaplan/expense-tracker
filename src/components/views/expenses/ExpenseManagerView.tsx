'use client';

import { useState, useMemo } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import type { Expense } from '@/types';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { AddExpenseDialog } from './AddExpenseDialog';
import { formatCurrency } from '@/lib/utils';
import { ConfirmReportDialog } from './ConfirmReportDialog';
import type { DateRange } from 'react-day-picker';

interface ExpenseWithReport extends Expense {
  submitted?: boolean;
  reportSubmitted?: boolean;
  status?: 'unmatched' | 'pending';
}

interface NewExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'business' | 'personal';
  memo?: string;
}

interface ExpenseManagerViewProps {
  expenses: Expense[];
  isLoading: boolean;
  error?: Error | null;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  onCreateReport: (type: 'business' | 'personal') => Promise<void>;
  onAddExpense: (expense: NewExpense) => Promise<void>;
}

export function ExpenseManagerView({
  expenses: rawExpenses,
  isLoading,
  error,
  onUpdateExpense,
  onCreateReport,
  onAddExpense
}: ExpenseManagerViewProps) {
  const expenses = rawExpenses as ExpenseWithReport[];
  const [dateRange, setDateRange] = useState<DateRange>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState<'business' | 'personal' | null>(null);
  const [reportToConfirm, setReportToConfirm] = useState<'business' | 'personal' | null>(null);

  // Filter out expenses that have been submitted in reports
  const activeExpenses = useMemo(() => {
    return expenses.filter((exp: ExpenseWithReport) => !exp.reportSubmitted);
  }, [expenses]);

  // Sort and filter expenses
  const sortedExpenses = useMemo(() => {
    const filtered = activeExpenses.filter((exp: ExpenseWithReport) => {
      if (!dateRange?.from) return true;
      const expDate = new Date(exp.date);
      return expDate >= dateRange.from && 
             (!dateRange.to || expDate <= dateRange.to);
    });

    // Sort by submission status first, then by date
    return filtered.sort((a: ExpenseWithReport, b: ExpenseWithReport) => {
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
    const business = sortedExpenses.filter((exp: ExpenseWithReport) => exp.type === 'business');
    const personal = sortedExpenses.filter((exp: ExpenseWithReport) => exp.type === 'personal');

    return {
      businessExpenses: business,
      personalExpenses: personal,
      businessTotal: business.reduce((sum: number, exp: ExpenseWithReport) => sum + exp.amount, 0),
      personalTotal: personal.reduce((sum: number, exp: ExpenseWithReport) => sum + exp.amount, 0),
    };
  }, [sortedExpenses]);

  // Handle report creation
  const handleCreateReport = async (type: 'business' | 'personal') => {
    setIsCreatingReport(type);
    try {
      await onCreateReport(type);
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setIsCreatingReport(null);
      setReportToConfirm(null);
    }
  };

  const handleAddExpense = async (expense: NewExpense) => {
    await onAddExpense(expense);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <DateRangePicker
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
        isLoading={isLoading}
        error={error || null}
        onUpdateExpense={onUpdateExpense}
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onSubmit={handleAddExpense}
      />

      <ConfirmReportDialog
        open={reportToConfirm !== null}
        onOpenChange={(open) => !open && setReportToConfirm(null)}
        onConfirm={() => reportToConfirm && handleCreateReport(reportToConfirm)}
        type={reportToConfirm || 'business'}
        expenseCount={reportToConfirm === 'business' ? businessExpenses.length : personalExpenses.length}
        totalAmount={reportToConfirm === 'business' ? businessTotal : personalTotal}
        unreceipted={reportToConfirm === 'business' 
          ? businessExpenses.filter((exp: ExpenseWithReport) => !exp.receiptUrl || exp.status === 'unmatched').length
          : personalExpenses.filter((exp: ExpenseWithReport) => !exp.receiptUrl || exp.status === 'unmatched').length
        }
        isLoading={isCreatingReport !== null}
      />
    </div>
  );
} 