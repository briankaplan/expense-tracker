'use client';

import { useExpenses } from '@/lib/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export function DashboardView() {
  const { expenses, isLoading } = useExpenses();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const businessExpenses = expenses
    .filter(expense => expense.type === 'business')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const personalExpenses = expenses
    .filter(expense => expense.type === 'personal')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const unreceipted = expenses.filter(expense => !expense.receiptUrl).length;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(businessExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(personalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreceipted}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.slice(0, 5).map(expense => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Business</p>
                  <div className="text-sm text-muted-foreground">
                    {((businessExpenses / totalExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>{formatCurrency(businessExpenses)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Personal</p>
                  <div className="text-sm text-muted-foreground">
                    {((personalExpenses / totalExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>{formatCurrency(personalExpenses)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 