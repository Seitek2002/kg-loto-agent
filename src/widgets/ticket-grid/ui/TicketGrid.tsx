'use client';

import { TicketCard } from '@/entities/ticket/ui/TicketCard';
import type { Ticket, Draw } from '@/shared/types';

interface TicketGridProps {
  tickets: Ticket[];
  draws: Draw[];
  selectedIds: string[];
  onToggle: (ticket: Ticket) => void;
  filterDrawCode: string | null;
  onFilterDraw: (code: string | null) => void;
  loading?: boolean;
}

export function TicketGrid({
  tickets,
  draws,
  selectedIds,
  onToggle,
  filterDrawCode,
  onFilterDraw,
  loading,
}: TicketGridProps) {
  const activeDraw = draws.find((d) => d.drawCode === filterDrawCode);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Draw filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterDraw(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
            !filterDrawCode
              ? 'bg-brand-blue text-white border-brand-blue'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          Все тиражи
        </button>
        {draws.map((d) => (
          <button
            key={d.drawCode}
            onClick={() => onFilterDraw(d.drawCode)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              filterDrawCode === d.drawCode
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {d.drawName}
            <span className="ml-1.5 opacity-70">({d.availableCount})</span>
          </button>
        ))}
      </div>

      {/* Active draw info */}
      {activeDraw && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {activeDraw.drawAt && (
            <span>
              <span className="font-medium">Дата тиража:</span>{' '}
              {new Date(activeDraw.drawAt).toLocaleDateString('ru-RU')}
            </span>
          )}
          <span>
            <span className="font-medium">Призовой фонд:</span>{' '}
            {Number(activeDraw.prizePool).toLocaleString('ru-RU')} сом
          </span>
          <span>
            <span className="font-medium">Цена билета:</span> {activeDraw.pricePerTicket} сом
          </span>
          {activeDraw.salesDeadlineAt && (
            <span>
              <span className="font-medium">Продажи до:</span>{' '}
              {new Date(activeDraw.salesDeadlineAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      )}

      {/* Ticket list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Загрузка билетов…</span>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
          <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-sm">Нет доступных билетов</p>
          {!filterDrawCode && (
            <p className="text-xs">Выберите тираж или дождитесь назначения пула</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tickets.map((ticket) => {
            const gridCount = ticket.tirageGrids?.length ?? ticket.gridCount ?? 1;
            const span = gridCount >= 2 ? 'sm:col-span-2' : '';
            return (
              <div key={ticket.id} className={span}>
                <TicketCard
                  ticket={ticket}
                  selected={selectedIds.includes(ticket.shortId)}
                  onToggle={onToggle}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
