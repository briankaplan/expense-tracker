import { ReportsView } from '@/components/views/reports/ReportsView';

export const metadata = {
  title: 'Reports | Expense Manager',
  description: 'View and manage your expense reports',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <ReportsView />
    </div>
  );
} 