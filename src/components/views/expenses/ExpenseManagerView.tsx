'use client';

import { useState, useMemo } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseSummary } from './ExpenseSummary';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Zap, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { AddExpenseDialog } from './AddExpenseDialog';
import { formatCurrency } from '@/lib/utils';
import { ConfirmReportDialog } from './ConfirmReportDialog';
import { FastViewer } from './FastViewer';
import { ExpenseFilters } from './ExpenseFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

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
  source: 'manual' | 'import';
  paymentMethod: 'credit' | 'checking' | 'cash';
  hidden?: boolean;
  merchant?: string;
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
  const [showFastViewer, setShowFastViewer] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState<'business' | 'personal' | null>(null);
  const [reportToConfirm, setReportToConfirm] = useState<'business' | 'personal' | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    missingReceipts: false,
    missingComments: false,
    priceRange: undefined,
    merchant: '',
    category: '',
    search: ''
  });

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

  // Calculate stats
  const stats = useMemo(() => ({
    missingReceipts: activeExpenses.filter(exp => !exp.receiptUrl).length,
    missingComments: activeExpenses.filter(exp => !exp.description).length,
  }), [activeExpenses]);

  // Apply filters to expenses
  const filteredExpenses = useMemo(() => {
    return sortedExpenses.filter(exp => {
      // Skip hidden expenses unless explicitly showing them
      if (exp.hidden) return false;

      // Type filter
      if (filters.type && filters.type !== 'all' && exp.type !== filters.type) return false;

      // Missing receipts
      if (filters.missingReceipts && exp.receiptUrl) return false;

      // Missing descriptions
      if (filters.missingComments && exp.description) return false;

      // Price range
      if (filters.priceRange?.min && exp.amount < filters.priceRange.min) return false;
      if (filters.priceRange?.max && exp.amount > filters.priceRange.max) return false;

      // Merchant
      if (filters.merchant && !exp.merchant?.toLowerCase().includes(filters.merchant.toLowerCase())) return false;

      // Category
      if (filters.category && !exp.category.toLowerCase().includes(filters.category.toLowerCase())) return false;

      // Search (description or merchant)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesDescription = exp.description.toLowerCase().includes(search);
        const matchesMerchant = exp.merchant?.toLowerCase().includes(search);
        if (!matchesDescription && !matchesMerchant) return false;
      }

      return true;
    });
  }, [sortedExpenses, filters]);

  // Handle report creation
  const handleCreateReport = async (type: 'business' | 'personal') => {
    try {
      setIsCreatingReport(type);
      
      // Get expenses for this report
      const expensesForReport = sortedExpenses.filter(exp => 
        exp.type === type && !exp.reportSubmitted
      );

      // Check if we have any expenses to report
      if (expensesForReport.length === 0) {
        toast({
          variant: "destructive",
          title: "No Expenses",
          description: `No ${type} expenses to report`
        });
        return;
      }

      // Create the report
      await onCreateReport(type);
      
      // Mark all expenses in the report as submitted
      await Promise.all(
        expensesForReport.map(exp => 
          handleUpdateExpense(exp.id, { 
            reportSubmitted: true,
            lastReportDate: new Date().toISOString()
          })
        )
      );

      toast({
        title: "Report Created",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} report created successfully!`
      });

      // Close the confirmation dialog
      setReportToConfirm(null);
    } catch (error) {
      console.error('Failed to create report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create ${type} report. Please try again.`
      });
    } finally {
      setIsCreatingReport(null);
    }
  };

  const handleAddExpense = async (data: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type?: 'business' | 'personal';
    memo?: string;
    receipt?: File;
  }) => {
    try {
      // Add the expense
      const newExpense = {
        ...data,
        status: data.receipt ? 'matched' : 'pending',
      };
      
      onAddExpense(newExpense);

      // If there's a receipt, handle the upload
      if (data.receipt) {
        try {
          const receiptUrl = await uploadReceipt(newExpense.id, data.receipt);
          await onUpdateExpense(newExpense.id, { 
            receiptUrl,
            status: 'matched'
          });
        } catch (error) {
          console.error('Failed to upload receipt:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to upload receipt"
          });
        }
      }

      toast({
        title: "Success",
        description: "Expense added successfully"
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add expense"
      });
    }
  };

  // Wrap onUpdateExpense to add debugging
  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    console.log('ExpenseManagerView: Updating expense', { id, updates });
    
    if (!onUpdateExpense) {
      console.warn('ExpenseManagerView: onUpdateExpense is not defined');
      return;
    }

    try {
      await onUpdateExpense(id, updates);
      console.log('ExpenseManagerView: Update successful', {
        id,
        updates,
        currentExpenses: expenses.length
      });

      // Update the local expenses array to trigger a re-render
      const updatedExpenses = expenses.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      );
      
      // Recalculate totals
      const business = updatedExpenses.filter(exp => exp.type === 'business');
      const personal = updatedExpenses.filter(exp => exp.type === 'personal');
      
      console.log('ExpenseManagerView: Updated totals', {
        businessCount: business.length,
        businessTotal: business.reduce((sum, exp) => sum + exp.amount, 0),
        personalCount: personal.length,
        personalTotal: personal.reduce((sum, exp) => sum + exp.amount, 0)
      });

    } catch (error) {
      console.error('ExpenseManagerView: Update failed', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update expense"
      });
    }
  };

  // Handle expense deletion
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await handleUpdateExpense(id, { hidden: true });
      toast({
        title: "Success",
        description: "Expense deleted"
      });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense"
      });
    }
  };

  // Handle creating a hidden report
  const handleCreateHiddenReport = async (type: 'business' | 'personal') => {
    try {
      // Get expenses for this report
      const expensesForReport = sortedExpenses.filter(exp => 
        exp.type === type && !exp.reportSubmitted && !exp.hidden
      );

      if (expensesForReport.length === 0) {
        toast({
          variant: "destructive",
          title: "No Expenses",
          description: "No expenses to hide"
        });
        return;
      }

      // Mark all expenses as hidden
      await Promise.all(
        expensesForReport.map(exp => 
          handleUpdateExpense(exp.id, { 
            hidden: true,
            reportSubmitted: true,
            lastReportDate: new Date().toISOString()
          })
        )
      );

      toast({
        title: "Success",
        description: "Expenses hidden successfully"
      });
    } catch (error) {
      console.error('Failed to hide expenses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to hide expenses"
      });
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
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowFastViewer(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            Fast Categorize
          </Button>
          <Button onClick={() => setShowAddExpense(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Manual Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={setFilters}
        stats={stats}
      />

      {/* Business and Personal Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Business Summary Card */}
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Business Expenses</h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCreateHiddenReport('business')}>
                    Hide Previous Expenses
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline"
                onClick={() => setReportToConfirm('business')}
                disabled={businessExpenses.length === 0 || isCreatingReport !== null}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isCreatingReport === 'business' ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Creating...
                  </>
                ) : (
                  'Create Report'
                )}
              </Button>
            </div>
          </div>
          <div className="text-2xl font-bold mb-2">
            {formatCurrency(businessTotal)}
          </div>
        </div>

        {/* Personal Summary Card */}
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Personal Expenses</h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCreateHiddenReport('personal')}>
                    Hide Previous Expenses
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline"
                onClick={() => setReportToConfirm('personal')}
                disabled={personalExpenses.length === 0 || isCreatingReport !== null}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isCreatingReport === 'personal' ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Creating...
                  </>
                ) : (
                  'Create Report'
                )}
              </Button>
            </div>
          </div>
          <div className="text-2xl font-bold mb-2">
            {formatCurrency(personalTotal)}
          </div>
        </div>
      </div>

      {/* Main Expense List */}
      <ExpenseList 
        expenses={filteredExpenses}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
        highlight="unsubmitted"
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onSubmit={handleAddExpense}
      />

      <FastViewer
        expenses={expenses}
        onUpdateExpense={handleUpdateExpense}
        open={showFastViewer}
        onOpenChange={setShowFastViewer}
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