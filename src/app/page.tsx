import { type Metadata } from 'next';
import { DashboardView } from '@/components/views/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your expenses and recent activity'
};

export default function HomePage() {
  return (
    <div className="container mx-auto py-6">
      <DashboardView />
    </div>
  );
} 