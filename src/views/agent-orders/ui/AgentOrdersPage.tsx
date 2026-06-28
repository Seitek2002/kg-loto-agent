'use client';

import { useState, useEffect } from 'react';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import type { Order } from '@/shared/types';

const STATUS_FILTERS = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'Ожидают' },
  { value: 'paid', label: 'Оплачены' },
  { value: 'expired', label: 'Истекшие' },
  { value: 'cancelled', label: 'Отменённые' },
  { value: 'failed', label: 'Ошибка' },
] as const;

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  paid: { label: 'Оплачен', variant: 'success' },
  pending: { label: 'Ожидает', variant: 'warning' },
  cancelled: { label: 'Отменён', variant: 'danger' },
  expired: { label: 'Истёк', variant: 'neutral' },
  failed: { label: 'Ошибка', variant: 'danger' },
};

export function AgentOrdersPage() {
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrdersStore();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders(filter || undefined);
  }, [fetchOrders, filter]);

  const paid = orders.filter((o) => o.status === 'paid');
  const revenue = paid.reduce((s, o) => s + parseFloat(o.amount), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;

  const handleCancel = async (order: Order) => {
    if (!confirm(`Отменить заказ #${order.id}? Билеты вернутся в пул.`)) return;
    await cancelOrder(order.id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Мои заказы</h1>
          <p className="text-sm text-slate-500">История оформленных заказов</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{paid.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Оплачено</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-brand-blue">
              {revenue.toLocaleString('ru-RU')} сом
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Выручка</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pending}</div>
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

        {loading ? (
          <div className="flex justify-center py-12 text-slate-400 text-sm">Загрузка…</div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Нет заказов</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const badge = STATUS_BADGE[order.status] ?? { label: order.statusDisplay, variant: 'neutral' as const };
              return (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">#{order.id}</span>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-sm text-slate-600">
                        <div><span className="font-medium">Клиент:</span> {order.clientFullName}</div>
                        <div><span className="font-medium">Телефон:</span> {order.clientPhone}</div>
                        {order.tickets.length > 0 && (
                          <div>
                            <span className="font-medium">Билеты ({order.tickets.length}):</span>{' '}
                            {order.tickets.map((t) => t.serial.split('-').slice(-2).join('-')).join(', ')}
                          </div>
                        )}
                        <div><span className="font-medium">Создан:</span> {formatDateTime(order.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-brand-blue">{order.amount} сом</div>
                      {order.commissionAmount && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Комиссия: {order.commissionAmount} сом
                        </div>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order)}
                          className="mt-2 text-xs text-red-500 hover:underline"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <a
                        href={order.payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-blue hover:underline break-all"
                      >
                        {order.payUrl}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
