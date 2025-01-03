'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Receipt } from '@/types/receipts';
import type { Expense } from '@/types/expenses';

interface ReceiptMatcherProps {
  receipts: Receipt[];
  expenses: Expense[];
  onMatch: (receiptId: string, expenseId: string) => Promise<void>;
  onSkip: (receiptId: string) => void;
}

export function ReceiptMatcher({ receipts, expenses, onMatch, onSkip }: ReceiptMatcherProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentReceipt = receipts[currentIndex];
  const suggestedExpenses = expenses
    .filter(expense => !expense.receiptUrl && Math.abs(
      expense.amount - (currentReceipt?.metadata?.amount?.value || 0)
    ) < 0.01);

  const handleMatch = async (expenseId: string) => {
    if (!currentReceipt) return;
    
    setLoading(true);
    try {
      await onMatch(currentReceipt.id, expenseId);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to match receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!currentReceipt) return;
    onSkip(currentReceipt.id);
    setCurrentIndex(prev => prev + 1);
  };

  if (!currentReceipt || currentIndex >= receipts.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No more receipts to match</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-[3/4] relative">
              <img
                src={currentReceipt.url}
                alt="Receipt"
                className="rounded-lg object-cover"
              />
            </div>
            {currentReceipt.metadata && (
              <div className="grid gap-2">
                {currentReceipt.metadata.merchant && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Merchant</span>
                    <span className="font-medium">{currentReceipt.metadata.merchant.name}</span>
                  </div>
                )}
                {currentReceipt.metadata.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatCurrency(currentReceipt.metadata.amount.value)}</span>
                  </div>
                )}
                {currentReceipt.metadata.date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date(currentReceipt.metadata.date.value).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Suggested Matches</h3>
        {suggestedExpenses.length > 0 ? (
          suggestedExpenses.map(expense => (
            <Card key={expense.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleMatch(expense.id)}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">{formatCurrency(expense.amount)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No matching expenses found</p>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleSkip} disabled={loading}>
            Skip
          </Button>
          <Button onClick={() => setCurrentIndex(prev => prev + 1)} disabled={loading}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 