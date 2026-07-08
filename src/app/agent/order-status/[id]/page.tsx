'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { fetchOrderStatus } from '@/shared/api/agent';

type OrderStatus = 'pending' | 'paid' | 'expired' | 'failed' | 'cancelled' | 'refund_required';

interface OrderData {
  id: number;
  status: string;
  statusDisplay: string;
  amount: string;
  clientFullName: string;
  paidAt: string | null;
  reservedUntil: string;
}

const STATUS_CONFIG: Record<OrderStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
  bg: string;
  border: string;
  text: string;
}> = {
  paid: {
    icon: (
      <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Оплата прошла успешно',
    description: 'Спасибо! Ваши билеты отправлены.',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  pending: {
    icon: (
      <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Ожидаем оплату',
    description: 'Оплатите по ссылке, которую вам отправил агент.',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  expired: {
    icon: (
      <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Время истекло',
    description: 'Срок оплаты истёк. Обратитесь к агенту для оформления нового заказа.',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
  },
  failed: {
    icon: (
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: 'Ошибка оплаты',
    description: 'Оплата не прошла. Обратитесь к агенту.',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
  },
  cancelled: {
    icon: (
      <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    title: 'Заказ отменён',
    description: 'Заказ был отменён. Обратитесь к агенту.',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
  },
  refund_required: {
    icon: (
      <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: 'Оплата получена',
    description: 'Билеты недоступны — оформляется возврат.',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
  },
};

const FINAL_STATUSES: OrderStatus[] = ['paid', 'expired', 'failed', 'cancelled', 'refund_required'];

export default function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setChecking(true);
    try {
      const data = await fetchOrderStatus(id);
      setOrder(data);
      setError(null);
    } catch {
      setError('Не удалось загрузить статус заказа');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 10s while status is pending
  useEffect(() => {
    if (!order || FINAL_STATUSES.includes(order.status as OrderStatus)) return;
    const interval = setInterval(() => load(), 10_000);
    return () => clearInterval(interval);
  }, [order, load]);

  const status = (order?.status ?? 'pending') as OrderStatus;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const isFinal = FINAL_STATUSES.includes(status);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Image src="/logo.png" alt="KGLOTO" width={32} height={32} />
        <span className="font-bold text-slate-800 tracking-wide">KGLOTO.Агент</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Загружаем статус…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 px-6 text-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => load(true)}
              className="mt-2 text-sm text-brand-blue hover:underline"
            >
              Попробовать снова
            </button>
          </div>
        ) : order ? (
          <>
            {/* Status block */}
            <div className={`${config.bg} ${config.border} border-b px-6 py-8 flex flex-col items-center gap-3 text-center`}>
              {config.icon}
              <h1 className={`text-lg font-bold ${config.text}`}>{config.title}</h1>
              <p className="text-sm text-slate-500">{config.description}</p>
            </div>

            {/* Order details */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Номер заказа</span>
                <span className="font-semibold text-slate-800">#{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Сумма</span>
                <span className="font-bold text-brand-blue text-base">{order.amount} сом</span>
              </div>
              {order.clientFullName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Клиент</span>
                  <span className="font-medium text-slate-800 text-right max-w-[180px]">{order.clientFullName}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Оплачено</span>
                  <span className="text-slate-700">{new Date(order.paidAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {/* Refresh button for pending */}
            {!isFinal && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => load(true)}
                  disabled={checking}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60"
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
                      Обновить статус
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      <p className="mt-6 text-xs text-slate-400">© 2026 ОсОО «Кей Джи Лотерея»</p>
    </div>
  );
}
