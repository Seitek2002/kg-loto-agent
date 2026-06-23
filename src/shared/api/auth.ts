import { get, postFlat } from './client';
import type { AuthUser } from '@/shared/types';

interface LoginResponse {
  access: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    postFlat<LoginResponse>('/auth/login/', { email, password }),

  me: () => get<AuthUser>('/auth/me/'),

  refresh: () =>
    postFlat<{ access: string }>('/auth/token/refresh/'),

  logout: () =>
    postFlat<{ success: boolean }>('/auth/logout/'),
};
