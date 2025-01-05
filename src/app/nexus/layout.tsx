import { AppShell } from '@/components/views/layout/AppShell';

export default function NexusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
} 