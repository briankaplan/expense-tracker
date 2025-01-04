import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          asChild
          variant="outline"
        >
          <Link href="/">Go home</Link>
        </Button>
        <Button
          onClick={() => window.history.back()}
          variant="default"
        >
          Go back
        </Button>
      </div>
    </div>
  );
} 