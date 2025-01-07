'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';

interface SplitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (splits: Array<{ amount: number; type: 'business' | 'personal' }>) => void;
  amount: number;
  description?: string;
}

const formSchema = z.object({
  businessPercentage: z.number().min(0).max(100),
  businessAmount: z.number().min(0),
  personalAmount: z.number().min(0),
});

export const SplitExpenseModal: React.FC<SplitExpenseModalProps> = ({
  isOpen,
  onClose,
  onSplit,
  amount,
  description
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessPercentage: 50,
      businessAmount: amount / 2,
      personalAmount: amount / 2,
    },
  });

  const handlePercentageChange = (percentage: number) => {
    const businessAmount = (amount * percentage) / 100;
    const personalAmount = amount - businessAmount;
    
    form.setValue('businessPercentage', percentage);
    form.setValue('businessAmount', Number(businessAmount.toFixed(2)));
    form.setValue('personalAmount', Number(personalAmount.toFixed(2)));
  };

  const handleAmountChange = (type: 'business' | 'personal', value: number) => {
    const newAmount = Math.min(Math.max(0, value), amount);
    const otherAmount = amount - newAmount;
    const percentage = (newAmount / amount) * 100;

    if (type === 'business') {
      form.setValue('businessAmount', newAmount);
      form.setValue('personalAmount', otherAmount);
      form.setValue('businessPercentage', percentage);
    } else {
      form.setValue('personalAmount', newAmount);
      form.setValue('businessAmount', otherAmount);
      form.setValue('businessPercentage', 100 - percentage);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSplit([
      { amount: values.businessAmount, type: 'business' },
      { amount: values.personalAmount, type: 'personal' }
    ]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Split Expense</DialogTitle>
          <DialogDescription>
            Split this expense between business and personal use
            {description && <span className="block text-sm">{description}</span>}
            <span className="block font-medium mt-1">{formatCurrency(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Percentage Slider */}
            <FormField
              control={form.control}
              name="businessPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Percentage</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        value={[field.value]}
                        onValueChange={([value]) => handlePercentageChange(value)}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Personal: {100 - field.value}%</span>
                        <span>Business: {field.value}%</span>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Business Amount */}
              <FormField
                control={form.control}
                name="businessAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={(e) => handleAmountChange('business', parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Personal Amount */}
              <FormField
                control={form.control}
                name="personalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value}
                        onChange={(e) => handleAmountChange('personal', parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Split Expense</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 