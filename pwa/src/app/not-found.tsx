'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-semibold text-white mb-4">Page not found</h1>
      <p className="text-gray-400 text-center mb-8">
        The page you're looking for doesn't exist
      </p>
      <button
        onClick={() => router.push('/capture')}
        className="px-4 py-2 bg-white text-black rounded-lg hover:opacity-80"
      >
        Go to camera
      </button>
    </div>
  );
} 