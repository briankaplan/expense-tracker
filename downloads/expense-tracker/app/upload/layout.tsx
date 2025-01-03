import { type ReactNode } from 'react';

export default function UploadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
} 