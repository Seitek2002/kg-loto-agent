import { create } from 'zustand';
import type { Order, CreateOrderPayload } from '@/shared/types';
import { agentApi } from '@/shared/api/agent';
import { ApiError } from '@/shared/api/client';

interface CreatedOrder {
  orderId: number;
  status: string;
  amount: string;
  payUrl: string;
  reservedUntil: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  /** The most recently created order (shown in payment modal) */
  createdOrder: CreatedOrder | null;
  createError: string | null;

  fetchOrders: (status?: string) => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<CreatedOrder | null>;
  cancelOrder: (id: number) => Promise<void>;
  clearCreated: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  error: null,
  createdOrder: null,
  createError: null,

  fetchOrders: async (status) => {
    set({ loading: true, error: null });
    try {
      const orders = await agentApi.orders(status);
      set({ orders, loading: false });
    } catch {
      set({ error: 'Не удалось загрузить заказы', loading: false });
    }
  },

  createOrder: async (payload) => {
    set({ createError: null });
    try {
      const created = await agentApi.createOrder(payload);
      set({ createdOrder: created });
      return created;
    } catch (err) {
      if (err instanceof ApiError) {
        const payload = err.payload as {
          data?: { tickets?: string[]; detail?: string | Record<string, string[]> };
        } | null;
        const data = payload?.data;
        let msg = 'Не удалось создать заказ';
        if (Array.isArray(data?.tickets)) {
          msg = data!.tickets.join('\n');
        } else if (typeof data?.detail === 'string') {
          msg = data.detail;
        }
        set({ createError: msg });
      } else {
        set({ createError: 'Ошибка соединения с сервером' });
      }
      return null;
    }
  },

  cancelOrder: async (id) => {
    try {
      await agentApi.cancelOrder(id);
      set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id ? { ...o, status: 'cancelled' as const, statusDisplay: 'Отменён агентом' } : o
        ),
      }));
    } catch {
      // surface to UI via re-throw if needed
    }
  },

  clearCreated: () => set({ createdOrder: null, createError: null }),
}));
