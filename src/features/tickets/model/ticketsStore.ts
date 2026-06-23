import { create } from 'zustand';
import type { Ticket } from '@/shared/types';
import { MOCK_TICKETS } from '@/shared/lib/mockData';
import { RESERVATION_DURATION_MS } from '@/shared/config/constants';

interface TicketsState {
  tickets: Ticket[];
  selectedIds: string[];
  filterDrawId: string | null;
  filterStatus: Ticket['status'] | 'all';

  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setFilterDraw: (drawId: string | null) => void;
  setFilterStatus: (status: Ticket['status'] | 'all') => void;
  reserveTickets: (ids: string[], agentId: string) => void;
  releaseTickets: (ids: string[]) => void;
  markTicketsSold: (ids: string[], orderId: string) => void;
  getTicketsByIds: (ids: string[]) => Ticket[];
  getAvailableForAgent: (agentPoolIds: string[]) => Ticket[];
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: MOCK_TICKETS,
  selectedIds: [],
  filterDrawId: null,
  filterStatus: 'all',

  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  setFilterDraw: (drawId) => set({ filterDrawId: drawId }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  reserveTickets: (ids, agentId) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        ids.includes(t.id)
          ? {
              ...t,
              status: 'reserved',
              reservedBy: agentId,
              reservedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  releaseTickets: (ids) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        ids.includes(t.id)
          ? {
              ...t,
              status: 'available',
              reservedBy: undefined,
              reservedAt: undefined,
            }
          : t
      ),
    })),

  markTicketsSold: (ids, orderId) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        ids.includes(t.id)
          ? {
              ...t,
              status: 'sold',
              reservedBy: undefined,
              reservedAt: undefined,
              orderId,
            }
          : t
      ),
    })),

  getTicketsByIds: (ids) => get().tickets.filter((t) => ids.includes(t.id)),

  getAvailableForAgent: (agentPoolIds) =>
    get().tickets.filter((t) => agentPoolIds.includes(t.id)),
}));

export function checkAndReleaseExpiredReservations(store: TicketsState) {
  const now = Date.now();
  const expired = store.tickets
    .filter(
      (t) =>
        t.status === 'reserved' &&
        t.reservedAt &&
        now - new Date(t.reservedAt).getTime() > RESERVATION_DURATION_MS
    )
    .map((t) => t.id);

  if (expired.length > 0) {
    store.releaseTickets(expired);
  }
}
