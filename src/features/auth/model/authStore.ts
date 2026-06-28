import { create } from 'zustand';
import type { AuthUser } from '@/shared/types';
import { authApi } from '@/shared/api/auth';
import { ApiError, setToken, getToken } from '@/shared/api/client';

interface AuthState {
  user: AuthUser | null;
  initializing: boolean;
  error: string | null;

  /** Called once on app start to restore session from httpOnly cookie */
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  error: null,

  initAuth: async () => {
    try {
      // getToken() loads from localStorage so the Bearer header is set before /me/
      getToken();
      const user = await authApi.me();
      set({ user, initializing: false });
    } catch {
      set({ user: null, initializing: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { access, user } = await authApi.login(email, password);
      setToken(access);
      set({ user });
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        // standardized error format: { type, errors: [{ code, detail }] }
        const payload = err.payload as {
          errors?: Array<{ detail: string; code: string }>;
        } | null;
        const detail =
          payload?.errors?.[0]?.detail ??
          'Неверный email или пароль';
        set({ error: detail });
      } else {
        set({ error: 'Ошибка соединения с сервером' });
      }
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setToken(null);
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
