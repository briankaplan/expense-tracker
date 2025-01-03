import { Metadata } from 'next';
import { DashboardLayout } from '@/components/views/nexus/DashboardLayout';
import { NexusProvider } from '@/contexts/NexusContext';

export const metadata: Metadata = {
  title: 'Nexus Dashboard',
  description: 'Development control center'
};

export default function NexusDashboard() {
  return (
    <NexusProvider>
      <DashboardLayout />
    </NexusProvider>
  );
} 