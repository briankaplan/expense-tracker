'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Line } from 'react-chartjs-2';
import { Terminal } from '@/components/ui/terminal';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import { defaultOptions } from '@/lib/chart';
import '@/lib/chart-setup';

interface SystemMetrics {
  responseTime: number[];
  errorRate: number[];
  memoryUsage: number[];
  timestamps: string[];
}

interface SystemState {
  monitor: {
    performance?: {
      responseTime: number;
      errorRate: number;
    };
    status: string;
  };
}

interface SystemAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export function Dashboard() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    responseTime: [],
    errorRate: [],
    memoryUsage: [],
    timestamps: []
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Simulated metrics updates
    const interval = setInterval(() => {
      updateMetrics({
        monitor: {
          performance: {
            responseTime: Math.random() * 100,
            errorRate: Math.random() * 0.1
          },
          status: 'healthy'
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = (state: SystemState) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemState(state);
    setMetrics(prev => ({
      responseTime: [...prev.responseTime, state.monitor.performance?.responseTime || 0].slice(-20),
      errorRate: [...prev.errorRate, state.monitor.performance?.errorRate || 0].slice(-20),
      memoryUsage: [...prev.memoryUsage, Math.random() * 100].slice(-20),
      timestamps: [...prev.timestamps, timestamp].slice(-20)
    }));
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const startSystem = async () => {
    setIsRunning(true);
    addLog('🚀 System started');
  };

  const stopSystem = async () => {
    setIsRunning(false);
    addLog('🛑 System stopped');
  };

  const runDiagnostics = async () => {
    addLog('🔍 Running system diagnostics');
    // Simulate diagnostics
    setTimeout(() => {
      addLog('✅ Diagnostics completed');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className={isRunning ? "text-green-500" : "text-red-500"} size={24} />
          <h2 className="text-xl font-bold">System Status</h2>
        </div>
        <div className="space-x-4">
          <Button
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? stopSystem : startSystem}
          >
            {isRunning ? '🛑 Stop System' : '🚀 Start System'}
          </Button>
          <Button variant="outline" onClick={runDiagnostics}>
            🔍 Run Diagnostics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {isRunning ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <Clock className="text-yellow-500" />
              )}
              <span>{isRunning ? 'Running' : 'Stopped'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertCircle className={alerts.length > 0 ? "text-red-500" : "text-green-500"} />
              <span>{alerts.length} alerts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemState?.monitor.performance?.responseTime.toFixed(2) || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((systemState?.monitor.performance?.errorRate || 0) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                options={defaultOptions}
                data={{
                  labels: metrics.timestamps,
                  datasets: [{
                    label: 'Response Time (ms)',
                    data: metrics.responseTime,
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

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                options={defaultOptions}
                data={{
                  labels: metrics.timestamps,
                  datasets: [{
                    label: 'Error Rate (%)',
                    data: metrics.errorRate.map(rate => rate * 100),
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
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4" />
            <CardTitle>System Logs</CardTitle>
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