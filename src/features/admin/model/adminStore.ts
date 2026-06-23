import { create } from 'zustand';
import type { AdminAgent, Order } from '@/shared/types';
import { adminApi } from '@/shared/api/admin';
import { ApiError } from '@/shared/api/client';

interface AdminState {
  agents: AdminAgent[];
  orders: Order[];
  loadingAgents: boolean;
  loadingOrders: boolean;
  error: string | null;

  fetchAgents: () => Promise<void>;
  createAgent: (data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    commissionPercent: string;
  }) => Promise<boolean>;
  toggleAgentStatus: (id: number, currentActive: boolean) => Promise<void>;
  fetchOrders: (params?: { agentId?: number; status?: string }) => Promise<void>;
  resendWhatsApp: (orderId: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  agents: [],
  orders: [],
  loadingAgents: false,
  loadingOrders: false,
  error: null,

  fetchAgents: async () => {
    set({ loadingAgents: true, error: null });
    try {
      const agents = await adminApi.agents();
      set({ agents, loadingAgents: false });
    } catch {
      set({ error: 'Не удалось загрузить агентов', loadingAgents: false });
    }
  },

  createAgent: async (data) => {
    try {
      const agent = await adminApi.createAgent(data);
      set((s) => ({ agents: [...s.agents, agent] }));
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        const p = err.payload as { data?: { detail?: Record<string, string[]> | string } } | null;
        const msg =
          typeof p?.data?.detail === 'string'
            ? p.data.detail
            : 'Ошибка создания агента';
        set({ error: msg });
      }
      return false;
    }
  },

  toggleAgentStatus: async (id, currentActive) => {
    try {
      const updated = await adminApi.patchAgent(id, { isActive: !currentActive });
      set((s) => ({
        agents: s.agents.map((a) => (a.id === id ? updated : a)),
      }));
    } catch {
      //
    }
  },

  fetchOrders: async (params) => {
    set({ loadingOrders: true, error: null });
    try {
      const orders = await adminApi.orders(params);
      set({ orders, loadingOrders: false });
    } catch {
      set({ error: 'Не удалось загрузить заказы', loadingOrders: false });
    }
  },

  resendWhatsApp: async (orderId) => {
    await adminApi.resendWhatsApp(orderId);
  },
}));
