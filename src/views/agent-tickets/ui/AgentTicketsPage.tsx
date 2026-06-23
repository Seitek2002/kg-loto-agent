'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { TicketGrid } from '@/widgets/ticket-grid/ui/TicketGrid';
import { Modal } from '@/shared/ui';
import { Button } from '@/shared/ui';
import { OrderCreationForm } from '@/features/orders/ui/OrderCreationForm';
import { PaymentLinkPanel } from '@/features/orders/ui/PaymentLinkPanel';
import { MOCK_DRAWS } from '@/shared/lib/mockData';
import type { Client, Order } from '@/shared/types';
import { formatPrice } from '@/shared/lib/utils';

type Step = 'grid' | 'form' | 'payment';

export function AgentTicketsPage() {
  const { user } = useAuthStore();
  const { tickets, selectedIds, toggleSelect, clearSelection, filterDrawId, filterStatus, setFilterDraw, setFilterStatus, reserveTickets, markTicketsSold, getTicketsByIds } = useTicketsStore();
  const { createOrder, markPaid, orders } = useOrdersStore();
  const agents = useAdminStore((s) => s.agents);

  const [step, setStep] = useState<Step>('grid');
  const [formLoading, setFormLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const agent = agents.find((a) => a.id === user?.id);
  const agentTickets = agent
    ? tickets.filter((t) => agent.ticketPoolIds.includes(t.id))
    : tickets;

  const selectedTickets = getTicketsByIds(selectedIds);

  const handleBuy = () => {
    if (selectedIds.length === 0) return;
    setStep('form');
  };

  const handleFormSubmit = useCallback(
    async (client: Client) => {
      if (!user) return;
      setFormLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      reserveTickets(selectedIds, user.id);
      const order = createOrder(user.id, client, selectedIds, 200);
      setActiveOrder(order);
      clearSelection();
      setStep('payment');
      setFormLoading(false);
    },
    [user, selectedIds, reserveTickets, createOrder, clearSelection]
  );

  const handleSimulatePaid = useCallback(() => {
    if (!activeOrder) return;
    markPaid(activeOrder.id);
    markTicketsSold(activeOrder.ticketIds, activeOrder.id);
    setActiveOrder((o) => (o ? { ...o, status: 'paid' } : null));
    alert(`Оплата подтверждена! Билеты отправлены клиенту ${activeOrder.client.fullName} в WhatsApp.`);
    setStep('grid');
    setActiveOrder(null);
  }, [activeOrder, markPaid, markTicketsSold]);

  const handleClosePayment = () => {
    setStep('grid');
    setActiveOrder(null);
  };

  const handleFormCancel = () => {
    clearSelection();
    setStep('grid');
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-5 gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Билеты</h1>
          <p className="text-sm text-slate-500">
            Выберите билеты для продажи клиенту
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              Выбрано: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
              {' · '}
              <span className="font-semibold text-brand-blue">{formatPrice(selectedIds.length * 200)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Сбросить
            </Button>
            <Button variant="primary" size="sm" onClick={handleBuy}>
              Купить →
            </Button>
          </div>
        )}
      </div>

      {/* Ticket grid */}
      <div className="flex-1 overflow-y-auto">
        <TicketGrid
          tickets={agentTickets}
          draws={MOCK_DRAWS}
          selectedIds={selectedIds}
          onToggle={(t) => toggleSelect(t.id)}
          filterDrawId={filterDrawId}
          filterStatus={filterStatus}
          onFilterDraw={setFilterDraw}
          onFilterStatus={setFilterStatus}
        />
      </div>

      {/* Order creation modal */}
      <Modal
        open={step === 'form'}
        onClose={handleFormCancel}
        title="Оформление заказа"
        size="md"
      >
        <OrderCreationForm
          selectedTickets={selectedTickets}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      </Modal>

      {/* Payment link modal */}
      <Modal
        open={step === 'payment' && activeOrder !== null}
        onClose={handleClosePayment}
        title="Ссылка на оплату"
        size="md"
      >
        {activeOrder && (
          <PaymentLinkPanel
            order={activeOrder}
            onSimulatePaid={handleSimulatePaid}
            onClose={handleClosePayment}
          />
        )}
      </Modal>
    </div>
  );
}
