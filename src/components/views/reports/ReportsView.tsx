'use client';

import { useState } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

export function ReportsView() {
  const { expenses } = useExpenses();
  const [reportType, setReportType] = useState<'business' | 'personal'>('business');
  const [showClosed, setShowClosed] = useState(false);

  const filteredExpenses = expenses.filter(expense => expense.type === reportType);
  
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const withReceipts = filteredExpenses.filter(expense => expense.receiptUrl).length;
  const withoutReceipts = filteredExpenses.filter(expense => !expense.receiptUrl).length;

  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
      };
    }
    acc[category].total += expense.amount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center gap-4">
          <Select
            value={reportType}
            onValueChange={(value) => setReportType(value as 'business' | 'personal')}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowClosed(!showClosed)}
          >
            {showClosed ? 'Hide Closed' : 'Show Closed'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">With Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withReceipts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Missing Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withoutReceipts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(expensesByCategory).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.count} {data.count === 1 ? 'expense' : 'expenses'}
                  </div>
                </div>
                <div className="font-medium">{formatCurrency(data.total)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 