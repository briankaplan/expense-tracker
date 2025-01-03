'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string;
  currentReceiptUrl?: string;
  onUploadReceipt: (expenseId: string, file: File) => Promise<void>;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  expenseId,
  currentReceiptUrl,
  onUploadReceipt
}: ReceiptDialogProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUploadReceipt(expenseId, file);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to upload receipt:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentReceiptUrl ? (
            <div className="relative aspect-[3/4] w-full">
              <img
                src={currentReceiptUrl}
                alt="Receipt"
                className="rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No receipt uploaded</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="receipt">Upload Receipt</Label>
            <div className="flex gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 