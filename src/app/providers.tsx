import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TellerProvider } from '@/lib/providers/TellerProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TellerProvider>
        {children}
      </TellerProvider>
    </QueryClientProvider>
  );
} 