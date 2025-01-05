'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type Subscription, type SubscriptionCategory, type SubscriptionFrequency } from '@/types/subscriptions';
import { Plus, Calendar, Bell, CreditCard, Filter, Search } from 'lucide-react';
import { SubscriptionDialog } from './SubscriptionDialog';

export function SubscriptionsView() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<SubscriptionFrequency | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all'>('active');

  // Calculate totals
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    switch (sub.frequency) {
      case 'monthly':
        return sum + sub.amount;
      case 'yearly':
        return sum + (sub.amount / 12);
      case 'quarterly':
        return sum + (sub.amount / 3);
      case 'weekly':
        return sum + (sub.amount * 4.33); // Average weeks per month
      default:
        return sum;
    }
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = searchQuery === '' ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesFrequency = frequencyFilter === 'all' || sub.frequency === frequencyFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesFrequency && matchesStatus;
  });

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'name',
      header: 'Subscription',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.metadata?.logo && (
            <img
              src={row.original.metadata.logo}
              alt={row.original.name}
              className="w-6 h-6 rounded"
            />
          )}
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground">{row.original.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{formatCurrency(row.original.amount)}</span>
          <span className="text-sm text-muted-foreground">per {row.original.frequency}</span>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.category}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'active' ? 'success' :
          row.original.status === 'canceled' ? 'destructive' :
          row.original.status === 'paused' ? 'warning' :
          'secondary'
        }>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'nextBillingDate',
      header: 'Next Billing',
      cell: ({ row }) => formatDate(row.original.nextBillingDate)
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubscription(row.original)}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  const handleAddSubscription = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSubscriptions(prev => [newSubscription, ...prev]);
  };

  const handleUpdateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage your recurring expenses and subscriptions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Spend
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscriptions.length} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yearly Spend
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Projected annual cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Renewals
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSubscriptions.filter(sub => {
                const daysUntilRenewal = Math.ceil(
                  (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysUntilRenewal <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in the next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex gap-2">
              <Search className="h-4 w-4 text-muted-foreground mt-3" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Software', value: 'software' },
                { label: 'Streaming', value: 'streaming' },
                { label: 'Utilities', value: 'utilities' },
                { label: 'Memberships', value: 'memberships' },
                { label: 'Other', value: 'other' }
              ]}
            />
            <Select
              value={frequencyFilter}
              onValueChange={(value) => setFrequencyFilter(value as typeof frequencyFilter)}
              options={[
                { label: 'All Frequencies', value: 'all' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
                { label: 'Quarterly', value: 'quarterly' },
                { label: 'Weekly', value: 'weekly' }
              ]}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Active Only', value: 'active' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredSubscriptions}
            pageSize={10}
          />
        </CardContent>
      </Card>

      <SubscriptionDialog
        open={showAddDialog || selectedSubscription !== null}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onSubmit={(data) => {
          if (selectedSubscription) {
            handleUpdateSubscription(selectedSubscription.id, data);
          } else {
            handleAddSubscription(data);
          }
        }}
      />
    </div>
  );
} 