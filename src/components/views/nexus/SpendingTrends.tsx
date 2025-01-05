'use client';

import { useEffect, useState } from 'react';
import { useNexusAnalytics } from '@/nexus/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingData {
  date: string;
  amount: number;
}

export function SpendingTrends() {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const analytics = useNexusAnalytics('spending-trends');

  useEffect(() => {
    const unsubscribe = analytics.subscribe((data) => {
      const formattedData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: item.amount,
      }));
      setSpendingData(formattedData);
    });

    return () => unsubscribe();
  }, [analytics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 