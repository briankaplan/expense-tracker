'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, Eye, CheckCircle, XCircle } from 'lucide-react';

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
  onView?: (id: string) => void;
  onExport?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
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
  onView,
  onExport,
  onApprove,
  onReject
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">
            {type.charAt(0).toUpperCase() + type.slice(1)} Report
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(dateCreated)}
            {dateClosed && ` • Closed ${formatDate(dateClosed)}`}
          </p>
        </div>
        <Badge
          variant={status === 'open' ? 'default' : 'secondary'}
        >
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold">{expenseCount}</p>
            </div>
          </div>
          {(missingReceipts > 0 || missingComments > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {missingReceipts > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-500">Missing Receipts</p>
                  <p className="text-lg font-semibold text-red-500">{missingReceipts}</p>
                </div>
              )}
              {missingComments > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-500">Missing Comments</p>
                  <p className="text-lg font-semibold text-yellow-500">{missingComments}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onView && (
          <Button variant="ghost" size="sm" onClick={() => onView(id)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        {onExport && (
          <Button variant="ghost" size="sm" onClick={() => onExport(id)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
        {status === 'open' && (
          <>
            {onApprove && (
              <Button variant="default" size="sm" onClick={() => onApprove(id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button variant="destructive" size="sm" onClick={() => onReject(id)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
} 