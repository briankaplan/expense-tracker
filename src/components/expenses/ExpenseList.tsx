'use client';

import React from 'react';
import { Tables } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExpenseActions } from './ExpenseActions';

type Expense = Tables['expenses']['Row'];

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onSplit?: (expense: Expense, splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void;
  onViewReceipt?: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  onSplit,
  onViewReceipt
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{formatDate(expense.date)}</TableCell>
            <TableCell>
              <div>
                {expense.description}
                {expense.split_from_id && (
                  <Badge variant="secondary" className="ml-2">Split</Badge>
                )}
              </div>
              {expense.merchant && (
                <span className="text-sm text-muted-foreground">
                  {expense.merchant}
                </span>
              )}
            </TableCell>
            <TableCell>
              {expense.category && (
                <Badge variant="outline">{expense.category}</Badge>
              )}
            </TableCell>
            <TableCell className="font-mono">
              {formatCurrency(expense.amount)}
            </TableCell>
            <TableCell>
              {expense.status && (
                <Badge 
                  variant={expense.status === 'pending' ? 'secondary' : 'default'}
                >
                  {expense.status}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <ExpenseActions
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
                onSplit={splits => onSplit?.(expense, splits)}
                onViewReceipt={onViewReceipt}
              />
            </TableCell>
          </TableRow>
        ))}
        {expenses.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No expenses found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}; 