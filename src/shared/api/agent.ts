import { getPagedAll, getEnvelope, post, postFlat } from './client';
import type { Draw, Ticket, Order, CreateOrderPayload, RevenueData } from '@/shared/types';

export const agentApi = {
  draws: () => getEnvelope<Draw[]>('/agent/draws/'),

  tickets: (drawCode?: string) => {
    const q = drawCode ? `?draw_code=${encodeURIComponent(drawCode)}` : '';
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

  revenue: (params?: { dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.dateFrom) q.set('date_from', params.dateFrom);
    if (params?.dateTo) q.set('date_to', params.dateTo);
    const qs = q.toString() ? `?${q}` : '';
    return getEnvelope<RevenueData>(`/agent/revenue/${qs}`);
  },
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
