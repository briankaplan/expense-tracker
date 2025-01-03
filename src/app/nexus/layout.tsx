import { AppShell } from '@/components/views/layout/AppShell';

export default function NexusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppShell>{children}</AppShell>
    </div>
  );
} 