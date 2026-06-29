'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="h-14 bg-brand-blue border-b border-blue-900 flex items-center px-4 gap-4 flex-shrink-0">
      <div className="flex items-center gap-2 mr-auto">
        <Image src="/logo.png" alt="KGLOTO" width={32} height={32} className="object-contain" />
        <span className="font-bold text-white text-sm tracking-wide">KGLOTO.Агент</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium leading-tight">{user.fullName}</p>
            <p className="text-blue-300 text-xs capitalize">
              {user.role === 'superadmin' ? 'Администратор' : 'Агент'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10">
            Выйти
          </Button>
        </div>
      )}
    </header>
  );
}
