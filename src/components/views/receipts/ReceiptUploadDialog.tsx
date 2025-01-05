'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ReceiptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList | null) => Promise<void>;
}

export function ReceiptUploadDialog({
  open,
  onOpenChange,
  onUpload
}: ReceiptUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      await onUpload(e.target.files);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Receipts</DialogTitle>
          <DialogDescription>
            Upload your receipt images or PDFs. We'll process them automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your receipts here
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: JPEG, PNG, HEIC, PDF
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 