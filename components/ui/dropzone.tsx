'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onDrop: (acceptedFiles: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  loading?: boolean;
}

export function Dropzone({
  onDrop,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/heic': ['.heic'],
    'application/pdf': ['.pdf'],
  },
  disabled = false,
  loading = false,
  className,
  ...props
}: DropzoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled: disabled || loading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors',
        isDragActive && 'border-muted-foreground/50',
        isDragAccept && 'border-green-500',
        isDragReject && 'border-red-500',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {loading ? (
          <Icons.spinner className="h-8 w-8 animate-spin" />
        ) : (
          <Icons.upload className="h-8 w-8" />
        )}
        <div className="text-sm">
          {isDragActive ? (
            isDragAccept ? (
              <span className="text-green-500">Drop the file here</span>
            ) : (
              <span className="text-red-500">This file type is not accepted</span>
            )
          ) : (
            <span>
              Drag & drop a receipt here, or{' '}
              <span className="text-primary cursor-pointer">browse</span>
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Supported formats: JPEG, PNG, HEIC, PDF. Maximum size: 5MB
        </div>
      </div>
    </div>
  );
} 