'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Header } from '@/widgets/header/ui/Header';
import { Sidebar } from '@/widgets/sidebar/ui/AgentSidebar';
import { ROUTES } from '@/shared/config/routes';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    } else if (user.role !== 'agent') {
      router.replace(ROUTES.ADMIN.DASHBOARD);
    }
  }, [user, initializing, router]);

  if (initializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'agent') return null;

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="agent" />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
