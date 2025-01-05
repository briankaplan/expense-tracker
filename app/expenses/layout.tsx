import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Track and manage your expenses'
};

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 