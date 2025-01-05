'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NexusDashboard } from '@/components/views/dashboard/NexusDashboard';
import { NexusGuardDashboard } from '@/components/views/dashboard/NexusGuardDashboard';

export default function NexusPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Nexus Control Center</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Nexus Dashboard</TabsTrigger>
          <TabsTrigger value="guard">Nexus Guard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <NexusDashboard />
        </TabsContent>
        
        <TabsContent value="guard" className="space-y-6">
          <NexusGuardDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
} 