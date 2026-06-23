'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/shared/ui';
import type { Order } from '@/shared/types';
import { formatTimeLeft } from '@/shared/lib/utils';

interface PaymentLinkPanelProps {
  order: Order;
  onSimulatePaid: () => void;
  onClose: () => void;
}

export function PaymentLinkPanel({ order, onSimulatePaid, onClose }: PaymentLinkPanelProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(order.expiresAt));
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = formatTimeLeft(order.expiresAt);
      setTimeLeft(left);
      if (new Date(order.expiresAt).getTime() <= Date.now()) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order.expiresAt]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(order.paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [order.paymentLink]);

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${order.client.phone.replace(/\D/g, '')}&text=${encodeURIComponent(
    `Здравствуйте, ${order.client.fullName}! Ваш заказ #${order.id} оформлен.\n\nОплатите ${order.totalAmount} сом по ссылке:\n${order.paymentLink}\n\nСсылка действительна 30 минут.`
  )}`;

  const isExpired = expired || order.status === 'expired';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs text-slate-500 font-medium">Заказ #{order.id}</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{order.client.fullName}</p>
          <p className="text-xs text-slate-500">{order.client.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-brand-blue">{order.totalAmount} сом</p>
          <p className="text-xs text-slate-500">{order.ticketIds.length} билет(а)</p>
        </div>
      </div>

      {!isExpired && (
        <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">Осталось: {timeLeft}</span>
        </div>
      )}

      {isExpired && (
        <div className="text-center text-red-600 bg-red-50 rounded-lg px-4 py-2 text-sm font-medium">
          Время бронирования истекло. Билеты возвращены в пул.
        </div>
      )}

      {!isExpired && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Ссылка на оплату (ELQR)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate text-sm text-brand-blue font-mono bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                {order.paymentLink}
              </div>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 rounded-lg px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {copied ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Отправить в WhatsApp
            </a>

            <Button
              variant="secondary"
              onClick={onSimulatePaid}
              className="w-full"
            >
              Симулировать оплату
            </Button>
          </div>
        </>
      )}

      <Button variant="ghost" onClick={onClose} className="w-full">
        Закрыть
      </Button>
    </div>
  );
}
