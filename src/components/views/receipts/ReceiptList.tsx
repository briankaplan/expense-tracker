'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EyeOpenIcon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import type { Receipt } from '@/types/receipts';

interface ReceiptListProps {
  receipts: Receipt[];
  onView?: (receipt: Receipt) => void;
  onDownload?: (receipt: Receipt) => void;
  onDelete?: (receipt: Receipt) => void;
}

export function ReceiptList({ receipts, onView, onDownload, onDelete }: ReceiptListProps) {
  if (!receipts.length) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No receipts found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-lg border">
      <div className="p-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="mb-4 flex items-center justify-between rounded-lg border p-4 last:mb-0"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {receipt.merchant || 'Unknown Merchant'}
                </span>
                <Badge variant={receipt.status === 'matched' ? 'success' : 'default'}>
                  {receipt.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(receipt.date).toLocaleDateString()}</span>
                {receipt.total && (
                  <span>${receipt.total.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(receipt)}
                  title="View Receipt"
                >
                  <EyeOpenIcon className="h-4 w-4" />
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(receipt)}
                  title="Download Receipt"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(receipt)}
                  title="Delete Receipt"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 