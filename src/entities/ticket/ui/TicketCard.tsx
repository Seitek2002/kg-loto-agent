'use client';

import Image from 'next/image';
import { Ticket } from '@/shared/types';
import { cn } from '@/shared/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  selected?: boolean;
  onToggle?: (ticket: Ticket) => void;
}

const GRID_SIZE = 36;
const ALL_NUMBERS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

export function TicketCard({ ticket, selected, onToggle }: TicketCardProps) {
  const isReserved = ticket.reservedUntil !== null;
  const price = ticket.tirageVariant ? ticket.tirageVariant.pricePerTicket : ticket.ticketPrice;
  const hasGrids = ticket.tirageGrids && ticket.tirageGrids.length > 0;
  const allSelected = ticket.tirageGrids?.flatMap((g) => g.numbers) ?? [];

  return (
    <div
      onClick={() => !isReserved && onToggle?.(ticket)}
      className={cn(
        'relative bg-white rounded-3xl p-4 shadow-sm border flex flex-col transition-colors duration-200 select-none',
        isReserved
          ? 'border-amber-200 bg-amber-50/60 opacity-60 cursor-not-allowed'
          : selected
          ? 'border-[#4B4B4B] cursor-pointer'
          : 'border-gray-100 hover:border-gray-300 cursor-pointer'
      )}
    >
      {/* Side cutouts */}
      <div className="absolute -left-2 top-7.5 w-4 h-4 bg-slate-100 rounded-full border-r border-gray-100" />
      <div className="absolute -right-2 top-7.5 w-4 h-4 bg-slate-100 rounded-full border-l border-gray-100" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3 mb-3">
        <div className="min-w-0 flex items-center gap-2">
          {ticket.logo && (
            <Image src={ticket.logo} alt={ticket.drawName} width={28} height={28} className="rounded object-contain shrink-0" unoptimized />
          )}
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{ticket.drawName}</div>
            <div className="text-xs text-gray-500 font-mono truncate">
              №{ticket.serial.split('-').slice(-2).join('-')}
            </div>
          </div>
        </div>
        <div className="shrink-0 ml-2 text-right">
          <span className="font-bold text-[#4B4B4B] text-sm">{price} <span className="underline text-xs">с</span></span>
          {ticket.gridCount && ticket.gridCount > 1 && (
            <div className="text-[10px] text-gray-400">{ticket.gridCount} сеток</div>
          )}
        </div>
      </div>

      {/* Number grid */}
      {hasGrids ? (
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {ALL_NUMBERS.map((num) => (
            <div
              key={num}
              className={cn(
                'flex items-center justify-center aspect-square rounded-md text-[11px] font-bold transition-colors',
                allSelected.includes(num)
                  ? 'bg-[#FF7600] text-white shadow-sm'
                  : 'bg-[#F5F5F5] text-[#4B4B4B]'
              )}
            >
              {num}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-gray-400">Нет данных о комбинации</div>
      )}

      {/* Footer */}
      {isReserved ? (
        <div className="w-full py-2.5 rounded-2xl text-xs font-bold text-center bg-amber-50 text-amber-600 border border-amber-200">
          Забронирован
        </div>
      ) : (
        <div
          className={cn(
            'w-full py-2.5 rounded-2xl text-xs font-bold text-center transition-colors',
            selected
              ? 'bg-[#4B4B4B] text-white'
              : 'bg-[#FF7600] text-white'
          )}
        >
          {selected ? 'Выбран' : `Выбрать • ${price} с`}
        </div>
      )}
    </div>
  );
}
