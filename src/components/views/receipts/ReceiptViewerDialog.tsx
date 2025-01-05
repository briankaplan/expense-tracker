'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { type Receipt } from '@/types/receipts';
import { ImageIcon, FileText, Info } from 'lucide-react';

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt;
  onMatch: (receiptId: string, expenseId: string) => Promise<void>;
  onSkip: (receiptId: string) => void;
}

export function ReceiptViewerDialog({
  open,
  onOpenChange,
  receipt,
  onMatch,
  onSkip
}: ReceiptViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>View Receipt</span>
            <Badge variant={
              receipt.status === 'matched' ? 'default' :
              receipt.status === 'unmatched' ? 'destructive' :
              'secondary'
            }>
              {receipt.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="image" className="h-full">
          <TabsList>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </TabsTrigger>
            <TabsTrigger value="ocr">
              <FileText className="h-4 w-4 mr-2" />
              OCR Text
            </TabsTrigger>
            <TabsTrigger value="metadata">
              <Info className="h-4 w-4 mr-2" />
              Metadata
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-4">
            <TabsContent value="image" className="h-full">
              <div className="relative h-full rounded-lg overflow-hidden">
                <img
                  src={receipt.url}
                  alt="Receipt"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="h-full">
              <ScrollArea className="h-full rounded-md border p-4">
                {receipt.metadata?.ocr ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        OCR Confidence: {(receipt.metadata.ocr.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {receipt.metadata.ocr.text}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No OCR data available
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metadata" className="h-full">
              <ScrollArea className="h-full rounded-md border p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">File Information</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filename</span>
                        <span>{receipt.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Upload Date</span>
                        <span>{formatDate(receipt.uploadedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Type</span>
                        <span>{receipt.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span>{(receipt.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>

                  {receipt.metadata && (
                    <>
                      {receipt.metadata.merchant && (
                        <div>
                          <h3 className="font-medium mb-2">Merchant Information</h3>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name</span>
                              <span>{receipt.metadata.merchant.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence</span>
                              <span>{(receipt.metadata.merchant.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {receipt.metadata.amount && (
                        <div>
                          <h3 className="font-medium mb-2">Transaction Details</h3>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount</span>
                              <span>{formatCurrency(receipt.metadata.amount.value)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence</span>
                              <span>{(receipt.metadata.amount.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {receipt.metadata.date && (
                        <div>
                          <h3 className="font-medium mb-2">Date Information</h3>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date</span>
                              <span>{formatDate(receipt.metadata.date.value)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence</span>
                              <span>{(receipt.metadata.date.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {receipt.metadata.width && receipt.metadata.height && (
                        <div>
                          <h3 className="font-medium mb-2">Image Details</h3>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions</span>
                              <span>{receipt.metadata.width} × {receipt.metadata.height}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          {receipt.status === 'pending' && (
            <>
              <Button variant="outline" onClick={() => onSkip(receipt.id)}>
                Mark as Unmatched
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 