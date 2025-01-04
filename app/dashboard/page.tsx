'use client';

import { DashboardView } from '@/components/views/dashboard/DashboardView';
import { useExpenses } from '@/lib/hooks/useExpenses';

export default function DashboardPage() {
  const { expenses } = useExpenses();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardView expenses={expenses} />
    </div>
  );
} 