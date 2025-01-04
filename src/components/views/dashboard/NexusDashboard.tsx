import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chart } from 'react-chartjs-2';
import { Terminal } from '@/components/ui/Terminal';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AlertCircle, CheckCircle, Clock, Settings, Shield } from 'lucide-react';
import { NexusGuardDashboard } from './NexusGuardDashboard';
import { defaultOptions } from '@/lib/chart';

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

export function NexusDashboard() {
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
        addLog('🚀 Nexus system started');
    };

    const stopSystem = async () => {
        setIsRunning(false);
        addLog('🛑 Nexus system stopped');
    };

    const runDiagnostics = async () => {
        addLog('🔍 Running system diagnostics');
        // Simulate diagnostics
        setTimeout(() => {
            addLog('✅ Diagnostics completed');
        }, 2000);
    };

    const clearAlerts = () => {
        setAlerts([]);
        addLog('🧹 Alerts cleared');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Nexus System Dashboard</h1>
                <div className="space-x-4">
                    <Button
                        variant={isRunning ? "destructive" : "default"}
                        onClick={isRunning ? stopSystem : startSystem}
                    >
                        {isRunning ? '🛑 Stop System' : '🚀 Start System'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={runDiagnostics}
                        disabled={!isRunning}
                    >
                        🔍 Run Diagnostics
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                    <h3 className="font-semibold mb-2">System Status</h3>
                    <div className="flex items-center space-x-2">
                        {isRunning ? (
                            <CheckCircle className="text-green-500" />
                        ) : (
                            <Clock className="text-yellow-500" />
                        )}
                        <span>{isRunning ? 'Running' : 'Stopped'}</span>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Active Alerts</h3>
                    <div className="flex items-center space-x-2">
                        <AlertCircle className={alerts.length > 0 ? "text-red-500" : "text-green-500"} />
                        <span>{alerts.length} alerts</span>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Response Time</h3>
                    <div className="text-2xl font-bold">
                        {systemState?.monitor.performance?.responseTime.toFixed(2) || 0}ms
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-2">Error Rate</h3>
                    <div className="text-2xl font-bold">
                        {((systemState?.monitor.performance?.errorRate || 0) * 100).toFixed(2)}%
                    </div>
                </Card>
            </div>

            <Tabs defaultValue="metrics">
                <TabsList>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="guard">
                        <div className="flex items-center space-x-2">
                            <Shield size={16} />
                            <span>Guard</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="metrics" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Response Time Trend</h3>
                            <div className="h-[300px]">
                                <Chart
                                    type="line"
                                    options={defaultOptions}
                                    data={{
                                        labels: metrics.timestamps,
                                        datasets: [{
                                            label: 'Response Time (ms)',
                                            data: metrics.responseTime,
                                            borderColor: 'rgb(59, 130, 246)',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            fill: true,
                                            tension: 0.4
                                        }]
                                    }}
                                />
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Error Rate Trend</h3>
                            <div className="h-[300px]">
                                <Chart
                                    type="line"
                                    options={defaultOptions}
                                    data={{
                                        labels: metrics.timestamps,
                                        datasets: [{
                                            label: 'Error Rate (%)',
                                            data: metrics.errorRate.map(rate => rate * 100),
                                            borderColor: 'rgb(239, 68, 68)',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            fill: true,
                                            tension: 0.4
                                        }]
                                    }}
                                />
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">Memory Usage</h3>
                            <div className="h-[300px]">
                                <Chart
                                    type="line"
                                    options={defaultOptions}
                                    data={{
                                        labels: metrics.timestamps,
                                        datasets: [{
                                            label: 'Memory Usage (MB)',
                                            data: metrics.memoryUsage,
                                            borderColor: 'rgb(16, 185, 129)',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            fill: true,
                                            tension: 0.4
                                        }]
                                    }}
                                />
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-2">System Health</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="capitalize">Status</span>
                                    <Badge variant="success">
                                        Healthy
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="capitalize">Load</span>
                                    <Badge variant="success">
                                        Normal
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="capitalize">Network</span>
                                    <Badge variant="success">
                                        Stable
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card>
                        <div className="p-4 flex justify-between items-center">
                            <h3 className="font-semibold">Active Alerts</h3>
                            <Button variant="outline" size="sm" onClick={clearAlerts}>
                                Clear All
                            </Button>
                        </div>
                        <ScrollArea className="h-[400px]">
                            <div className="p-4 space-y-2">
                                {alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${
                                            alert.severity === 'high'
                                                ? 'border-red-200 bg-red-50'
                                                : alert.severity === 'medium'
                                                ? 'border-yellow-200 bg-yellow-50'
                                                : 'border-blue-200 bg-blue-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{alert.type}</h4>
                                                <p className="text-sm text-gray-600">{alert.message}</p>
                                            </div>
                                            <Badge variant={
                                                alert.severity === 'high'
                                                    ? 'destructive'
                                                    : alert.severity === 'medium'
                                                    ? 'warning'
                                                    : 'info'
                                            }>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="logs">
                    <Card>
                        <Terminal className="h-[400px]">
                            {logs.map((log, index) => (
                                <div key={index} className="font-mono text-sm">
                                    {log}
                                </div>
                            ))}
                        </Terminal>
                    </Card>
                </TabsContent>

                <TabsContent value="guard">
                    <NexusGuardDashboard />
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">System Settings</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Health Check Interval
                                    </label>
                                    <select className="w-full border rounded-md p-2">
                                        <option value="300000">5 minutes</option>
                                        <option value="600000">10 minutes</option>
                                        <option value="900000">15 minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Alert Threshold
                                    </label>
                                    <select className="w-full border rounded-md p-2">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Auto-fix Settings
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        Enable automatic fixes
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        Create backups before fixes
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-2" />
                                        Send notifications on fixes
                                    </label>
                                </div>
                            </div>
                            <Button className="w-full">
                                Save Settings
                            </Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 