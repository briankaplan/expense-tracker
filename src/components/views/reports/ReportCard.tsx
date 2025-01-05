'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, ChevronRight, FileText, Receipt } from 'lucide-react';
import { format } from 'date-fns';

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
  const formattedDate = format(new Date(dateCreated), 'MMM d, yyyy');
  const formattedClosedDate = dateClosed ? format(new Date(dateClosed), 'MMM d, yyyy') : null;

  return (
    <Card className="p-6 hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => onOpen(id)}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Report #{id}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                type === 'business' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {formattedDate}
              {formattedClosedDate && ` • Closed ${formattedClosedDate}`}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
              <div className="text-lg font-semibold">{formatCurrency(totalAmount)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Expenses</div>
              <div className="text-lg font-semibold">{expenseCount}</div>
            </div>
            {(missingReceipts > 0 || missingComments > 0) && (
              <div className="col-span-2 flex items-center gap-4">
                {missingReceipts > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">{missingReceipts} missing receipts</span>
                  </div>
                )}
                {missingComments > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{missingComments} missing comments</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
} 