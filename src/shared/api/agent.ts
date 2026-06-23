import { getPagedAll, getEnvelope, post, postFlat } from './client';
import type { Draw, Ticket, Order, CreateOrderPayload } from '@/shared/types';

export const agentApi = {
  draws: () => getEnvelope<Draw[]>('/agent/draws/'),

  tickets: (drawCode?: string) => {
    const q = drawCode ? `?drawCode=${encodeURIComponent(drawCode)}` : '';
    return getPagedAll<Ticket>(`/agent/tickets/${q}`);
  },

  createOrder: (payload: CreateOrderPayload) =>
    post<{
      orderId: number;
      status: string;
      amount: string;
      payUrl: string;
      reservedUntil: string;
    }>('/agent/orders/', payload),

  orders: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return getPagedAll<Order>(`/agent/orders/${q}`);
  },

  order: (id: number) => getEnvelope<Order>(`/agent/orders/${id}/`),

  cancelOrder: (id: number) =>
    postFlat<{ data: Order; meta: object }>(`/agent/orders/${id}/cancel/`),
};
