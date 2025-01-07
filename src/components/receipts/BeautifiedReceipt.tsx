import React from 'react';
import { Tables } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Receipt = Tables['receipts']['Row'];

interface BeautifiedReceiptProps {
  receipt: Receipt;
  showOriginal?: boolean;
  className?: string;
}

export const BeautifiedReceipt: React.FC<BeautifiedReceiptProps> = ({
  receipt,
  showOriginal = true,
  className
}) => {
  const metadata = receipt.metadata as any;
  const items = (receipt.items || []) as any[];

  return (
    <div className={cn("grid grid-cols-2 gap-6", className)}>
      {/* Original Receipt */}
      {showOriginal && receipt.image_url && (
        <div className="relative">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Original Receipt</h4>
          <div className="bg-gray-100 rounded-lg p-2">
            <img
              src={receipt.image_url}
              alt="Original receipt"
              className="w-full object-contain max-h-[600px] rounded"
            />
          </div>
        </div>
      )}

      {/* Beautified Receipt */}
      <div className={showOriginal ? '' : 'col-span-2'}>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Digital Receipt</h4>
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto receipt-paper relative before:absolute before:inset-0 before:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] before:bg-[length:16px_16px] before:opacity-[0.15] before:rounded-lg overflow-hidden">
          {/* Top torn edge effect */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white" style={{
            maskImage: 'linear-gradient(to right, transparent 2px, white 2px), repeating-linear-gradient(-45deg, white, white 2px, transparent 2px, transparent 4px)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 2px, white 2px), repeating-linear-gradient(-45deg, white, white 2px, transparent 2px, transparent 4px)'
          }} />

          {/* Receipt Content */}
          <div className="relative">
            {/* Receipt Header */}
            <div className="text-center mb-6 font-receipt">
              {receipt.merchant && (
                <h2 className="text-xl font-bold mb-1 tracking-tight">{receipt.merchant}</h2>
              )}
              {metadata?.address && (
                <p className="text-sm text-gray-600 mb-1 leading-snug">{metadata.address}</p>
              )}
              {metadata?.phone && (
                <p className="text-sm text-gray-600 mb-1 font-mono">{metadata.phone}</p>
              )}
              {receipt.date && (
                <p className="text-sm text-gray-600 font-mono">
                  {format(new Date(receipt.date), 'PPP')}
                </p>
              )}
              {metadata?.receipt_number && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Receipt #: {metadata.receipt_number}
                </p>
              )}
            </div>

            {/* Line Items */}
            {items.length > 0 && (
              <>
                <div className="border-b border-dashed border-gray-300 my-4 opacity-50" />
                <div className="mb-4 space-y-2 font-mono">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm items-start">
                      <div className="flex-1">
                        <p className="font-medium leading-snug">{item.description}</p>
                        {item.quantity && (
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        )}
                      </div>
                      <p className="ml-4 tabular-nums whitespace-nowrap">
                        {formatCurrency(item.totalAmount || item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Totals Section */}
            <div className="border-b border-dashed border-gray-300 my-4 opacity-50" />
            <div className="space-y-2 font-mono">
              {(metadata?.tax || metadata?.tip) && (
                <div className="flex justify-between text-sm">
                  <p>Subtotal</p>
                  <p className="tabular-nums">
                    {formatCurrency(receipt.total - (metadata?.tax || 0) - (metadata?.tip || 0))}
                  </p>
                </div>
              )}

              {metadata?.tax && (
                <div className="flex justify-between text-sm">
                  <p>Tax</p>
                  <p className="tabular-nums">{formatCurrency(metadata.tax)}</p>
                </div>
              )}

              {metadata?.tip && (
                <div className="flex justify-between text-sm">
                  <p>Tip</p>
                  <p className="tabular-nums">{formatCurrency(metadata.tip)}</p>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <p>Total</p>
                <p className="tabular-nums">{formatCurrency(receipt.total)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 font-receipt">Thank you!</p>
              {metadata?.tax && metadata?.tax_id && (
                <div className="mt-2 text-xs text-gray-400 font-mono">
                  <p>Tax Registration: {metadata.tax_id}</p>
                  <p>Tax Rate: {((metadata.tax / (receipt.total - metadata.tax)) * 100).toFixed(2)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom torn edge effect */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white" style={{
            maskImage: 'linear-gradient(to right, transparent 2px, white 2px), repeating-linear-gradient(-45deg, white, white 2px, transparent 2px, transparent 4px)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 2px, white 2px), repeating-linear-gradient(-45deg, white, white 2px, transparent 2px, transparent 4px)'
          }} />
        </div>
      </div>
    </div>
  );
}; 