'use client';

import { useState } from 'react';
import GmailSettings from '@/components/views/settings/GmailSettings';
import { GmailReceiptsDialog } from '@/components/views/receipts/GmailReceiptsDialog';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { 
  Bell,
  Moon,
  Sun,
  Tags,
  CreditCard,
  Settings as SettingsIcon,
  Github,
  Download,
  Upload,
  Database,
  Link,
  Smartphone,
  Building2,
  Building as Bank,
  Cloud as CloudSync
} from 'lucide-react';

export default function SettingsPage() {
  const [foundReceipts, setFoundReceipts] = useState<any[]>([]);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [defaultCurrency, setDefaultCurrency] = useState(() => {
    return localStorage.getItem('default_currency') || 'USD';
  });
  const [tellerConnected, setTellerConnected] = useState(() => {
    return localStorage.getItem('teller_connected') === 'true';
  });
  const [dropboxConnected, setDropboxConnected] = useState(() => {
    return localStorage.getItem('dropbox_connected') === 'true';
  });
  const [autoBackup, setAutoBackup] = useState(() => {
    return localStorage.getItem('auto_backup') === 'true';
  });
  const [githubConnected, setGithubConnected] = useState(() => {
    return localStorage.getItem('github_connected') === 'true';
  });
  const [vercelConnected, setVercelConnected] = useState(() => {
    return localStorage.getItem('vercel_connected') === 'true';
  });
  const [netsuiteConnected, setNetsuiteConnected] = useState(() => {
    return localStorage.getItem('netsuite_connected') === 'true';
  });
  const [apiEnabled, setApiEnabled] = useState(() => {
    return localStorage.getItem('api_enabled') === 'true';
  });
  const [pwaInstalled, setPwaInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches;
    }
    return false;
  });

  const handleReceiptsFound = (receipts: any[]) => {
    setFoundReceipts(receipts);
    setShowReceiptsDialog(true);
  };

  const handleImportReceipts = async (receipts: any[]) => {
    console.log('Importing receipts:', receipts);
  };

  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    document.documentElement.classList.toggle('dark', enabled);
    toast({
      title: enabled ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: "Your display preferences have been updated."
    });
  };

  const handleTellerConnect = async () => {
    try {
      // TODO: Implement Teller Connect flow
      setTellerConnected(true);
      localStorage.setItem('teller_connected', 'true');
      toast({
        title: "Bank Account Connected",
        description: "Successfully connected your bank account via Teller."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to your bank account. Please try again."
      });
    }
  };

  const handleDropboxConnect = async () => {
    try {
      // TODO: Implement Dropbox OAuth flow
      setDropboxConnected(true);
      localStorage.setItem('dropbox_connected', 'true');
      toast({
        title: "Dropbox Connected",
        description: "Successfully connected your Dropbox account for backups."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to Dropbox. Please try again."
      });
    }
  };

  const handleAutoBackupChange = (enabled: boolean) => {
    setAutoBackup(enabled);
    localStorage.setItem('auto_backup', enabled.toString());
    toast({
      title: enabled ? "Auto Backup Enabled" : "Auto Backup Disabled",
      description: enabled 
        ? "Your data will be automatically backed up to Dropbox"
        : "Auto backup has been disabled"
    });
  };

  const handleGithubConnect = async () => {
    try {
      // TODO: Implement GitHub OAuth flow
      setGithubConnected(true);
      localStorage.setItem('github_connected', 'true');
      toast({
        title: "GitHub Connected",
        description: "Successfully connected your GitHub account."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to GitHub. Please try again."
      });
    }
  };

  const handleVercelConnect = async () => {
    try {
      // TODO: Implement Vercel integration
      setVercelConnected(true);
      localStorage.setItem('vercel_connected', 'true');
      toast({
        title: "Vercel Connected",
        description: "Successfully connected your Vercel account."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to Vercel. Please try again."
      });
    }
  };

  const handleNetsuiteConnect = async () => {
    try {
      // TODO: Implement NetSuite integration
      setNetsuiteConnected(true);
      localStorage.setItem('netsuite_connected', 'true');
      toast({
        title: "NetSuite Connected",
        description: "Successfully connected your NetSuite account."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to NetSuite. Please try again."
      });
    }
  };

  const handleApiToggle = (enabled: boolean) => {
    setApiEnabled(enabled);
    localStorage.setItem('api_enabled', enabled.toString());
    toast({
      title: enabled ? "API Access Enabled" : "API Access Disabled",
      description: enabled 
        ? "You can now access your data via the API"
        : "API access has been disabled"
    });
  };

  const generateApiKey = () => {
    // TODO: Implement API key generation
    const key = 'exp_' + Math.random().toString(36).substring(2);
    toast({
      title: "New API Key Generated",
      description: "Your new API key has been created. Make sure to save it securely."
    });
    return key;
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        <GmailSettings onReceiptsFound={handleReceiptsFound} />

        {/* Display Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Display Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Customize how the application looks and feels
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for a better night-time experience
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select
                defaultValue={defaultCurrency}
                onValueChange={(value) => {
                  localStorage.setItem('default_currency', value);
                  setDefaultCurrency(value);
                  toast({
                    title: "Default Currency Updated",
                    description: `Your default currency has been set to ${value}.`
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Banking Integration */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Bank className="h-5 w-5" />
                Banking Integration
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your bank accounts for automatic transaction import
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Teller Connect</Label>
                <p className="text-sm text-muted-foreground">
                  Securely connect your bank accounts
                </p>
              </div>
              {!tellerConnected ? (
                <Button onClick={handleTellerConnect}>
                  Connect Bank
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setTellerConnected(false);
                  localStorage.removeItem('teller_connected');
                }}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Cloud Storage & Backup */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CloudSync className="h-5 w-5" />
                Cloud Storage & Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure cloud storage and automatic backups
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dropbox Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Connect Dropbox for automatic backups
                </p>
              </div>
              {!dropboxConnected ? (
                <Button onClick={handleDropboxConnect}>
                  Connect Dropbox
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setDropboxConnected(false);
                  localStorage.removeItem('dropbox_connected');
                }}>
                  Disconnect
                </Button>
              )}
            </div>

            {dropboxConnected && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data to Dropbox
                  </p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={handleAutoBackupChange}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Developer Integrations */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Link className="h-5 w-5" />
                Developer Integrations
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect development and deployment platforms
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GitHub Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Connect GitHub for version control
                </p>
              </div>
              {!githubConnected ? (
                <Button onClick={handleGithubConnect}>
                  <Github className="mr-2 h-4 w-4" />
                  Connect GitHub
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setGithubConnected(false);
                  localStorage.removeItem('github_connected');
                }}>
                  Disconnect
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vercel Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Connect Vercel for deployments
                </p>
              </div>
              {!vercelConnected ? (
                <Button onClick={handleVercelConnect}>
                  Connect Vercel
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setVercelConnected(false);
                  localStorage.removeItem('vercel_connected');
                }}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Enterprise Integrations */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Enterprise Integrations
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect enterprise systems and export options
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>NetSuite Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Connect NetSuite for expense sync
                </p>
              </div>
              {!netsuiteConnected ? (
                <Button onClick={handleNetsuiteConnect}>
                  Connect NetSuite
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setNetsuiteConnected(false);
                  localStorage.removeItem('netsuite_connected');
                }}>
                  Disconnect
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                defaultValue={localStorage.getItem('export_format') || 'csv'}
                onValueChange={(value) => {
                  localStorage.setItem('export_format', value);
                  toast({
                    title: "Export Format Updated",
                    description: `Reports will now be exported in ${value.toUpperCase()} format.`
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* API Access */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Database className="h-5 w-5" />
                API Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage API access and keys
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable API Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow external applications to access your data
                </p>
              </div>
              <Switch
                checked={apiEnabled}
                onCheckedChange={handleApiToggle}
              />
            </div>

            {apiEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>API Key</Label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const key = generateApiKey();
                      // TODO: Save and display API key
                    }}
                  >
                    Generate New Key
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this key to authenticate API requests
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Mobile App */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile App
              </h3>
              <p className="text-sm text-muted-foreground">
                Install and manage mobile app settings
              </p>
            </div>

            {!pwaInstalled && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Install App</Label>
                  <p className="text-sm text-muted-foreground">
                    Install as a Progressive Web App
                  </p>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Apple Shortcuts</Label>
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Shortcut
              </Button>
              <p className="text-sm text-muted-foreground">
                Add expenses quickly using Apple Shortcuts
              </p>
            </div>
          </div>
        </Card>
      </div>

      <GmailReceiptsDialog
        open={showReceiptsDialog}
        onOpenChange={setShowReceiptsDialog}
        receipts={foundReceipts}
        onImport={handleImportReceipts}
      />
    </div>
  );
} 