import { create } from 'zustand';
import type { Ticket, Draw } from '@/shared/types';
import { agentApi } from '@/shared/api/agent';

interface TicketsState {
  tickets: Ticket[];
  draws: Draw[];
  selectedIds: string[];
  filterDrawCode: string | null;
  loading: boolean;
  error: string | null;

  fetchDraws: () => Promise<void>;
  fetchTickets: (drawCode?: string) => Promise<void>;
  toggleSelect: (shortId: string) => void;
  clearSelection: () => void;
  setFilterDraw: (drawCode: string | null) => void;
  /** Remove tickets from local list after an order is created */
  removeTickets: (shortIds: string[]) => void;
  getSelectedTickets: () => Ticket[];
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  draws: [],
  selectedIds: [],
  filterDrawCode: null,
  loading: false,
  error: null,

  fetchDraws: async () => {
    set({ loading: true, error: null });
    try {
      const draws = await agentApi.draws();
      set({ draws, loading: false });
    } catch {
      set({ error: 'Не удалось загрузить тиражи', loading: false });
    }
  },

  fetchTickets: async (drawCode) => {
    set({ loading: true, error: null, tickets: [], selectedIds: [] });
    try {
      const tickets = await agentApi.tickets(drawCode);
      set({ tickets, loading: false });
    } catch {
      set({ error: 'Не удалось загрузить билеты', loading: false });
    }
  },

  toggleSelect: (shortId) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(shortId)
        ? s.selectedIds.filter((x) => x !== shortId)
        : [...s.selectedIds, shortId],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  setFilterDraw: (drawCode) => {
    set({ filterDrawCode: drawCode, selectedIds: [] });
    get().fetchTickets(drawCode ?? undefined);
  },

  removeTickets: (shortIds) =>
    set((s) => ({
      tickets: s.tickets.filter((t) => !shortIds.includes(t.shortId)),
      selectedIds: s.selectedIds.filter((id) => !shortIds.includes(id)),
    })),

  getSelectedTickets: () => {
    const { tickets, selectedIds } = get();
    return tickets.filter((t) => selectedIds.includes(t.shortId));
  },
}));
