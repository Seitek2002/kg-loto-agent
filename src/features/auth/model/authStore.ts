import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/shared/types';
import { MOCK_AGENTS, ADMIN_CREDENTIALS } from '@/shared/lib/mockData';

interface AuthState {
  user: AuthUser | null;
  error: string | null;
  login: (login: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,

      login: (login, password) => {
        if (
          login === ADMIN_CREDENTIALS.login &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({
            user: {
              id: 'admin',
              role: 'admin' as UserRole,
              name: 'Администратор',
              login: 'admin',
            },
            error: null,
          });
          return true;
        }

        const agent = MOCK_AGENTS.find(
          (a) => a.login === login && a.password === password
        );

        if (agent) {
          if (agent.status === 'inactive') {
            set({ error: 'Учётная запись отключена. Обратитесь к администратору.' });
            return false;
          }
          set({
            user: {
              id: agent.id,
              role: 'agent' as UserRole,
              name: agent.name,
              login: agent.login,
            },
            error: null,
          });
          return true;
        }

        set({ error: 'Неверный логин или пароль' });
        return false;
      },

      logout: () => set({ user: null, error: null }),
    }),
    { name: 'kgloto-auth' }
  )
);
