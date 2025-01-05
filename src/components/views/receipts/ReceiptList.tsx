'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { formatBytes, formatDate, formatCurrency } from '@/lib/utils';
import { type Receipt } from '@/types/receipts';
import { type Expense } from '@/types/expenses';
import { ReceiptMatchDialog } from './ReceiptMatchDialog';
import { Eye, Link as LinkIcon } from 'lucide-react';

interface ReceiptListProps {
  receipts: Receipt[];
  expenses: Expense[];
  onMatch: (receiptId: string, expenseId: string) => Promise<void>;
  onSkip: (receiptId: string) => void;
  onView: (receipt: Receipt) => void;
}

export function ReceiptList({ receipts, expenses, onMatch, onSkip, onView }: ReceiptListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  const columns: ColumnDef<Receipt>[] = [
    {
      accessorKey: 'filename',
      header: 'Receipt',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.filename}</span>
          <Badge variant={
            row.original.status === 'matched' ? 'default' :
            row.original.status === 'unmatched' ? 'destructive' :
            'secondary'
          }>
            {row.original.status}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'merchant',
      header: 'Merchant',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.metadata?.merchant?.name || '-'}
          {row.original.metadata?.merchant && (
            <span className="text-xs text-muted-foreground">
              ({(row.original.metadata.merchant.confidence * 100).toFixed()}%)
            </span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        row.original.metadata?.amount ? (
          <div className="flex items-center gap-1">
            {formatCurrency(row.original.metadata.amount.value)}
            <span className="text-xs text-muted-foreground">
              ({(row.original.metadata.amount.confidence * 100).toFixed()}%)
            </span>
          </div>
        ) : '-'
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.metadata?.date ? (
            <>
              {formatDate(row.original.metadata.date.value)}
              <span className="text-xs text-muted-foreground">
                ({(row.original.metadata.date.confidence * 100).toFixed()}%)
              </span>
            </>
          ) : (
            formatDate(row.original.uploadedAt)
          )}
        </div>
      )
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => formatBytes(row.original.size)
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status !== 'matched' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedReceipt(row.original);
                setShowMatchDialog(true);
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Receipt List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={receipts}
            pageSize={10}
            searchable
            searchFields={['filename', 'metadata.merchant.name', 'metadata.ocr.text']}
          />
        </CardContent>
      </Card>

      {selectedReceipt && (
        <ReceiptMatchDialog
          open={showMatchDialog}
          onOpenChange={setShowMatchDialog}
          receipt={selectedReceipt}
          expenses={expenses}
          onMatch={onMatch}
          onSkip={onSkip}
        />
      )}
    </>
  );
} 