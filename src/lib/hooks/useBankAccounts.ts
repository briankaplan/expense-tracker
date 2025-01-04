import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution: string;
  lastSync: string | null;
  autoSync: boolean;
}

export function useBankAccounts() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id'>) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([account])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
    deleteAccount,
  };
} 