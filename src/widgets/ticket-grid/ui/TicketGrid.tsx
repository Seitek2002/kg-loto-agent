'use client';

import { useMemo } from 'react';
import { TicketCard } from '@/entities/ticket/ui/TicketCard';
import type { Ticket, Draw } from '@/shared/types';
import { formatPrice } from '@/shared/lib/utils';

interface TicketGridProps {
  tickets: Ticket[];
  draws: Draw[];
  selectedIds: string[];
  onToggle: (ticket: Ticket) => void;
  filterDrawId: string | null;
  filterStatus: Ticket['status'] | 'all';
  onFilterDraw: (id: string | null) => void;
  onFilterStatus: (status: Ticket['status'] | 'all') => void;
}

export function TicketGrid({
  tickets,
  draws,
  selectedIds,
  onToggle,
  filterDrawId,
  filterStatus,
  onFilterDraw,
  onFilterStatus,
}: TicketGridProps) {
  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (filterDrawId && t.drawId !== filterDrawId) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        return true;
      }),
    [tickets, filterDrawId, filterStatus]
  );

  const stats = useMemo(
    () => ({
      available: tickets.filter((t) => t.status === 'available').length,
      reserved: tickets.filter((t) => t.status === 'reserved').length,
      sold: tickets.filter((t) => t.status === 'sold').length,
    }),
    [tickets]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onFilterDraw(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              !filterDrawId
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            Все тиражи
          </button>
          {draws.map((d) => (
            <button
              key={d.id}
              onClick={() => onFilterDraw(d.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                filterDrawId === d.id
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex gap-2">
          {(['all', 'available', 'reserved', 'sold'] as const).map((s) => {
            const labels = {
              all: 'Все',
              available: `Доступно (${stats.available})`,
              reserved: `Бронь (${stats.reserved})`,
              sold: `Продано (${stats.sold})`,
            };
            return (
              <button
                key={s}
                onClick={() => onFilterStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  filterStatus === s
                    ? 'bg-brand-yellow text-brand-dark border-brand-yellow'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price info */}
      {draws.find((d) => d.id === filterDrawId) && (
        <div className="flex gap-4">
          {(() => {
            const draw = draws.find((d) => d.id === filterDrawId)!;
            return (
              <>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Дата тиража:</span>{' '}
                  {new Date(draw.date).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Джекпот:</span>{' '}
                  {formatPrice(draw.jackpot)}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Нет билетов по выбранному фильтру</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 gap-2">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              selected={selectedIds.includes(ticket.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
