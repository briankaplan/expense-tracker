'use client';

import { useNexus } from '@/contexts/NexusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SystemStatus() {
  const { state } = useNexus();
  const { systemStatus } = state;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Status: {systemStatus.initialized ? '✅ Active' : '❌ Inactive'}</p>
          <p>Last Check: {new Date(systemStatus.lastCheck).toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4">
            {systemStatus.activeFeatures.map((feature: string) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4">
            {systemStatus.pendingTasks.map((task: string) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 