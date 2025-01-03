import { type Metadata } from 'next';
import { ExpenseManagerView } from '@/src/components/views/expenses/ExpenseManagerView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track and manage your expenses'
};

// TODO: Replace with real data fetching
const mockExpenses = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Grocery Shopping',
    amount: 125.50,
    category: 'Food',
    status: 'matched' as const
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Gas Station',
    amount: 45.00,
    category: 'Transportation',
    status: 'pending' as const
  }
];

export default function HomePage() {
  return (
    <div className="container mx-auto py-6">
      <ExpenseManagerView expenses={mockExpenses} />
    </div>
  );
} 