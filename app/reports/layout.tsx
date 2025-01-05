import { ReportsProvider } from '@/contexts/ReportsContext';
import { Providers } from '@/components/Providers';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ReportsProvider>
        {children}
      </ReportsProvider>
    </Providers>
  );
} 