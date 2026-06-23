'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { OrderCard } from '@/entities/order/ui/OrderCard';
import { Modal } from '@/shared/ui';
import { PaymentLinkPanel } from '@/features/orders/ui/PaymentLinkPanel';
import type { Order } from '@/shared/types';
import { formatPrice } from '@/shared/lib/utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'pending', label: 'Ожидают оплаты' },
  { value: 'paid', label: 'Оплачены' },
  { value: 'expired', label: 'Истекшие' },
  { value: 'cancelled', label: 'Отменённые' },
] as const;

export function AgentOrdersPage() {
  const { user } = useAuthStore();
  const { orders, markPaid } = useOrdersStore();
  const { tickets, markTicketsSold } = useTicketsStore();
  const [filter, setFilter] = useState<string>('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const agentOrders = useMemo(
    () => orders.filter((o) => o.agentId === user?.id),
    [orders, user]
  );

  const filtered = useMemo(
    () =>
      filter === 'all' ? agentOrders : agentOrders.filter((o) => o.status === filter),
    [agentOrders, filter]
  );

  const stats = useMemo(
    () => ({
      total: agentOrders.filter((o) => o.status === 'paid').length,
      revenue: agentOrders
        .filter((o) => o.status === 'paid')
        .reduce((s, o) => s + o.totalAmount, 0),
      pending: agentOrders.filter((o) => o.status === 'pending').length,
    }),
    [agentOrders]
  );

  const getTicketNumbers = (ticketIds: string[]) =>
    tickets
      .filter((t) => ticketIds.includes(t.id))
      .map((t) => `${t.series}-${t.number}`);

  const handleSimulatePaid = () => {
    if (!viewOrder) return;
    markPaid(viewOrder.id);
    markTicketsSold(viewOrder.ticketIds, viewOrder.id);
    alert(`Оплата подтверждена! Билеты отправлены клиенту ${viewOrder.client.fullName} в WhatsApp.`);
    setViewOrder(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Мои заказы</h1>
          <p className="text-sm text-slate-500">История оформленных заказов</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Оплачено</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-brand-blue">{formatPrice(stats.revenue)}</div>
            <div className="text-xs text-slate-500 mt-0.5">Выручка</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-slate-500 mt-0.5">Ожидают</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                filter === f.value
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Нет заказов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                ticketNumbers={getTicketNumbers(order.ticketIds)}
                onViewLink={setViewOrder}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={viewOrder !== null}
        onClose={() => setViewOrder(null)}
        title="Ссылка на оплату"
        size="md"
      >
        {viewOrder && (
          <PaymentLinkPanel
            order={viewOrder}
            onSimulatePaid={handleSimulatePaid}
            onClose={() => setViewOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
