import { type ReactNode } from 'react';

interface NexusLayoutProps {
  children: ReactNode;
}

export default function NexusLayout({ children }: NexusLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  );
} 