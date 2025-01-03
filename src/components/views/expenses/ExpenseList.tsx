'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/src/components/ui/DataTable';
import { Badge } from '@/src/components/ui/Badge';
import { formatCurrency, formatDate } from '@/src/lib/utils';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'matched' | 'unmatched';
}

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.getValue('amount'))
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge 
          variant={
            status === 'matched' ? 'success' : 
            status === 'unmatched' ? 'error' : 
            'warning'
          }
        >
          {status}
        </Badge>
      );
    }
  }
];

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <DataTable 
      columns={columns} 
      data={expenses}
    />
  );
} 