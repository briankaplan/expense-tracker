'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function UploadView() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Upload Receipts</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center justify-center">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drop files here or click to upload
            </span>
          </label>

          {files.length > 0 && (
            <div className="mt-4 w-full">
              <h3 className="text-lg font-medium">Selected Files</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.name} className="py-3">
                    {file.name}
                  </li>
                ))}
              </ul>
              <Button className="mt-4" variant="primary">
                Process {files.length} file{files.length === 1 ? '' : 's'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 