'use client';

import { useMemo, useState } from 'react';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { MOCK_DRAWS } from '@/shared/lib/mockData';
import { formatPrice } from '@/shared/lib/utils';

export function AdminTicketsPage() {
  const { tickets } = useTicketsStore();
  const agents = useAdminStore((s) => s.agents);
  const [selectedDraw, setSelectedDraw] = useState<string | null>(null);

  const filteredTickets = useMemo(
    () =>
      selectedDraw ? tickets.filter((t) => t.drawId === selectedDraw) : tickets,
    [tickets, selectedDraw]
  );

  const drawStats = useMemo(
    () =>
      MOCK_DRAWS.map((d) => {
        const drawTickets = tickets.filter((t) => t.drawId === d.id);
        return {
          draw: d,
          total: drawTickets.length,
          available: drawTickets.filter((t) => t.status === 'available').length,
          reserved: drawTickets.filter((t) => t.status === 'reserved').length,
          sold: drawTickets.filter((t) => t.status === 'sold').length,
          revenue: drawTickets.filter((t) => t.status === 'sold').length * d.ticketPrice,
        };
      }),
    [tickets]
  );

  const getAgentName = (agentId: string) =>
    agents.find((a) => a.id === agentId)?.name ?? 'Неизвестен';

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Пул билетов</h1>
          <p className="text-sm text-slate-500">Обзор тиражей и распределения билетов</p>
        </div>

        {/* Draw stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drawStats.map(({ draw, total, available, reserved, sold, revenue }) => (
            <Card key={draw.id}>
              <CardHeader
                title={draw.name}
                subtitle={`Дата тиража: ${new Date(draw.date).toLocaleDateString('ru-RU')}`}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Джекпот</span>
                  <span className="font-semibold text-brand-blue">{formatPrice(draw.jackpot)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Выручка</span>
                  <span className="font-semibold text-emerald-600">{formatPrice(revenue)}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{available}</div>
                    <div className="text-xs text-slate-500">Доступно</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-600">{reserved}</div>
                    <div className="text-xs text-slate-500">Бронь</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-500">{sold}</div>
                    <div className="text-xs text-slate-500">Продано</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="bg-slate-400 transition-all"
                    style={{ width: `${(sold / total) * 100}%` }}
                  />
                  <div
                    className="bg-amber-400 transition-all"
                    style={{ width: `${(reserved / total) * 100}%` }}
                  />
                  <div
                    className="bg-emerald-400 transition-all"
                    style={{ width: `${(available / total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">{sold} из {total} продано</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter by draw */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDraw(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              !selectedDraw ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            Все тиражи
          </button>
          {MOCK_DRAWS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDraw(d.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selectedDraw === d.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Ticket table */}
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Билет</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Тираж</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Цена</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Агент</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.slice(0, 30).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {ticket.series}-{ticket.number}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ticket.drawName}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPrice(ticket.price)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          ticket.status === 'available' ? 'success' :
                          ticket.status === 'reserved' ? 'warning' : 'neutral'
                        }
                      >
                        {ticket.status === 'available' ? 'Доступен' :
                         ticket.status === 'reserved' ? 'Бронь' : 'Продан'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket.reservedBy ? getAgentName(ticket.reservedBy) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTickets.length > 30 && (
              <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                Показано 30 из {filteredTickets.length} билетов
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
