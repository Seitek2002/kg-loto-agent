import { getPagedAll, getEnvelope, post, postFlat } from './client';
import type { Draw, Ticket, Order, CreateOrderPayload } from '@/shared/types';

export const agentApi = {
  draws: (status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return getPagedAll<Draw>(`/draws/${q}`);
  },

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

/** Public order status — no auth required, for buyer-facing status page */
export async function fetchOrderStatus(id: string): Promise<{
  id: number;
  status: string;
  statusDisplay: string;
  amount: string;
  clientFullName: string;
  paidAt: string | null;
  reservedUntil: string;
}> {
  const res = await fetch(`/api/v2/orders/${id}/`, { credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // support both envelope { data: {...} } and flat response
  return json?.data ?? json;
}
