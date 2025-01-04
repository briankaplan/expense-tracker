import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle,
  Code,
  FileText,
  GitBranch,
  Lock,
  MessageSquare,
  RefreshCcw,
  Shield,
  Terminal,
  Zap
} from 'lucide-react';

export default function NexusBrainDashboard() {
  const [activeConversation, setActiveConversation] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    monitor: {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      alerts: []
    },
    security: {
      status: 'secure',
      lastAudit: new Date().toISOString(),
      threats: 0
    },
    autofix: {
      running: false,
      lastFix: null,
      queuedFixes: []
    }
  });

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
            <Badge variant="secondary">Active</Badge>
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
          <Button className="w-full" variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Force Sync
          </Button>
          <Button className="w-full" variant="outline" size="sm">
            <Terminal className="w-4 h-4 mr-2" />
            Run Diagnostics
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
                Brain Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Brain className="w-4 h-4" />
                <span className="text-2xl font-bold text-green-500">98%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Security Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Lock className="w-4 h-4" />
                <span className="text-2xl font-bold text-blue-500">High</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Auto-fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Zap className="w-4 h-4" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                AI Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Code className="w-4 h-4" />
                <span className="text-2xl font-bold">156</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Area */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-brain">AI Brain</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="auto-fix">Auto-Fix</TabsTrigger>
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
                      <Input placeholder="Ask Nexus anything..." />
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent System Events */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span>Auto-fix completed successfully</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>New pattern detected</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Security audit completed</span>
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
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Pattern optimization suggested for expense categorization
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Brain className="w-4 h-4" />
                        <AlertDescription>
                          New receipt matching algorithm ready for deployment
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-brain">
              <div className="grid grid-cols-2 gap-4">
                {/* AI Learning Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add AI learning visualization */}
                  </CardContent>
                </Card>

                {/* Pattern Recognition */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Recognition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add pattern recognition stats */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Add content for other tabs */}
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
                <span>32%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Activity className="w-4 h-4" />
                <span>2.4GB</span>
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
                <span>45ms</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Processes */}
        <div className="space-y-2">
          <h3 className="font-medium">Active Processes</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">AI Core</span>
              <Badge>Running</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">Auto-Fix</span>
              <Badge>Active</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <span className="text-sm">Security</span>
              <Badge>Monitoring</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}