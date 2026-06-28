'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';

export function AdminTicketsPage() {
  const { draws, fetchDraws } = useTicketsStore();
  const { orders, fetchOrders, loadingOrders } = useAdminStore();
  const [selectedDraw, setSelectedDraw] = useState<string>('');

  useEffect(() => {
    fetchDraws();
    fetchOrders();
  }, [fetchDraws, fetchOrders]);

  const drawStats = useMemo(() => {
    return draws.map((d) => {
      const drawOrders = orders.filter(
        (o) => o.status === 'paid' && o.tickets.some((t) => t.drawName === d.name)
      );
      const soldCount = drawOrders.reduce((s, o) =>
        s + o.tickets.filter((t) => t.drawName === d.name).length, 0
      );
      const revenue = drawOrders.reduce((s, o) => {
        const drawTickets = o.tickets.filter((t) => t.drawName === d.name);
        return s + drawTickets.reduce((ts, t) => ts + parseFloat(t.ticketPrice || '0'), 0);
      }, 0);
      return { draw: d, soldCount, revenue };
    });
  }, [draws, orders]);

  const filteredOrders = useMemo(() => {
    if (!selectedDraw) return orders;
    return orders.filter((o) => o.tickets.some((t) => {
      const draw = draws.find((d) => d.code === selectedDraw);
      return draw && t.drawName === draw.name;
    }));
  }, [orders, selectedDraw, draws]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Тиражи и пул билетов</h1>
          <p className="text-sm text-slate-500">Обзор тиражей и статистика продаж</p>
        </div>

        {/* Draw overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drawStats.map(({ draw, soldCount, revenue }) => (
            <Card key={draw.id}>
              <CardHeader
                title={draw.name}
                subtitle={draw.drawAt ? `Тираж: ${formatDateTime(draw.drawAt)}` : 'Дата не указана'}
              />
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Призовой фонд</span>
                  <span className="font-semibold text-brand-blue">
                    {parseFloat(draw.prizePool).toLocaleString('ru-RU')} сом
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Выручка (оплачено)</span>
                  <span className="font-semibold text-emerald-600">{revenue.toLocaleString('ru-RU')} сом</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Цена билета</span>
                  <span className="font-semibold text-slate-700">{draw.pricePerTicket} сом</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{draw.statusDisplay}</div>
                    <div className="text-xs text-slate-500">Статус</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-600">{soldCount}</div>
                    <div className="text-xs text-slate-500">Продано</div>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant={draw.status === 'printing' ? 'success' : draw.status === 'finished' ? 'neutral' : 'danger'}>
                    {draw.statusDisplay}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter by draw */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDraw('')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              !selectedDraw ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            Все тиражи
          </button>
          {draws.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDraw(d.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                selectedDraw === d.code ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <Card padding={false}>
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Заказы</h3>
          </div>
          {loadingOrders ? (
            <div className="text-center py-8 text-slate-400 text-sm">Загрузка…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['#', 'Клиент', 'Агент', 'Билеты', 'Сумма', 'Статус', 'Создан'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.slice(0, 50).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">#{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{order.clientFullName}</div>
                        <div className="text-xs text-slate-400">{order.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{order.agentName ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.tickets.map((t) => t.serial.split('-').slice(-2).join('-')).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{order.amount} сом</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.status === 'paid' ? 'success' :
                            order.status === 'pending' ? 'warning' :
                            order.status === 'cancelled' || order.status === 'failed' ? 'danger' : 'neutral'
                          }
                        >
                          {order.statusDisplay}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length > 50 && (
                <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                  Показано 50 из {filteredOrders.length} заказов
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
