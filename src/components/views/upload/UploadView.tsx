'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { uploadAndParseReceipt } from '@/lib/services/receipts';
import { cn } from '@/lib/utils';

interface UploadStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  receiptUrl?: string;
}

export function UploadView() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
    }));
    setUploads(current => [...current, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
      'application/pdf': ['.pdf'],
    },
    disabled: isProcessing,
  });

  const processUploads = async () => {
    setIsProcessing(true);

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      if (upload.status !== 'pending') continue;

      setUploads(current => 
        current.map((u, index) => 
          index === i 
            ? { ...u, status: 'processing' }
            : u
        )
      );

      try {
        const parsedReceipt = await uploadAndParseReceipt(upload.file);
        setUploads(current =>
          current.map((u, index) =>
            index === i
              ? { 
                  ...u, 
                  status: 'success',
                  receiptUrl: parsedReceipt.receiptUrl,
                  message: `Successfully processed ${upload.file.name}`
                }
              : u
          )
        );
      } catch (error) {
        setUploads(current =>
          current.map((u, index) =>
            index === i
              ? { 
                  ...u, 
                  status: 'error',
                  message: error instanceof Error ? error.message : 'Failed to process receipt'
                }
              : u
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const clearCompleted = () => {
    setUploads(current => 
      current.filter(upload => 
        upload.status === 'pending' || upload.status === 'processing'
      )
    );
  };

  const pendingCount = uploads.filter(u => u.status === 'pending').length;
  const processingCount = uploads.filter(u => u.status === 'processing').length;
  const successCount = uploads.filter(u => u.status === 'success').length;
  const errorCount = uploads.filter(u => u.status === 'error').length;
  const totalCount = uploads.length;
  const progress = totalCount ? ((successCount + errorCount) / totalCount) * 100 : 0;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Upload Receipts</h1>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button onClick={processUploads} disabled={isProcessing}>
              Process {pendingCount} {pendingCount === 1 ? 'Receipt' : 'Receipts'}
            </Button>
          )}
          {(successCount > 0 || errorCount > 0) && (
            <Button variant="outline" onClick={clearCompleted}>
              Clear Completed
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                isProcessing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-lg font-medium">
                {isDragActive
                  ? 'Drop the receipts here...'
                  : 'Drag and drop receipts, or click to select files'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Supports PNG, JPG, HEIC, and PDF files
              </p>
            </div>
          </CardContent>
        </Card>

        {uploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-4" />
              <div className="space-y-2">
                {uploads.map((upload, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {upload.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {upload.status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {(upload.status === 'pending' || upload.status === 'processing') && (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">{upload.file.name}</div>
                        {upload.message && (
                          <div className="text-sm text-muted-foreground">
                            {upload.message}
                          </div>
                        )}
                      </div>
                    </div>
                    {upload.receiptUrl && (
                      <a
                        href={upload.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        View Receipt
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 