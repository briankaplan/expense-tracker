'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category: string;
  nextBilling: string;
  type: 'business' | 'personal';
}

// Placeholder data - replace with actual data from your backend
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Adobe Creative Cloud',
    amount: 52.99,
    frequency: 'monthly',
    category: 'Software',
    nextBilling: '2024-02-01',
    type: 'business',
  },
  {
    id: '2',
    name: 'Spotify',
    amount: 9.99,
    frequency: 'monthly',
    category: 'Entertainment',
    nextBilling: '2024-02-05',
    type: 'personal',
  },
];

export function SubscriptionsView() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [selectedType, setSelectedType] = useState<'all' | 'business' | 'personal'>('all');

  const filteredSubscriptions = selectedType === 'all'
    ? subscriptions
    : subscriptions.filter(sub => sub.type === selectedType);

  const totalMonthly = filteredSubscriptions
    .filter(sub => sub.frequency === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const totalYearly = filteredSubscriptions
    .filter(sub => sub.frequency === 'yearly')
    .reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as typeof selectedType)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
          <Button>Add Subscription</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Yearly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalYearly)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <div className="font-medium">{subscription.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {subscription.category} • {subscription.frequency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(subscription.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {subscription.frequency.slice(0, -2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 