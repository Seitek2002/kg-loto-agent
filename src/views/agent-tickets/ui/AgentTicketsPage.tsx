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
  } = useTicketsStore();

  const { createOrder, createdOrder, createError, clearCreated } = useOrdersStore();

  const [step, setStep] = useState<Step>('grid');
  const [formLoading, setFormLoading] = useState(false);
  const [orderClient, setOrderClient] = useState<{
    clientFullName: string;
    clientPhone: string;
  } | null>(null);
  const [ticketSoldNotice, setTicketSoldNotice] = useState<string | null>(null);
  useEffect(() => {
    fetchDraws();
    fetchTickets();
  }, [fetchDraws, fetchTickets]);

  useEffect(() => {
    if (!ticketSoldNotice) return;
    const timer = setTimeout(() => setTicketSoldNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [ticketSoldNotice]);

  const selectedTickets = tickets.filter((t) => selectedIds.includes(t.shortId));
  const totalAmount = selectedTickets
    .reduce((s, t) => s + (t.tirageVariant ? t.tirageVariant.pricePerTicket : parseFloat(t.ticketPrice || t.price || '0')), 0)
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
        return;
      }

      // Билет заняли/продали прямо перед бронью — штатный сценарий: закрываем
      // форму, обновляем список билетов (выбор при этом сбрасывается) и показываем баннер
      if (useOrdersStore.getState().ticketsUnavailable) {
        setStep('grid');
        setTicketSoldNotice('Билет только что продали, выберите другой');
        fetchTickets(filterDrawCode ?? undefined);
      }
    },
    [selectedIds, createOrder, removeTickets, clearSelection, fetchTickets, filterDrawCode]
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
    <div className="flex-1 overflow-hidden flex flex-col p-3 sm:p-5 gap-3 sm:gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Билеты</h1>
        </div>
        {selectedIds.length > 0 && (
          <div className="hidden sm:flex items-center gap-3">
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

      {ticketSoldNotice && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700 shrink-0 flex items-center justify-between gap-3">
          <span>{ticketSoldNotice}</span>
          <button
            onClick={() => setTicketSoldNotice(null)}
            className="text-amber-500 hover:text-amber-700 shrink-0"
          >
            ✕
          </button>
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

      {/* Mobile floating buy button */}
      {selectedIds.length > 0 && (
        <div className="sm:hidden fixed bottom-20 left-0 right-0 px-4 z-40">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500">Выбрано билетов: <span className="font-semibold text-slate-800">{selectedIds.length}</span></div>
              <div className="text-base font-bold text-brand-blue">{totalAmount} сом</div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearSelection}>Сбросить</Button>
            <Button variant="primary" onClick={handleBuy} className="px-5">Купить →</Button>
          </div>
        </div>
      )}

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
