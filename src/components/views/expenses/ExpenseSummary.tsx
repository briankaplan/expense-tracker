'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ExpenseSummaryProps {
  totalExpenses: number;
  matchedExpenses: number;
  unmatchedExpenses: number;
  pendingExpenses: number;
  businessTotal: number;
  personalTotal: number;
}

export function ExpenseSummary({
  totalExpenses,
  matchedExpenses,
  unmatchedExpenses,
  pendingExpenses,
  businessTotal,
  personalTotal
}: ExpenseSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <div className="text-xs text-muted-foreground">
            Business: {formatCurrency(businessTotal)}
            <br />
            Personal: {formatCurrency(personalTotal)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Matched</CardTitle>
          <Badge variant="success">Matched</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(matchedExpenses)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unmatched</CardTitle>
          <Badge variant="destructive">Unmatched</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(unmatchedExpenses)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Badge variant="warning">Pending</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingExpenses)}</div>
        </CardContent>
      </Card>
    </div>
  );
} 