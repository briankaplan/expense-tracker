'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpenseMetrics } from './ExpenseMetrics';
import { RecentTransactions } from './RecentTransactions';
import { SpendingTrends } from './SpendingTrends';
import { SubscriptionOverview } from './SubscriptionOverview';

export function DashboardLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your financial command center. Monitor your expenses, track subscriptions, and analyze spending patterns.
        </p>
      </div>

      <ExpenseMetrics />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <ScrollArea className="h-[400px]">
            <RecentTransactions />
          </ScrollArea>
        </Card>
        
        <Card className="col-span-3">
          <ScrollArea className="h-[400px]">
            <SpendingTrends />
          </ScrollArea>
        </Card>
      </div>

      <Card>
        <ScrollArea className="h-[300px]">
          <SubscriptionOverview />
        </ScrollArea>
      </Card>
    </div>
  );
} 