'use client';

import { ExpenseManagerView } from '@/components/views/expenses/ExpenseManagerView';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useTeller } from '@/lib/providers/TellerProvider';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Expense } from '@/types/expenses';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/Switch';

export default function ExpensesPage() {
  const { expenses, isLoading, updateExpense, addExpense } = useExpenses();
  const { 
    isConnected, 
    openTellerConnect, 
    reconnect, 
    resync, 
    disconnect, 
    lastSynced, 
    isSyncing,
    autoSyncEnabled,
    toggleAutoSync
  } = useTeller();

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(id, updates);
      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      await addExpense(expense);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleCreateReport = async (type: 'business' | 'personal') => {
    // TODO: Implement report generation
    const reportExpenses = expenses.filter((exp: Expense) => exp.type === type);
    
    // For now, just show a success message with the total
    const total = reportExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
    toast.success(
      `${type} report created with ${reportExpenses.length} expenses totaling $${total.toFixed(2)}`
    );
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Connect Your Bank Account</h1>
          <p className="text-muted-foreground">
            Connect your bank account to start tracking your expenses.
          </p>
          <Button onClick={openTellerConnect}>
            Connect Bank Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={resync} disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            {lastSynced && (
              <p className="text-sm text-muted-foreground">
                Last synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={reconnect}>
              Reconnect Bank
            </Button>
            <Button variant="ghost" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
          <div className="space-y-1">
            <h3 className="font-medium">Automatic Daily Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatically sync your expenses every 24 hours
            </p>
          </div>
          <Switch
            checked={autoSyncEnabled}
            onCheckedChange={toggleAutoSync}
            aria-label="Toggle automatic sync"
          />
        </div>
      </div>
      
      <ExpenseManagerView 
        expenses={expenses}
        isLoading={isLoading}
        onUpdateExpense={handleUpdateExpense}
        onCreateReport={handleCreateReport}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
} 