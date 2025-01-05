'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast";

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
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    try {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        await onUploadReceipt(file);
        toast({
          title: "Receipt Uploaded",
          description: "Receipt has been successfully uploaded.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an image file.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload receipt. Please try again.",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        await onUploadReceipt(file);
        toast({
          title: "Receipt Uploaded",
          description: "Receipt has been successfully uploaded.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an image file.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload receipt. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Receipt Preview */}
          <div>
            <Label>Current Receipt</Label>
            <div className="mt-2 aspect-[3/4] relative rounded-lg overflow-hidden border">
              {currentReceiptUrl ? (
                <img
                  src={currentReceiptUrl}
                  alt="Current Receipt"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No receipt uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <Label>Upload New Receipt</Label>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-colors",
                dragActive && "border-primary bg-primary/5",
                !dragActive && "hover:border-primary/50"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your receipt here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPEG, PNG, HEIC, PDF
                </p>
                {isUploading && (
                  <p className="text-sm text-primary mt-2">Uploading...</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
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