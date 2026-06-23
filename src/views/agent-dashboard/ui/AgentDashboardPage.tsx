'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';

export function AgentDashboardPage() {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { draws, fetchDraws } = useTicketsStore();

  useEffect(() => {
    fetchOrders();
    fetchDraws();
  }, [fetchOrders, fetchDraws]);

  const paid = orders.filter((o) => o.status === 'paid');
  const revenue = paid.reduce((s, o) => s + parseFloat(o.amount), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const totalAvailable = draws.reduce((s, d) => s + d.availableCount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Добро пожаловать, {user?.fullName?.split(' ')[1] ?? user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500">Ваша статистика за всё время</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Продано билетов</div>
            <div className="text-3xl font-bold text-brand-blue mt-1">
              {paid.reduce((s, o) => s + o.tickets.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Выручка</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {revenue.toLocaleString('ru-RU')} сом
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
