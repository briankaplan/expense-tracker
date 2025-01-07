import React from 'react';
import { Tables } from '@/lib/supabase/client';
import { BeautifiedReceipt } from './BeautifiedReceipt';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type Receipt = Tables['receipts']['Row'];

interface ReceiptViewerProps {
  receipt: Receipt;
  className?: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receipt,
  className
}) => {
  const [viewMode, setViewMode] = React.useState<'original' | 'beautified'>('original');

  if (!receipt.image_url) {
    return <BeautifiedReceipt receipt={receipt} showOriginal={false} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* View Toggle */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('original')}
          className={cn(
            "gap-2",
            viewMode === 'original' ? 'bg-secondary' : 'bg-transparent'
          )}
        >
          <Eye className="h-4 w-4" />
          Original
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('beautified')}
          className={cn(
            "gap-2",
            viewMode === 'beautified' ? 'bg-secondary' : 'bg-transparent'
          )}
        >
          <FileText className="h-4 w-4" />
          Digital
        </Button>
      </div>

      {/* Receipt Display */}
      {viewMode === 'original' ? (
        <div className="bg-gray-100 rounded-lg p-2">
          <img
            src={receipt.image_url}
            alt="Original receipt"
            className="w-full object-contain max-h-[600px] rounded"
          />
        </div>
      ) : (
        <BeautifiedReceipt receipt={receipt} showOriginal={false} />
      )}
    </div>
  );
}; 