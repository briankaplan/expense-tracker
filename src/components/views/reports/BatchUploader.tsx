'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X } from 'lucide-react';

interface BatchUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
}

export function BatchUploader({
  onUpload,
  maxFiles = 50,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*'
}: BatchUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.size <= maxSize && file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  }, [maxSize, maxFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.size <= maxSize && file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      await onUpload(files);
      setFiles([]);
      setProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center"
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop receipts here, or click to select
            </p>
            <input
              type="file"
              accept={accept}
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Selected Files ({files.length})</span>
                <span>{Math.round(files.reduce((acc, file) => acc + file.size, 0) / 1024)} KB total</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && <Progress value={progress} className="mt-4" />}

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 