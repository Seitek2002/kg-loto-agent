'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/ui';
import type { Order } from '@/shared/types';
import { formatTimeLeft } from '@/shared/lib/utils';
import { agentApi } from '@/shared/api/agent';

interface CreatedOrder {
  orderId: number;
  status: string;
  amount: string;
  payUrl: string;
  reservedUntil: string;
}

interface PaymentLinkPanelProps {
  createdOrder: CreatedOrder;
  clientFullName: string;
  clientPhone: string;
  onPaid: (order: Order) => void;
  onExpired: () => void;
  onClose: () => void;
}

const POLL_INTERVAL_MS = 7_000;

export function PaymentLinkPanel({
  createdOrder,
  clientFullName,
  clientPhone,
  onPaid,
  onExpired,
  onClose,
}: PaymentLinkPanelProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(createdOrder.reservedUntil));
  const [copied, setCopied] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Open payment URL in new tab on mount
  useEffect(() => {
    window.open(createdOrder.payUrl, '_blank', 'noopener,noreferrer');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(createdOrder.reservedUntil));
      if (new Date(createdOrder.reservedUntil).getTime() <= Date.now()) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [createdOrder.reservedUntil]);

  // Polling for payment status
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      try {
        const order = await agentApi.order(createdOrder.orderId);
        if (['paid', 'expired', 'failed', 'cancelled'].includes(order.status)) {
          clearInterval(pollingRef.current!);
          setFinalStatus(order.status);
          if (order.status === 'paid') onPaid(order);
          else onExpired();
        }
      } catch {
        // ignore transient errors
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [createdOrder.orderId, onPaid, onExpired]);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    try {
      const order = await agentApi.order(createdOrder.orderId);
      if (['paid', 'expired', 'failed', 'cancelled'].includes(order.status)) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setFinalStatus(order.status);
        if (order.status === 'paid') onPaid(order);
        else onExpired();
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  }, [createdOrder.orderId, onPaid, onExpired]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(createdOrder.payUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [createdOrder.payUrl]);

  const phoneDigits = clientPhone.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(
    `Здравствуйте, ${clientFullName}!\n\nВаш заказ #${createdOrder.orderId} оформлен.\nСумма: ${createdOrder.amount} сом\n\nОплатите по ссылке:\n${createdOrder.payUrl}\n\nСсылка действительна 30 минут.`
  )}`;

  const isExpired = new Date(createdOrder.reservedUntil).getTime() <= Date.now();
  const isDone = finalStatus !== null;

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs text-slate-500 font-medium">Заказ #{createdOrder.orderId}</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{clientFullName}</p>
          <p className="text-xs text-slate-500">{clientPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-brand-blue">{createdOrder.amount} сом</p>
        </div>
      </div>

      {/* Status messages */}
      {finalStatus === 'paid' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Оплата подтверждена! Билеты отправлены клиенту в WhatsApp.
        </div>
      )}

      {(finalStatus === 'expired' || (isExpired && !isDone)) && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
          Время бронирования истекло. Билеты возвращены в пул.
        </div>
      )}

      {finalStatus === 'failed' && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
          Оплата отклонена. Билеты возвращены в пул.
        </div>
      )}

      {/* Timer + manual check */}
      {!isDone && !isExpired && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-2.5">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold">Осталось: {timeLeft}</span>
          </div>
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-60"
          >
            {checking ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Проверяем…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Проверить статус оплаты
              </>
            )}
          </button>
        </div>
      )}

      {/* Payment link */}
      {!isDone && !isExpired && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Ссылка на оплату (ELQR)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate text-sm text-brand-blue font-mono bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                {createdOrder.payUrl}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-lg px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {copied ? '✓' : 'Копировать'}
              </button>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Отправить ссылку в WhatsApp
          </a>
        </>
      )}

      <Button variant="ghost" onClick={onClose} className="w-full">
        {isDone ? 'Закрыть' : 'Свернуть'}
      </Button>
    </div>
  );
}
