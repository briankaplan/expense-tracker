'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal } from '@/components/ui/terminal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertCircle, Lock, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { defaultOptions } from '@/lib/chart';
import '@/lib/chart-setup';

interface GuardMetrics {
  threats: number[];
  backups: number[];
  timestamps: string[];
}

export function NexusGuardDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<GuardMetrics>({
    threats: [],
    backups: [],
    timestamps: []
  });

  useEffect(() => {
    // Simulated metrics updates
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      setMetrics(prev => ({
        threats: [...prev.threats, Math.floor(Math.random() * 5)].slice(-20),
        backups: [...prev.backups, Math.floor(Math.random() * 10)].slice(-20),
        timestamps: [...prev.timestamps, timestamp].slice(-20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const activateGuard = () => {
    setIsActive(true);
    addLog('🛡️ Nexus Guard activated');
  };

  const deactivateGuard = () => {
    setIsActive(false);
    addLog('⚠️ Nexus Guard deactivated');
  };

  const runBackup = () => {
    addLog('💾 Initiating backup...');
    setTimeout(() => {
      addLog('✅ Backup completed successfully');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className={isActive ? "text-green-500" : "text-red-500"} size={24} />
          <h2 className="text-xl font-bold">Guard Status</h2>
        </div>
        <div className="space-x-4">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={isActive ? deactivateGuard : activateGuard}
          >
            {isActive ? '🛑 Deactivate Guard' : '🛡️ Activate Guard'}
          </Button>
          <Button variant="outline" onClick={runBackup}>
            💾 Run Backup
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Guard Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Lock className={isActive ? "text-green-500" : "text-red-500"} />
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threats Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.threats.reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backups Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.backups.reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Threat Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                options={defaultOptions}
                data={{
                  labels: metrics.timestamps,
                  datasets: [{
                    label: 'Threats Blocked',
                    data: metrics.threats,
                    borderColor: 'hsl(var(--destructive))',
                    backgroundColor: 'hsl(var(--destructive) / 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                options={defaultOptions}
                data={{
                  labels: metrics.timestamps,
                  datasets: [{
                    label: 'Backups Created',
                    data: metrics.backups,
                    borderColor: 'hsl(var(--primary))',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4" />
            <CardTitle>Guard Logs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <div className="p-4 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 