'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Receipt = {
  id: string;
  url: string;
  metadata: {
    merchant?: string;
    date?: string;
    total?: number;
    items?: Array<{
      description: string;
      amount: number;
    }>;
  };
};

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const response = await fetch(`/api/receipts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch receipt');
        }
        const data = await response.json();
        setReceipt(data);
      } catch (error) {
        console.error('Error fetching receipt:', error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    }

    fetchReceipt();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading receipt...</div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Receipt not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Receipt Details</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Receipt Image */}
      <div className="relative aspect-[3/4] bg-gray-900">
        <Image
          src={receipt.url}
          alt="Receipt"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Receipt Details */}
      <div className="p-4 space-y-4">
        {receipt.metadata.merchant && (
          <div>
            <h2 className="text-sm text-gray-400">Merchant</h2>
            <p className="text-lg font-medium">{receipt.metadata.merchant}</p>
          </div>
        )}

        {receipt.metadata.date && (
          <div>
            <h2 className="text-sm text-gray-400">Date</h2>
            <p className="text-lg font-medium">
              {new Date(receipt.metadata.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {receipt.metadata.total && (
          <div>
            <h2 className="text-sm text-gray-400">Total</h2>
            <p className="text-lg font-medium">
              ${receipt.metadata.total.toFixed(2)}
            </p>
          </div>
        )}

        {receipt.metadata.items && receipt.metadata.items.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-400 mb-2">Items</h2>
            <div className="space-y-2">
              {receipt.metadata.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-white/10"
                >
                  <span className="flex-1">{item.description}</span>
                  <span className="ml-4">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 