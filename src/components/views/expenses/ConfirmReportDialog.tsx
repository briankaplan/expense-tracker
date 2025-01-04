'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ConfirmReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  type: 'business' | 'personal';
  expenseCount: number;
  totalAmount: number;
  isLoading?: boolean;
  unreceipted?: number;
}

export function ConfirmReportDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
  expenseCount,
  totalAmount,
  unreceipted = 0,
  isLoading = false
}: ConfirmReportDialogProps) {
  const hasWarnings = unreceipted > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {type} Report</DialogTitle>
          <DialogDescription>
            Review the expenses that will be included in this report:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Number of Expenses:</span>
              <span className="font-medium">{expenseCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            {hasWarnings && (
              <div className="flex justify-between text-sm text-amber-600 dark:text-amber-500">
                <span>Missing Receipts:</span>
                <span className="font-medium">{unreceipted}</span>
              </div>
            )}
          </div>

          {hasWarnings && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex gap-2 text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Warning</p>
                  <p>Some expenses are missing receipts. These should be added before creating the report.</p>
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-sm text-muted-foreground">
            These expenses will be removed from the list after the report is created.
            Make sure all receipts are uploaded and properly matched.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={isLoading}
            variant={hasWarnings ? "destructive" : "default"}
          >
            {hasWarnings ? "Create Anyway" : "Create Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 