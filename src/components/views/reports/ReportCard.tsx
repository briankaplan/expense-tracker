'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface ReportCardProps {
  id: string;
  type: 'business' | 'personal';
  status: 'open' | 'closed';
  totalAmount: number;
  expenseCount: number;
  missingReceipts: number;
  missingComments: number;
  dateCreated: string;
  dateClosed?: string;
  onOpen: (id: string) => void;
}

export function ReportCard({
  id,
  type,
  status,
  totalAmount,
  expenseCount,
  missingReceipts,
  missingComments,
  dateCreated,
  dateClosed,
  onOpen
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Report #{id}
        </CardTitle>
        <Badge
          variant={status === 'open' ? 'default' : 'secondary'}
        >
          {status}
        </Badge>
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
            <span className="font-medium">{missingReceipts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Missing Comments</span>
            <span className="font-medium">{missingComments}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="font-medium">{new Date(dateCreated).toLocaleDateString()}</span>
          </div>
          {dateClosed && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Closed</span>
              <span className="font-medium">{new Date(dateClosed).toLocaleDateString()}</span>
            </div>
          )}
          {status === 'open' && (
            <Button
              className="mt-4"
              onClick={() => onOpen(id)}
            >
              Open Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 