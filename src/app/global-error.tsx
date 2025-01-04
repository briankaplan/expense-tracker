'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              A critical error occurred. Please try refreshing the page.
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
      </body>
    </html>
  );
} 