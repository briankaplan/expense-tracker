'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useReceipts } from '@/app/providers/ReceiptsProvider';
import { useTransactions } from '@/app/providers/TransactionsProvider';
import { ReceiptDetailsDialog } from '@/components/receipts/ReceiptDetailsDialog';
import { Tables } from '@/lib/supabase/client';

type Receipt = Tables['receipts']['Row'];

export default function ReceiptUploadPage() {
  const router = useRouter();
  const { receipts, uploadReceipt, processReceipt, createExpenseFromReceipt } = useReceipts();
  const { transactions } = useTransactions();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // Upload receipt
        const receipt = await uploadReceipt(file);

        // Process receipt
        await processReceipt(receipt.id);
      }

      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${files.length} receipt${files.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload receipts",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // Upload receipt
        const receipt = await uploadReceipt(file);

        // Process receipt
        await processReceipt(receipt.id);
      }

      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${files.length} receipt${files.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload receipts",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCreateExpense = async (receipt: Receipt, transaction?: Tables['bank_transactions']['Row']) => {
    try {
      await createExpenseFromReceipt(receipt, transaction);
      toast({
        title: "Expense created",
        description: transaction
          ? "Expense has been created and matched with the transaction."
          : "Expense has been created and marked for review.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create expense",
        description: error instanceof Error ? error.message : "Could not create expense",
      });
    }
  };

  const recentReceipts = receipts
    .filter(r => r.status === 'processed')
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipts</CardTitle>
            <CardDescription>
              Drag and drop your receipts here or click to select files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                id="receipt-upload"
                className="hidden"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Icons.upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your receipts here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports images and PDF files
                </p>
              </label>
            </div>

            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading receipts...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {recentReceipts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Receipts</CardTitle>
              <CardDescription>
                Recently processed receipts ready for expense creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{receipt.merchant || 'Unknown Merchant'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(receipt.date).toLocaleDateString()} • ${receipt.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        transactions={transactions}
        onClose={() => setSelectedReceipt(null)}
        onCreateExpense={handleCreateExpense}
      />
    </div>
  );
} 