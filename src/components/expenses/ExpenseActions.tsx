'use client';

import React from 'react';
import { Tables } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Split, Edit, Trash, Receipt } from 'lucide-react';
import { SplitExpenseModal } from './SplitExpenseModal';

type Expense = Tables['expenses']['Row'];

interface ExpenseActionsProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onSplit?: (splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void;
  onViewReceipt?: (expense: Expense) => void;
}

export const ExpenseActions: React.FC<ExpenseActionsProps> = ({
  expense,
  onEdit,
  onDelete,
  onSplit,
  onViewReceipt
}) => {
  const [showSplitModal, setShowSplitModal] = React.useState(false);

  // Don't show split option if expense is already split
  const canSplit = !expense.split_from_id && !expense.has_splits && onSplit;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          
          {canSplit && (
            <DropdownMenuItem onClick={() => setShowSplitModal(true)}>
              <Split className="mr-2 h-4 w-4" />
              Split Expense
            </DropdownMenuItem>
          )}

          {onViewReceipt && expense.receipt_id && (
            <DropdownMenuItem onClick={() => onViewReceipt(expense)}>
              <Receipt className="mr-2 h-4 w-4" />
              View Receipt
            </DropdownMenuItem>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(expense)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canSplit && (
        <SplitExpenseModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onSplit={(splits) => {
            onSplit(splits);
            setShowSplitModal(false);
          }}
          amount={expense.amount}
          description={expense.description}
        />
      )}
    </>
  );
}; 