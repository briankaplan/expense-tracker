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
  };
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetch('/api/receipts');
        if (!response.ok) {
          throw new Error('Failed to fetch receipts');
        }
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    }

    fetchReceipts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => router.push('/capture')}
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
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Recent Receipts</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Receipts Grid */}
      <div className="p-4">
        {receipts.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No receipts found</p>
            <button
              onClick={() => router.push('/capture')}
              className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Capture Receipt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {receipts.map((receipt) => (
              <button
                key={receipt.id}
                onClick={() => router.push(`/receipts/${receipt.id}`)}
                className="aspect-[3/4] relative bg-gray-900 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <Image
                  src={receipt.url}
                  alt={receipt.metadata.merchant || 'Receipt'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  {receipt.metadata.merchant && (
                    <p className="text-sm font-medium truncate">
                      {receipt.metadata.merchant}
                    </p>
                  )}
                  {receipt.metadata.total && (
                    <p className="text-xs text-gray-300">
                      ${receipt.metadata.total.toFixed(2)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 