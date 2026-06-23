'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useOrdersStore } from '@/features/orders/model/ordersStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { formatPrice, formatDateTime } from '@/shared/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';

export function AgentDashboardPage() {
  const { user } = useAuthStore();
  const { orders } = useOrdersStore();
  const { tickets } = useTicketsStore();
  const agents = useAdminStore((s) => s.agents);

  const agent = agents.find((a) => a.id === user?.id);
  const agentOrders = useMemo(
    () => orders.filter((o) => o.agentId === user?.id),
    [orders, user]
  );

  const agentTickets = agent
    ? tickets.filter((t) => agent.ticketPoolIds.includes(t.id))
    : [];

  const stats = {
    totalSold: agentOrders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.ticketIds.length, 0),
    revenue: agentOrders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.totalAmount, 0),
    pending: agentOrders.filter((o) => o.status === 'pending').length,
    available: agentTickets.filter((t) => t.status === 'available').length,
  };

  const recentOrders = agentOrders.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Добро пожаловать, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-slate-500">Ваша статистика за всё время</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Продано билетов</div>
            <div className="text-3xl font-bold text-brand-blue mt-1">{stats.totalSold}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Выручка</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{formatPrice(stats.revenue)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ожидают оплаты</div>
            <div className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Доступно билетов</div>
            <div className="text-3xl font-bold text-slate-700 mt-1">{stats.available}</div>
          </div>
        </div>

        {/* Quick actions */}
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

        {/* Recent orders */}
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
                    <p className="text-sm font-medium text-slate-800">{o.client.fullName}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatPrice(o.totalAmount)}</p>
                    <Badge variant={
                      o.status === 'paid' ? 'success' :
                      o.status === 'pending' ? 'warning' :
                      o.status === 'cancelled' ? 'danger' : 'neutral'
                    }>
                      {o.status === 'paid' ? 'Оплачен' : o.status === 'pending' ? 'Ожидает' : o.status === 'cancelled' ? 'Отменён' : 'Истёк'}
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
