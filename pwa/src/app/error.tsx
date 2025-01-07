'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-semibold text-white mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-400 text-center mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white text-black rounded-lg hover:opacity-80"
      >
        Try again
      </button>
    </div>
  );
} 