'use client';

import { LoginForm } from '@/components/views/auth/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    // TODO: Implement actual authentication
    console.log('Login attempt:', { email, password });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
} 