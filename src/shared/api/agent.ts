import { getPagedAll, getEnvelope, post, postFlat, getToken, ApiError } from './client';
import type { Draw, Ticket, Order, CreateOrderPayload, RevenueData, ReferralPurchase, ReferralEarnings } from '@/shared/types';

export interface CombinationCheckResult {
  isWinning: boolean;
  combinationId: number;
  message: string;
  prizeType: string;
  prizeAmount?: string;
  prizeProduct?: string;
}

interface CombinationCheckRaw {
  is_winning: boolean;
  combination_id: number;
  message: string;
  prize_type: string;
  prize_amount?: string;
  prize_product?: string;
}

/**
 * Проверяет, является ли код комбинации выигрышным — POST /api/v1/me/combination/check/.
 * Живёт на v1 (не v2, как остальной agentApi) и принимает только
 * application/x-www-form-urlencoded, поэтому не переиспользует общий request()
 * из client.ts (тот всегда шлёт JSON на /api/v2).
 */
export async function checkCombination(code: string): Promise<CombinationCheckResult> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/v1/me/combination/check/', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: `code=${encodeURIComponent(code)}`,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok) throw new ApiError(res.status, json);

  const raw = (json as { data: CombinationCheckRaw }).data;
  return {
    isWinning: raw.is_winning,
    combinationId: raw.combination_id,
    message: raw.message,
    prizeType: raw.prize_type,
    prizeAmount: raw.prize_amount,
    prizeProduct: raw.prize_product,
  };
}

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

  orders: (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params?.dateTo) q.set('dateTo', params.dateTo);
    const qs = q.toString() ? `?${q}` : '';
    return getPagedAll<Order>(`/agent/orders/${qs}`);
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

  referralPurchases: (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.dateFrom) q.set('date_from', params.dateFrom);
    if (params?.dateTo) q.set('date_to', params.dateTo);
    const qs = q.toString() ? `?${q}` : '';
    return getPagedAll<ReferralPurchase>(`/agent/referral-purchases/${qs}`);
  },

  referralEarnings: (params?: { dateFrom?: string; dateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.dateFrom) q.set('date_from', params.dateFrom);
    if (params?.dateTo) q.set('date_to', params.dateTo);
    const qs = q.toString() ? `?${q}` : '';
    return getEnvelope<ReferralEarnings>(`/agent/referral-earnings/${qs}`);
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
  const res = await fetch(`/api/v2/agent/orders/${id}/`, { credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // support both envelope { data: {...} } and flat response
  return json?.data ?? json;
}
