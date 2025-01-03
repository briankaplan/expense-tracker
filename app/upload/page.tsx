import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Receipts',
  description: 'Upload and process your receipts'
};

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* TODO: Add upload functionality */}
        <div className="col-span-full">
          <p className="text-muted-foreground">
            Upload functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
} 