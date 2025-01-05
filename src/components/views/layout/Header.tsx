'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <ThemeToggle />
      </div>
    </header>
  );
} 