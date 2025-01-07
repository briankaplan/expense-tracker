'use client';

import { createClient } from '@/lib/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Expense Tracker
            </span>
          </a>
          <Navigation />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button
            variant="ghost"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
} 