import { create } from 'zustand';
import type { Agent } from '@/shared/types';
import { MOCK_AGENTS } from '@/shared/lib/mockData';

interface AgentFormData {
  name: string;
  login: string;
  password: string;
  phone: string;
  whatsapp: string;
}

interface AdminState {
  agents: Agent[];
  addAgent: (data: AgentFormData) => void;
  toggleAgentStatus: (agentId: string) => void;
  assignTickets: (agentId: string, ticketIds: string[]) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  agents: MOCK_AGENTS,

  addAgent: (data) =>
    set((s) => ({
      agents: [
        ...s.agents,
        {
          id: `agent-${Date.now()}`,
          ...data,
          status: 'active',
          createdAt: new Date().toISOString(),
          ticketPoolIds: [],
        },
      ],
    })),

  toggleAgentStatus: (agentId) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId
          ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
          : a
      ),
    })),

  assignTickets: (agentId, ticketIds) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, ticketPoolIds: ticketIds } : a
      ),
    })),
}));
