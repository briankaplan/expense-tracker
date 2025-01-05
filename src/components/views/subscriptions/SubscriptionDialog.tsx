'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { type Subscription } from '@/types/subscriptions';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onSubmit: (data: Omit<Subscription, 'id'>) => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSubmit
}: SubscriptionDialogProps) {
  const [formData, setFormData] = useState<Omit<Subscription, 'id'>>({
    name: '',
    description: '',
    amount: 0,
    frequency: 'monthly',
    category: 'other',
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date().toISOString(),
    reminderEnabled: true,
    reminderDays: 7,
    autoRenewal: true,
    notes: ''
  });

  useEffect(() => {
    if (subscription) {
      const { id, ...rest } = subscription;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        description: '',
        amount: 0,
        frequency: 'monthly',
        category: 'other',
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: true,
        reminderDays: 7,
        autoRenewal: true,
        notes: ''
      });
    }
  }, [subscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit' : 'Add'} Subscription</DialogTitle>
          <DialogDescription>
            {subscription ? 'Update the subscription details below.' : 'Enter the subscription details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Billing Frequency</Label>
              <Select
                id="frequency"
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as Subscription['frequency'] }))}
                options={[
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly', value: 'yearly' },
                  { label: 'Quarterly', value: 'quarterly' },
                  { label: 'Weekly', value: 'weekly' }
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Subscription['category'] }))}
                options={[
                  { label: 'Software', value: 'software' },
                  { label: 'Streaming', value: 'streaming' },
                  { label: 'Utilities', value: 'utilities' },
                  { label: 'Memberships', value: 'memberships' },
                  { label: 'Other', value: 'other' }
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Subscription['status'] }))}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Canceled', value: 'canceled' },
                  { label: 'Paused', value: 'paused' },
                  { label: 'Past Due', value: 'past_due' }
                ]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                id="startDate"
                value={new Date(formData.startDate)}
                onChange={(date) => setFormData(prev => ({ ...prev, startDate: date.toISOString() }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nextBillingDate">Next Billing Date</Label>
              <DatePicker
                id="nextBillingDate"
                value={new Date(formData.nextBillingDate)}
                onChange={(date) => setFormData(prev => ({ ...prev, nextBillingDate: date.toISOString() }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder Enabled</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified before renewal
                </div>
              </div>
              <Switch
                checked={formData.reminderEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminderEnabled: checked }))}
              />
            </div>

            {formData.reminderEnabled && (
              <div className="grid gap-2">
                <Label htmlFor="reminderDays">Reminder Days Before</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Renewal</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically renew subscription
                </div>
              </div>
              <Switch
                checked={formData.autoRenewal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRenewal: checked }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {subscription ? 'Update' : 'Add'} Subscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 