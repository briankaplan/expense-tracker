'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type Receipt } from '@/types/receipts';
import { type Expense } from '@/types/expenses';

interface ReceiptMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt;
  expenses: Expense[];
  onMatch: (receiptId: string, expenseId: string) => Promise<void>;
  onSkip: (receiptId: string) => void;
}

export function ReceiptMatchDialog({
  open,
  onOpenChange,
  receipt,
  expenses,
  onMatch,
  onSkip
}: ReceiptMatchDialogProps) {
  // Filter out expenses that already have receipts
  const availableExpenses = expenses.filter(expense => !expense.receiptUrl);

  const handleMatch = async (expenseId: string) => {
    await onMatch(receipt.id, expenseId);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip(receipt.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Match Receipt</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <img
                src={receipt.url}
                alt="Receipt"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Filename</span>
                <span className="font-medium">{receipt.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Uploaded</span>
                <span className="font-medium">{formatDate(receipt.uploadedAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-medium">Select Matching Expense</div>
            <ScrollArea className="h-[400px] rounded-md border p-2">
              {availableExpenses.length > 0 ? (
                <div className="space-y-2">
                  {availableExpenses.map(expense => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent cursor-pointer"
                      onClick={() => handleMatch(expense.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(expense.date)}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <Badge variant="secondary">{expense.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No available expenses to match
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 