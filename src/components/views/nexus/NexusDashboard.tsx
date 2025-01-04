import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNexus } from '@/hooks/useNexus';
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle,
  Code,
  FileText,
  GitBranch,
  Lock,
  Mail,
  MessageSquare,
  Package,
  RefreshCcw,
  Settings,
  Shield,
  Terminal,
  Upload,
  Wrench,
  Zap
} from 'lucide-react';

const NexusDashboard = () => {
  const { status, error, isMonitoring, actions } = useNexus();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeConversation, setActiveConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoFixQueue, setAutoFixQueue] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    apiLatency: 0
  });

  // Handle AI interaction
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    setActiveConversation(prev => [...prev, { type: 'user', content: userInput }]);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response
      setActiveConversation(prev => [...prev, {
        type: 'ai',
        content: `Processing your request: "${userInput}". Analyzing system state...`
      }]);

      // Trigger auto-fix if needed
      if (userInput.toLowerCase().includes('fix') || userInput.toLowerCase().includes('repair')) {
        await handleRunAutoFix();
      }

      setUserInput('');
    } catch (error) {
      console.error('Error processing message:', error);
      setActiveConversation(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced auto-fix handler
  const handleRunAutoFix = async () => {
    try {
      setAutoFixQueue(prev => [...prev, {
        id: Date.now(),
        type: 'system-repair',
        status: 'pending'
      }]);

      await actions.autoFix();

      setActiveConversation(prev => [...prev, {
        type: 'ai',
        content: 'Auto-fix completed successfully. System optimizations applied.'
      }]);

      // Update auto-fix queue
      setAutoFixQueue(prev => prev.map(fix => 
        fix.type === 'system-repair' ? { ...fix, status: 'completed' } : fix
      ));
    } catch (error) {
      console.error('Auto-fix error:', error);
      setActiveConversation(prev => [...prev, {
        type: 'ai',
        content: 'Auto-fix encountered an error. Please check the system logs.'
      }]);
    }
  };

  // Monitor system metrics
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 8,
        apiLatency: Math.random() * 200
      });
    };

    const metricsInterval = setInterval(updateMetrics, 5000);
    return () => clearInterval(metricsInterval);
  }, []);

  // Handle keyboard submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSyncAll = async () => {
    await actions.syncAll();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - System Status */}
      <div className="w-64 border-r p-4 space-y-4">
        <h2 className="text-lg font-bold">Nexus Brain</h2>
        
        {/* System Status Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              <span>System</span>
            </div>
            <Badge variant={isMonitoring ? "secondary" : "destructive"}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              <span>AI Core</span>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              <span>Security</span>
            </div>
            <Badge variant="secondary">Secure</Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            variant="outline" 
            size="sm"
            onClick={handleSyncAll}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Force Sync
          </Button>
          <Button 
            className="w-full" 
            variant="outline" 
            size="sm"
            onClick={handleRunAutoFix}
          >
            <Terminal className="w-4 h-4 mr-2" />
            Run Auto-Fix
          </Button>
          <Button className="w-full" variant="outline" size="sm">
            <GitBranch className="w-4 h-4 mr-2" />
            View Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Stats Bar */}
        <div className="border-b p-4 grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Expense Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <GitBranch className="w-4 h-4" />
                <span className={`text-2xl font-bold ${status?.expenses.syncing ? 'text-green-500' : 'text-yellow-500'}`}>
                  {status?.expenses.pendingCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Receipt Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <FileText className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {status?.receipts.unmatchedCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Email Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Mail className="w-4 h-4" />
                <span className={`text-2xl font-bold ${status?.email.connected ? 'text-green-500' : 'text-red-500'}`}>
                  {status?.email.unprocessedCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Upload className="w-4 h-4" />
                <span className="text-2xl font-bold">
                  {status?.backups.pendingCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Area */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai">AI Brain</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="autofix">Auto-Fix</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* AI Assistant Interface */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] border rounded-lg p-4 mb-4 overflow-y-auto space-y-4">
                      {activeConversation.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ask Nexus anything..." 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isProcessing}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4 mr-2" />
                        )}
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-4">
                          <GitBranch className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Expense Sync</p>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {status?.expenses.lastSync ? new Date(status.expenses.lastSync).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <span className={status?.expenses.syncing ? 'text-green-500' : 'text-yellow-500'}>
                          {status?.expenses.syncing ? 'Active' : 'Idle'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Receipt Processing</p>
                            <p className="text-sm text-muted-foreground">
                              {status?.receipts.processing ? 'Processing receipts' : 'Idle'}
                            </p>
                          </div>
                        </div>
                        <span className={status?.receipts.processing ? 'text-green-500' : 'text-yellow-500'}>
                          {status?.receipts.processing ? 'Active' : 'Idle'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Mail className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Email Integration</p>
                            <p className="text-sm text-muted-foreground">
                              {status?.email.unprocessedCount} emails pending
                            </p>
                          </div>
                        </div>
                        <span className={status?.email.connected ? 'text-green-500' : 'text-red-500'}>
                          {status?.email.connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <Brain className="w-4 h-4" />
                        <AlertDescription>
                          Pattern optimization suggested for expense categorization
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Zap className="w-4 h-4" />
                        <AlertDescription>
                          New receipt matching algorithm ready for deployment
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other tabs content would go here */}
            <TabsContent value="ai">AI Brain Content</TabsContent>
            <TabsContent value="security">Security Content</TabsContent>
            <TabsContent value="autofix">Auto-Fix Content</TabsContent>
            <TabsContent value="monitor">Monitor Content</TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Live Monitoring */}
      <div className="w-64 border-l p-4 space-y-4">
        <h2 className="text-lg font-bold">Live Monitor</h2>
        
        {/* Live Metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="w-4 h-4" />
                <span>{systemMetrics.cpuUsage.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="w-4 h-4" />
                <span>{systemMetrics.memoryUsage.toFixed(1)}GB</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="w-4 h-4" />
                <span>{systemMetrics.apiLatency.toFixed(0)}ms</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Fix Queue */}
        {autoFixQueue.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Auto-Fix Queue</h3>
            <div className="space-y-1">
              {autoFixQueue.map(fix => (
                <div key={fix.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm">{fix.type}</span>
                  <Badge variant={fix.status === 'completed' ? "success" : "secondary"}>
                    {fix.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Processes */}
        <div className="space-y-2">
          <h3 className="font-medium">Active Processes</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">Expense Sync</span>
              <Badge variant={status?.expenses.syncing ? "default" : "secondary"}>
                {status?.expenses.syncing ? 'Running' : 'Idle'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">Receipt Processing</span>
              <Badge variant={status?.receipts.processing ? "default" : "secondary"}>
                {status?.receipts.processing ? 'Active' : 'Idle'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">Email Integration</span>
              <Badge variant={status?.email.connected ? "default" : "destructive"}>
                {status?.email.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'An error occurred while monitoring the system'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default NexusDashboard; 