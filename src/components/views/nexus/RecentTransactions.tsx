'use client';

import { useEffect, useState } from 'react';
import { useNexusMonitor } from '@/nexus/hooks';
import { Transaction } from '@/nexus/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const monitor = useNexusMonitor('transactions');

  useEffect(() => {
    const unsubscribe = monitor.subscribe((data) => {
      setTransactions(data.slice(0, 10)); // Show last 10 transactions
    });

    return () => unsubscribe();
  }, [monitor]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'}>
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 