'use client';

import { Ticket } from '@/shared/types';
import { cn, formatPrice } from '@/shared/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  selected?: boolean;
  onToggle?: (ticket: Ticket) => void;
}

const statusConfig = {
  available: {
    bg: 'bg-white border-slate-200 hover:border-brand-yellow hover:shadow-md cursor-pointer',
    selectedBg: 'bg-brand-yellow/10 border-brand-yellow shadow-md',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Доступен',
  },
  reserved: {
    bg: 'bg-amber-50 border-amber-200 cursor-not-allowed opacity-75',
    selectedBg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Бронь',
  },
  sold: {
    bg: 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-50',
    selectedBg: 'bg-slate-50 border-slate-200',
    badge: 'bg-slate-100 text-slate-500',
    label: 'Продан',
  },
};

export function TicketCard({ ticket, selected, onToggle }: TicketCardProps) {
  const config = statusConfig[ticket.status];
  const isSelectable = ticket.status === 'available';

  return (
    <div
      onClick={() => isSelectable && onToggle?.(ticket)}
      className={cn(
        'relative rounded-xl border-2 p-3 transition-all duration-150 select-none',
        selected ? config.selectedBg : config.bg
      )}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center">
          <svg className="w-3 h-3 text-brand-dark" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="text-center">
        <span className="text-xs text-slate-400 font-medium">{ticket.series}</span>
        <div className="text-2xl font-bold text-slate-800 leading-tight">
          {ticket.number}
        </div>
        <div className="text-xs font-medium text-slate-500 mt-0.5">{formatPrice(ticket.price)}</div>
      </div>

      <div className={cn('mt-2 text-center rounded-full px-2 py-0.5 text-xs font-medium', config.badge)}>
        {config.label}
      </div>
    </div>
  );
}
