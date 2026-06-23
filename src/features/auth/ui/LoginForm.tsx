'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (ok) {
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'superadmin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.AGENT.TICKETS);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="agent@kgloto.kg"
        autoComplete="email"
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
    </form>
  );
}
