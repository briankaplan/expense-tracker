'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useReceipts } from '@/lib/hooks/useReceipts';
import { formatCurrency } from '@/lib/utils';
import { Plus, Receipt, FileText, CreditCard, Calendar, ArrowRight } from 'lucide-react';

export function DashboardView() {
  const router = useRouter();
  const { expenses = [] } = useExpenses() || {};
  const { receipts = [] } = useReceipts() || {};

  // Calculate total expenses for current period
  const currentPeriodExpenses = React.useMemo(() => {
    if (!Array.isArray(expenses)) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses
      .filter(expense => new Date(expense.date) >= startOfMonth)
      .reduce((total, expense) => total + (expense?.amount || 0), 0);
  }, [expenses]);

  // Get recent expenses
  const recentExpenses = React.useMemo(() => {
    if (!Array.isArray(expenses)) return [];
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  // Get recent receipts
  const recentReceipts = React.useMemo(() => {
    if (!Array.isArray(receipts)) return [];
    return [...receipts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [receipts]);

  // Get unmatched receipts count
  const unmatchedReceiptsCount = React.useMemo(() => {
    if (!Array.isArray(receipts)) return 0;
    return receipts.filter(receipt => !receipt?.expenseId).length;
  }, [receipts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/expenses/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="outline" onClick={() => router.push('/receipts')}>
            <Receipt className="mr-2 h-4 w-4" />
            Upload Receipt
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Period
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPeriodExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Total expenses this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unmatched Receipts
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unmatchedReceiptsCount}</div>
            <p className="text-xs text-muted-foreground">
              Receipts waiting to be matched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              New expenses in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Expenses</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/expenses')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.date}</p>
                  </div>
                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
                </div>
              ))}
              {recentExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent expenses</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Receipts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/receipts')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReceipts.map(receipt => (
                <div key={receipt.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {receipt.metadata?.merchant || 'Unknown Merchant'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-medium">
                    {receipt.metadata?.total
                      ? formatCurrency(receipt.metadata.total)
                      : 'N/A'}
                  </div>
                </div>
              ))}
              {recentReceipts.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent receipts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 