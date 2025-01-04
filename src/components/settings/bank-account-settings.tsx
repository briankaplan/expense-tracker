import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BankAccount {
  id: string;
  name: string;
  institution: string;
  lastSync?: string;
}

export function BankAccountSettings() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Implement bank connection logic here
    } catch (error) {
      console.error('Failed to connect bank:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (accountId: string) => {
    try {
      // Implement sync logic here
    } catch (error) {
      console.error('Failed to sync account:', error);
    }
  };

  const handleRemove = async (accountId: string) => {
    try {
      // Implement remove logic here
      setAccounts(accounts.filter(acc => acc.id !== accountId));
    } catch (error) {
      console.error('Failed to remove account:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Bank Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Connect your bank accounts to automatically import transactions.
        </p>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Building className="h-6 w-6" />
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-muted-foreground">{account.institution}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(account.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="ml-2">Sync</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-2">Remove</span>
                  </Button>
                </div>
              </div>
              {account.lastSync && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Last synced: {new Date(account.lastSync).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        <Button onClick={handleConnect} disabled={isConnecting}>
          <Plus className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
        </Button>
      </div>
    </div>
  );
} 