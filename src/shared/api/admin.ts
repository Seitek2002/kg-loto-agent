import { getPagedAll, post, postFlat, patch, del } from './client';
import type { AdminAgent, Order } from '@/shared/types';

interface CreateAgentPayload {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  commissionPercent: string;
}

interface PatchAgentPayload {
  fullName?: string;
  phoneNumber?: string;
  commissionPercent?: string;
  isActive?: boolean;
  password?: string;
}

export const adminApi = {
  agents: () => getPagedAll<AdminAgent>('/admin/agents/'),

  createAgent: (data: CreateAgentPayload) =>
    post<AdminAgent>('/admin/agents/', data),

  patchAgent: (id: number, data: PatchAgentPayload) =>
    patch<AdminAgent>(`/admin/agents/${id}/`, data),

  orders: (params?: { agentId?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.agentId) q.set('agentId', String(params.agentId));
    if (params?.status) q.set('status', params.status);
    const qs = q.toString() ? `?${q}` : '';
    return getPagedAll<Order>(`/admin/orders/${qs}`);
  },

  resendWhatsApp: (orderId: number) =>
    post<{ queued: boolean; orderId: number }>(`/admin/orders/${orderId}/resend-whatsapp/`),

  regeneratePdf: (orderId: number) =>
    post<{ pdfFile: string }>(`/admin/orders/${orderId}/regenerate-pdf/`),

  allocateTickets: (tickets: string[]) =>
    post<{ updated: number; isAgentPool: boolean }>('/admin/pool/allocate/', { tickets }),

  deallocateTickets: (tickets: string[]) =>
    del<{ updated: number; isAgentPool: boolean }>('/admin/pool/allocate/', { tickets }),
};
