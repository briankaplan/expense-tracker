'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ExpenseMatcher } from '@/lib/services/expense-matcher';
import { Tables } from '@/lib/supabase/client';

type Receipt = Tables['receipts']['Row'];
type Transaction = Tables['bank_transactions']['Row'];

interface ReceiptDetailsDialogProps {
  receipt: Receipt | null;
  transactions: Transaction[];
  onClose: () => void;
  onCreateExpense: (receipt: Receipt, transaction?: Transaction) => Promise<void>;
}

export function ReceiptDetailsDialog({
  receipt,
  transactions,
  onClose,
  onCreateExpense,
}: ReceiptDetailsDialogProps) {
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  if (!receipt) return null;

  const { transaction: bestMatch, score, reasons } = ExpenseMatcher.findBestMatch(receipt, transactions);

  const handleCreateExpense = async (withTransaction?: Transaction) => {
    try {
      setIsCreatingExpense(true);
      await onCreateExpense(receipt, withTransaction);
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create expense",
        description: error instanceof Error ? error.message : "Could not create expense",
      });
    } finally {
      setIsCreatingExpense(false);
    }
  };

  const potentialMatches = transactions
    .filter(t => !t.matched_receipt_id)
    .map(t => ({
      transaction: t,
      ...ExpenseMatcher.calculateMatchScore(receipt, t),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
          <DialogDescription>
            Processed information from your receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Merchant</h4>
              <p>{receipt.merchant || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="font-medium">Date</h4>
              <p>{formatDate(receipt.date)}</p>
            </div>
            <div>
              <h4 className="font-medium">Total</h4>
              <p>{formatCurrency(receipt.total)}</p>
            </div>
            <div>
              <h4 className="font-medium">Category</h4>
              <p>{(receipt.metadata as any)?.category || 'Uncategorized'}</p>
            </div>
          </div>

          {receipt.items && (receipt.items as any[]).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Line Items</h4>
              <div className="space-y-2">
                {(receipt.items as any[]).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.totalAmount || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-medium">Transaction Matching</h4>
            {bestMatch ? (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bestMatch.merchant_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(bestMatch.date)} • {formatCurrency(Math.abs(bestMatch.amount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {score}% match
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleCreateExpense(bestMatch)}
                      disabled={isCreatingExpense}
                    >
                      {isCreatingExpense ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Use This Match'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reasons.map((reason, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No matching transaction found. The expense will be marked for review.
                </p>
              </div>
            )}

            {potentialMatches.length > 0 && !bestMatch && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Other Potential Matches</h5>
                {potentialMatches.map(({ transaction, score, reasons }) => (
                  <div key={transaction.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.merchant_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)} • {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {score}% match
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateExpense(transaction)}
                          disabled={isCreatingExpense}
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCreateExpense()}
              disabled={isCreatingExpense}
            >
              {isCreatingExpense ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Creating Expense...
                </>
              ) : (
                'Create Without Transaction'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 