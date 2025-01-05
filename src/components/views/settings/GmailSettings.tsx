'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { gmailService } from '@/lib/gmail';
import { toast } from '@/components/ui/use-toast';

interface GmailSettingsProps {
  onReceiptsFound?: (receipts: any[]) => void;
}

export default function GmailSettings({ onReceiptsFound }: GmailSettingsProps) {
  const [isConnected, setIsConnected] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gmail_credentials') !== null;
    }
    return false;
  });
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(() => {
    return localStorage.getItem('gmail_auto_scan') === 'true';
  });
  const [scanDays, setScanDays] = useState(() => {
    return parseInt(localStorage.getItem('gmail_scan_days') || '30');
  });

  const handleConnect = async () => {
    try {
      await gmailService.authenticate();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to Gmail:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to Gmail. Please try again."
      });
    }
  };

  const handleDisconnect = () => {
    gmailService.disconnect();
    setIsConnected(false);
  };

  const handleScan = async () => {
    if (isScanning) return;

    try {
      setIsScanning(true);
      const receipts = await gmailService.scanEmails(scanDays);
      
      if (receipts.length > 0 && onReceiptsFound) {
        onReceiptsFound(receipts);
      }
    } catch (error) {
      console.error('Failed to scan emails:', error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not scan emails for receipts. Please try again."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoScanChange = (enabled: boolean) => {
    setAutoScan(enabled);
    localStorage.setItem('gmail_auto_scan', enabled.toString());
    
    toast({
      title: enabled ? "Auto-Scan Enabled" : "Auto-Scan Disabled",
      description: enabled 
        ? "Will automatically scan for new receipts daily"
        : "Auto-scan has been disabled"
    });
  };

  const handleScanDaysChange = (days: number) => {
    setScanDays(days);
    localStorage.setItem('gmail_scan_days', days.toString());
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Gmail Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Gmail account to automatically import receipts from your emails
            </p>
          </div>
          {!isConnected ? (
            <Button onClick={handleConnect}>
              <Mail className="mr-2 h-4 w-4" />
              Connect Gmail
            </Button>
          ) : (
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          )}
        </div>

        {isConnected && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Scan for Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically scan for new receipts daily
                  </p>
                </div>
                <Switch
                  checked={autoScan}
                  onCheckedChange={handleAutoScanChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Scan Period (Days)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={scanDays}
                    onChange={(e) => handleScanDaysChange(parseInt(e.target.value))}
                    min={1}
                    max={90}
                    className="w-24"
                  />
                  <Button 
                    onClick={handleScan}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Scan Now
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Number of days to look back when scanning for receipts
                </p>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="text-sm">
                <strong>Tips:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Receipts are automatically matched with expenses based on date and amount</li>
                  <li>Both PDF and image attachments are supported</li>
                  <li>Enable auto-scan to keep your receipts up to date</li>
                  <li>You can manually scan for receipts at any time</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
} 