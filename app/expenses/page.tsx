import { type Metadata } from 'next';
import { ExpenseManagerView } from '@/src/components/views/expenses/ExpenseManagerView';

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Manage and track your expenses'
};

// TODO: Replace with real data fetching
const mockExpenses = [
  {
    id: '1',
    date: '2024-01-01',
    description: 'Grocery Shopping',
    amount: 125.50,
    category: 'Food',
    status: 'matched' as const
  },
  {
    id: '2',
    date: '2024-01-02',
    description: 'Gas Station',
    amount: 45.00,
    category: 'Transportation',
    status: 'pending' as const
  },
  {
    id: '3',
    date: '2024-01-03',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    status: 'unmatched' as const
  }
];

export default function ExpensesPage() {
  return (
    <div className="container mx-auto py-6">
      <ExpenseManagerView expenses={mockExpenses} />
    </div>
  );
} 