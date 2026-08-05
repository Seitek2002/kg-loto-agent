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
  /** True when createError is specifically a "ticket already sold/reserved" 400 — caller should refresh the ticket list */
  ticketsUnavailable: boolean;

  fetchOrders: (params?: { status?: string; region?: string; dateFrom?: string; dateTo?: string }) => Promise<void>;
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
  ticketsUnavailable: false,

  fetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const orders = await agentApi.orders(params);
      set({ orders, loading: false });
    } catch {
      set({ error: 'Не удалось загрузить заказы', loading: false });
    }
  },

  createOrder: async (payload) => {
    set({ createError: null, ticketsUnavailable: false });
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
        // Бэк теперь сверяет билеты с LTT перед бронью, поэтому 400 с data.tickets —
        // штатный сценарий "билет заняли до оплаты", а не редкий случай
        if (Array.isArray(data?.tickets) && data.tickets.length > 0) {
          set({ createError: 'Билет только что продали, выберите другой', ticketsUnavailable: true });
        } else if (typeof data?.detail === 'string') {
          set({ createError: data.detail });
        } else {
          set({ createError: 'Не удалось создать заказ' });
        }
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

  clearCreated: () => set({ createdOrder: null, createError: null, ticketsUnavailable: false }),
}));
