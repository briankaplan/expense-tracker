import { type ReactNode } from 'react';

export default function UploadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Upload Receipts</h1>
        </div>
        {children}
      </div>
    </div>
  );
} 