import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, Client } from '@/shared/types';
import { MOCK_ORDERS } from '@/shared/lib/mockData';
import { RESERVATION_DURATION_MS } from '@/shared/config/constants';
import { generateOrderId, generatePaymentLink } from '@/shared/lib/utils';

interface OrdersState {
  orders: Order[];
  activeOrderId: string | null;

  createOrder: (agentId: string, client: Client, ticketIds: string[], pricePerTicket: number) => Order;
  getAgentOrders: (agentId: string) => Order[];
  setActiveOrder: (id: string | null) => void;
  markPaid: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  expireOrder: (orderId: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: MOCK_ORDERS,
      activeOrderId: null,

      createOrder: (agentId, client, ticketIds, pricePerTicket) => {
        const id = generateOrderId();
        const now = new Date().toISOString();
        const expiresAt = new Date(
          Date.now() + RESERVATION_DURATION_MS
        ).toISOString();

        const order: Order = {
          id,
          agentId,
          client,
          ticketIds,
          totalAmount: ticketIds.length * pricePerTicket,
          status: 'pending',
          paymentLink: generatePaymentLink(id),
          createdAt: now,
          expiresAt,
        };

        set((s) => ({ orders: [order, ...s.orders], activeOrderId: id }));
        return order;
      },

      getAgentOrders: (agentId) =>
        get().orders.filter((o) => o.agentId === agentId),

      setActiveOrder: (id) => set({ activeOrderId: id }),

      markPaid: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: 'paid', paidAt: new Date().toISOString() }
              : o
          ),
        })),

      cancelOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' } : o
          ),
        })),

      expireOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'expired' } : o
          ),
        })),
    }),
    { name: 'kgloto-orders' }
  )
);
