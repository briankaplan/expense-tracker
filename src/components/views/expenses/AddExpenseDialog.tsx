'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { DatePicker } from '@/components/ui/DatePicker';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type?: 'business' | 'personal';
    memo?: string;
  }) => void;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit
}: AddExpenseDialogProps) {
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !amount) return;

    onSubmit({
      date: date.toISOString(),
      description,
      amount: parseFloat(amount),
      category,
      memo
    });

    onOpenChange(false);
    setDate(undefined);
    setDescription('');
    setAmount('');
    setCategory('');
    setMemo('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Manual Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker
              value={date}
              onChange={setDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">Memo</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 