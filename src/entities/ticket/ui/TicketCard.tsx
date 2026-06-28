'use client';

import { Ticket } from '@/shared/types';
import { cn } from '@/shared/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  selected?: boolean;
  onToggle?: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, selected, onToggle }: TicketCardProps) {
  const isReserved = ticket.reservedUntil !== null;

  return (
    <div
      onClick={() => !isReserved && onToggle?.(ticket)}
      className={cn(
        'relative rounded-xl border-2 p-3 transition-all duration-150 select-none text-sm',
        isReserved
          ? 'border-amber-200 bg-amber-50/60 opacity-60 cursor-not-allowed'
          : selected
          ? 'border-brand-yellow bg-brand-yellow/10 shadow-md cursor-pointer'
          : 'border-slate-200 bg-white hover:border-brand-yellow/60 hover:shadow-sm cursor-pointer'
      )}
    >
      {/* Checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-brand-dark" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Draw name */}
      <div className="text-xs text-slate-400 font-medium truncate pr-6">{ticket.drawName}</div>

      {/* Serial (shortened) */}
      <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
        {ticket.serial.split('-').slice(-2).join('-')}
      </div>

      {/* Grids */}
      {ticket.tirageGrids && ticket.tirageGrids.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {ticket.tirageGrids.map((grid) => (
            <div key={grid.position}>
              {ticket.gridCount && ticket.gridCount > 1 && (
                <span className="text-xs text-slate-400">Сетка {grid.position}:</span>
              )}
              <div className="flex flex-wrap gap-1 mt-0.5">
                {grid.numbers.map((n) => (
                  <span
                    key={n}
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold',
                      selected
                        ? 'bg-brand-yellow/30 text-brand-dark'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-400">Нет данных о комбинации</div>
      )}

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-blue">
          {ticket.tirageVariant ? ticket.tirageVariant.pricePerTicket : ticket.ticketPrice} сом
        </span>
        {isReserved && (
          <span className="text-xs text-amber-600 font-medium">Бронь</span>
        )}
      </div>
    </div>
  );
}
