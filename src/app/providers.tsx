'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
