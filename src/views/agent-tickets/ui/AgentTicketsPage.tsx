'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { TicketGrid } from '@/widgets/ticket-grid/ui/TicketGrid';
import { Modal, Button } from '@/shared/ui';
import { OrderCreationForm } from '@/features/orders/ui/OrderCreationForm';
import { PaymentLinkPanel } from '@/features/orders/ui/PaymentLinkPanel';
import type { Order, Ticket } from '@/shared/types';

type Step = 'grid' | 'form' | 'payment';

export function AgentTicketsPage() {
  const {
    tickets,
    draws,
    selectedIds,
    filterDrawCode,
    loading,
    error,
    fetchDraws,
    fetchTickets,
    toggleSelect,
    clearSelection,
    setFilterDraw,
    removeTickets,
    getSelectedTickets,
  } = useTicketsStore();

  const { createOrder, createdOrder, createError, clearCreated } = useOrdersStore();

  const [step, setStep] = useState<Step>('grid');
  const [formLoading, setFormLoading] = useState(false);
  const [orderClient, setOrderClient] = useState<{
    clientFullName: string;
    clientPhone: string;
  } | null>(null);

  useEffect(() => {
    fetchDraws();
    fetchTickets();
  }, [fetchDraws, fetchTickets]);

  const selectedTickets = getSelectedTickets();
  const totalAmount = selectedTickets
    .reduce((s, t) => s + parseFloat(t.ticketPrice || t.price || '0'), 0)
    .toFixed(0);

  const handleBuy = () => {
    if (selectedIds.length === 0) return;
    setStep('form');
  };

  const handleFormSubmit = useCallback(
    async (data: { clientFullName: string; clientPhone: string; clientBirthYear: number }) => {
      setFormLoading(true);
      const result = await createOrder({ ...data, tickets: selectedIds });
      setFormLoading(false);
      if (result) {
        setOrderClient({ clientFullName: data.clientFullName, clientPhone: data.clientPhone });
        removeTickets(selectedIds);
        clearSelection();
        setStep('payment');
      }
    },
    [selectedIds, createOrder, removeTickets, clearSelection]
  );

  const handleClosePayment = () => {
    clearCreated();
    setOrderClient(null);
    setStep('grid');
  };

  const handleFormCancel = () => {
    clearSelection();
    setStep('grid');
  };

  const handleToggle = useCallback(
    (t: Ticket) => toggleSelect(t.shortId),
    [toggleSelect]
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-5 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Билеты</h1>
          <p className="text-sm text-slate-500">Выберите билеты для продажи клиенту</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              Выбрано: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
              {' · '}
              <span className="font-semibold text-brand-blue">{totalAmount} сом</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearSelection}>Сбросить</Button>
            <Button variant="primary" size="sm" onClick={handleBuy}>Купить →</Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <TicketGrid
          tickets={tickets}
          draws={draws}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          filterDrawCode={filterDrawCode}
          onFilterDraw={setFilterDraw}
          loading={loading}
        />
      </div>

      <Modal open={step === 'form'} onClose={handleFormCancel} title="Оформление заказа" size="md">
        <OrderCreationForm
          selectedTickets={selectedTickets}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
          error={createError}
        />
      </Modal>

      <Modal
        open={step === 'payment' && createdOrder !== null}
        onClose={handleClosePayment}
        title="Ссылка на оплату"
        size="md"
      >
        {createdOrder && orderClient && (
          <PaymentLinkPanel
            createdOrder={createdOrder}
            clientFullName={orderClient.clientFullName}
            clientPhone={orderClient.clientPhone}
            onPaid={(_order: Order) => {}}
            onExpired={() => {}}
            onClose={handleClosePayment}
          />
        )}
      </Modal>
    </div>
  );
}
