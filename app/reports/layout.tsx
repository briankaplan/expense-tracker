import { ReportsProvider } from '@/contexts/ReportsContext';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReportsProvider>
      {children}
    </ReportsProvider>
  );
} 