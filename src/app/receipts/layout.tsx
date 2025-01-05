import { AppShell } from '@/components/views/layout/AppShell';

export default function ReceiptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
} 