'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface OpenReportProps {
  id: string;
  type: 'business' | 'personal';
  totalAmount: number;
  expenseCount: number;
  missingReceipts: number;
  missingComments: number;
  dateCreated: string;
  categories: { [key: string]: number };
  merchants: { [key: string]: number };
  onClose: (id: string) => void;
}

export function OpenReport({
  id,
  type,
  totalAmount,
  expenseCount,
  missingReceipts,
  missingComments,
  dateCreated,
  categories,
  merchants,
  onClose
}: OpenReportProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report #{id}</h2>
        <Button onClick={() => onClose(id)}>Close Report</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="font-medium">{expenseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Missing Receipts</span>
                <Badge variant={missingReceipts > 0 ? 'destructive' : 'default'}>
                  {missingReceipts}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Missing Comments</span>
                <Badge variant={missingComments > 0 ? 'destructive' : 'default'}>
                  {missingComments}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {Object.entries(categories).map(([category, amount]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{category}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {Object.entries(merchants)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([merchant, amount]) => (
                  <div key={merchant} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{merchant}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 