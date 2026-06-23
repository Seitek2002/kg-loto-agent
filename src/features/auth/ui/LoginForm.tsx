'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';

export function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: doLogin, error, user } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const ok = doLogin(login.trim(), password);
    setLoading(false);
    if (ok) {
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.AGENT.TICKETS);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Логин"
        type="text"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        placeholder="agent1"
        autoComplete="username"
        required
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••"
        autoComplete="current-password"
        required
        error={error ?? undefined}
      />

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
        Войти
      </Button>

      <div className="text-center text-xs text-slate-400 pt-1">
        <p>Демо: <span className="font-mono">agent1</span> / <span className="font-mono">pass123</span></p>
        <p>Админ: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span></p>
      </div>
    </form>
  );
}
