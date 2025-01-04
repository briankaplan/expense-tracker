'use client';

import { useState } from 'react';
import type { Expense } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Building2, Receipt, AlertCircle } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
}

export function ExpenseList({
  expenses,
  isLoading,
  error,
  onUpdateExpense
}: ExpenseListProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{expense.description}</h3>
                  {expense.source === 'bank' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {expense.bankInstitution}
                    </Badge>
                  )}
                  {expense.pending && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(expense.amount)}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{expense.category}</p>
                  <Select
                    value={expense.type}
                    onValueChange={(value: 'business' | 'personal') => 
                      onUpdateExpense(expense.id, { type: value })
                    }
                  >
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 