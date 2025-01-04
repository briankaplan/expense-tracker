import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useBankAccounts } from '@/lib/hooks/useBankAccounts';
import { useTeller } from '@/lib/hooks/useTeller';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bank } from '@/components/icons/bank';

export function BankAccountSettings() {
  const {
    openTellerConnect,
    reconnect,
    resync,
    disconnect,
    isConnected,
    enrollment,
    lastSynced,
    isSyncing,
    autoSyncEnabled,
    toggleAutoSync,
  } = useTeller();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bank Accounts</h2>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and sync settings
          </p>
        </div>
        <Button onClick={openTellerConnect}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Connected Accounts */}
        {enrollment?.accounts?.map((account: any) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {account.institution.name}
                </CardTitle>
                <CardDescription>
                  {account.name} •••• {account.last4}
                </CardDescription>
              </div>
              <Bank className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Last synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resync()}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => disconnect()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Auto-Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure how your bank accounts sync with your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Daily Sync</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically sync your transactions every day
                </div>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSyncEnabled}
                onCheckedChange={toggleAutoSync}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 