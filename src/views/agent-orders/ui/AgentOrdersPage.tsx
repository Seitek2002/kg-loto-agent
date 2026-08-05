'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { agentApi } from '@/shared/api/agent';
import { Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import type { Order, RevenueData } from '@/shared/types';
import { REGIONS } from '@/features/orders/ui/OrderCreationForm';

const STATUS_FILTERS = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'Ожидают' },
  { value: 'paid', label: 'Оплачены' },
  { value: 'expired', label: 'Истекшие' },
  { value: 'cancelled', label: 'Отменённые' },
  { value: 'failed', label: 'Ошибка' },
  { value: 'refund_required', label: 'Возврат' },
] as const;

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  paid: { label: 'Оплачен', variant: 'success' },
  pending: { label: 'Ожидает', variant: 'warning' },
  cancelled: { label: 'Отменён', variant: 'danger' },
  expired: { label: 'Истёк', variant: 'neutral' },
  failed: { label: 'Ошибка', variant: 'danger' },
  refund_required: { label: 'Требуется возврат', variant: 'danger' },
};

export function AgentOrdersPage() {
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrdersStore();
  const [filter, setFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchData = useCallback(() => {
    const params = {
      status: filter || undefined,
      region: regionFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    fetchOrders(params);
    agentApi.revenue({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
      .then(setRevenue)
      .catch(() => null);
  }, [fetchOrders, filter, regionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      agentApi.revenue({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
        .then(setRevenue)
        .catch(() => null);
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchData, dateFrom, dateTo]);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const paidCount = orders.filter((o) => o.status === 'paid').length;

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

        {/* Date + region filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Период:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
          />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
          >
            <option value="">Все регионы</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {(dateFrom || dateTo || regionFilter) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setRegionFilter(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {revenue ? revenue.paidOrdersCount : paidCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Оплачено</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-brand-blue">
              {revenue
                ? `${Number(revenue.totalRevenue).toLocaleString('ru-RU')} ${revenue.currency}`
                : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Выручка</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pending}</div>
            <div className="text-xs text-slate-500 mt-0.5">Ожидают</div>
          </div>
        </div>

        {/* Status filter */}
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
                        {order.regionDisplay && (
                          <div><span className="font-medium">Регион:</span> {order.regionDisplay}</div>
                        )}
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
                  {order.status === 'pending' && order.payUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                      <a
                        href={order.payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-blue hover:underline break-all flex-1 min-w-0 truncate"
                      >
                        {order.payUrl}
                      </a>
                      <button
                        onClick={() => handleCopy(order.payUrl, order.id)}
                        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          copiedId === order.id
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-brand-blue hover:text-brand-blue'
                        }`}
                      >
                        {copiedId === order.id ? '✓ Скопировано' : 'Скопировать ссылку'}
                      </button>
                    </div>
                  )}
                  {order.status === 'paid' && order.pdfFile && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={order.pdfFile.startsWith('http') ? order.pdfFile : `https://kgloto.com${order.pdfFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand-blue transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-blue bg-white"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Скачать PDF
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
