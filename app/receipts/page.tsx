'use client';

import { useReceipts } from '@/lib/hooks/useReceipts';
import { ReceiptList } from '@/components/views/receipts/ReceiptList';
import { Spinner } from '@/components/ui/spinner';

export default function ReceiptsPage() {
  const { receipts, isLoading, error } = useReceipts();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load receipts</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Receipts</h1>
      <ReceiptList receipts={receipts} />
    </div>
  );
} 