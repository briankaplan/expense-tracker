'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTeller } from '@/lib/providers/TellerProvider';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function SettingsPage() {
  const { 
    isConnected, 
    reconnect, 
    disconnect, 
    resync, 
    isSyncing,
    autoSyncEnabled,
    toggleAutoSync,
    lastSynced 
  } = useTeller();

  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement CSV upload
      toast.success('CSV file uploaded successfully');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement data export
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      localStorage.clear();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="bank" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank">Bank Connection</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Connection Settings</CardTitle>
              <CardDescription>
                Manage your bank connection and synchronization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Connection Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <Button
                  variant={isConnected ? "destructive" : "default"}
                  onClick={isConnected ? disconnect : reconnect}
                >
                  {isConnected ? 'Disconnect' : 'Connect Bank'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto-Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync transactions daily
                  </p>
                </div>
                <Switch
                  checked={autoSyncEnabled}
                  onCheckedChange={toggleAutoSync}
                  disabled={!isConnected}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Manual Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Sync transactions now
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={resync}
                  disabled={!isConnected || isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export</CardTitle>
              <CardDescription>
                Import transactions from CSV or export your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csvFile">Import CSV</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your transaction data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Clear Cache</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear local storage and cached data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleClearCache}
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing...' : 'Clear Cache'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Connect with external services and plugins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Gmail Plugin</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically scan emails for receipts
                  </p>
                </div>
                <Button variant="outline">Connect Gmail</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dropbox Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Backup receipts to Dropbox
                  </p>
                </div>
                <Button variant="outline">Connect Dropbox</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Apple Shortcuts</h3>
                  <p className="text-sm text-muted-foreground">
                    Download iOS shortcuts for quick expense tracking
                  </p>
                </div>
                <Button variant="outline">Get Shortcuts</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API keys and settings for various services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="openai">OpenAI API Key</Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="sk-..."
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="google">Google Cloud API Key</Label>
                <Input
                  id="google"
                  type="password"
                  placeholder="Enter API key"
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="mindee">Mindee API Key</Label>
                <Input
                  id="mindee"
                  type="password"
                  placeholder="Enter API key"
                />
              </div>

              <Button className="mt-4">Save API Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your expenses
                  </p>
                </div>
                <Switch />
              </div>

              <Button className="mt-4">Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 