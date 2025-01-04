import { ReactNode } from 'react';

interface NexusLayoutProps {
  children: ReactNode;
}

export default function NexusLayout({ children }: NexusLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 