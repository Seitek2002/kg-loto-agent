'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { agentApi } from '@/shared/api/agent';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';
import type { RevenueData } from '@/shared/types';

function currentMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return { dateFrom: `${y}-${m}-01`, dateTo: `${y}-${m}-${lastDay}` };
}

export function AgentDashboardPage() {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { draws, fetchDraws } = useTicketsStore();
  const [revenue, setRevenue] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchDraws();
    const { dateFrom, dateTo } = currentMonthRange();
    agentApi.revenue({ dateFrom, dateTo }).then(setRevenue).catch(() => null);
  }, [fetchOrders, fetchDraws]);

  const paid = orders.filter((o) => o.status === 'paid');
  const pending = orders.filter((o) => o.status === 'pending').length;
  const totalAvailable = draws.reduce((s, d) => s + d.availableCount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Добро пожаловать, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500">Статистика за текущий месяц</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Выручка</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {revenue
                ? Number(revenue.paidOrdersAmount).toLocaleString('ru-RU')
                : paid.reduce((s, o) => s + parseFloat(o.amount), 0).toLocaleString('ru-RU')}{' '}
              сом
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Оплачено заказов</div>
            <div className="text-3xl font-bold text-brand-blue mt-1">
              {revenue ? revenue.paidOrdersCount : paid.length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ожидают оплаты</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">{pending}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Доступно билетов</div>
            <div className="text-3xl font-bold text-slate-700 mt-1">{totalAvailable}</div>
          </div>
        </div>

        {revenue && (
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-brand-blue/70 font-medium uppercase tracking-wide">Комиссия агента (месяц)</div>
              <div className="text-2xl font-bold text-brand-blue mt-0.5">
                {(Number(revenue.totalRevenue)).toLocaleString('ru-RU')} {revenue.currency}
              </div>
            </div>
            <svg className="w-10 h-10 text-brand-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Link
            href={ROUTES.AGENT.TICKETS}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-yellow/50 bg-brand-yellow/5 p-6 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-colors"
          >
            <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Продать билеты</span>
          </Link>
          <Link
            href={ROUTES.AGENT.ORDERS}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">Мои заказы</span>
          </Link>
        </div>

        <Card>
          <CardHeader
            title="Последние заказы"
            action={
              <Link href={ROUTES.AGENT.ORDERS} className="text-xs text-brand-blue hover:underline">
                Все заказы →
              </Link>
            }
          />
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Нет заказов</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{o.clientFullName}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-slate-900">{o.amount} сом</p>
                    <Badge
                      variant={
                        o.status === 'paid' ? 'success' :
                        o.status === 'pending' ? 'warning' :
                        o.status === 'failed' || o.status === 'cancelled' ? 'danger' : 'neutral'
                      }
                    >
                      {o.statusDisplay}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
