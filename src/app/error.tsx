'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Something went wrong!</h1>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          variant="outline"
        >
          Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="default"
        >
          Go home
        </Button>
      </div>
    </div>
  );
} 