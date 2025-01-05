'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionInfo {
  service: string;
  status: 'active' | 'trial' | 'cancelled';
  source: string;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  nextBillingDate?: string;
  amount: number;
  currency: string;
  plan?: string;
  category?: string;
  relatedSubscriptions?: string[];
}

interface ReceiptAnalysis {
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  subscription?: SubscriptionInfo;
  rawText: string;
  mindeeData: any;
  openaiAnalysis: {
    analysis: string;
    confidence: string;
  } | null;
}

interface GmailReceiptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipts: ReceiptAnalysis[];
  onImport: (receipts: ReceiptAnalysis[]) => Promise<void>;
}

function getStatusIcon(status: 'active' | 'trial' | 'cancelled') {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'trial':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function getStatusColor(status: 'active' | 'trial' | 'cancelled') {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'trial':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  }
}

export function GmailReceiptsDialog({
  open,
  onOpenChange,
  receipts,
  onImport
}: GmailReceiptsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Subscription Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="space-y-6 p-6">
              {receipts.map((receipt) => (
                <div
                  key={receipt.merchant + receipt.date}
                  className="rounded-lg border bg-card"
                >
                  <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-lg font-medium">{receipt.merchant}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(receipt.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-mono">
                          {formatCurrency(receipt.amount, receipt.currency)}
                        </div>
                        {receipt.subscription && (
                          <Badge
                            className={`mt-1 ${getStatusColor(receipt.subscription.status)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(receipt.subscription.status)}
                              {receipt.subscription.status.charAt(0).toUpperCase() + 
                               receipt.subscription.status.slice(1)}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {receipt.subscription && (
                    <div className="p-4 bg-muted/50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Source</p>
                            <p className="text-sm text-muted-foreground">
                              {receipt.subscription.source}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Category</p>
                            <p className="text-sm text-muted-foreground">
                              {receipt.subscription.category || 'Uncategorized'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(receipt.subscription.startDate)}
                            </p>
                          </div>
                          {receipt.subscription.trialEndDate && (
                            <div>
                              <p className="text-sm font-medium">Trial Ends</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(receipt.subscription.trialEndDate)}
                              </p>
                            </div>
                          )}
                          {receipt.subscription.nextBillingDate && (
                            <div>
                              <p className="text-sm font-medium">Next Billing</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(receipt.subscription.nextBillingDate)}
                              </p>
                            </div>
                          )}
                          {receipt.subscription.endDate && (
                            <div>
                              <p className="text-sm font-medium">End Date</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(receipt.subscription.endDate)}
                              </p>
                            </div>
                          )}
                        </div>

                        {receipt.subscription.relatedSubscriptions && 
                         receipt.subscription.relatedSubscriptions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Related Subscriptions</p>
                            <div className="flex gap-2 mt-1">
                              {receipt.subscription.relatedSubscriptions.map((service) => (
                                <Badge key={service} variant="secondary">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {receipt.openaiAnalysis && (
                    <div className="p-4 border-t">
                      <p className="text-sm font-medium">AI Analysis</p>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {receipt.openaiAnalysis.analysis}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Confidence: {receipt.openaiAnalysis.confidence}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 