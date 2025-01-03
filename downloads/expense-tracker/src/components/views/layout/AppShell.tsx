'use client';

import { type ReactNode } from 'react';
import { MainLayout } from './MainLayout';

export function AppShell({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
} 