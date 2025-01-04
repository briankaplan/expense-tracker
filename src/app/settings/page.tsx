import { Metadata } from 'next';
import { BankAccountSettings } from '@/components/settings/bank-account-settings';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences.',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <BankAccountSettings />
    </div>
  );
} 