'use client';

import { useEffect, useMemo } from 'react';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { Card, CardHeader, Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';

export function AdminDashboardPage() {
  const { agents, orders, fetchAgents, fetchOrders } = useAdminStore();
  const { draws, fetchDraws } = useTicketsStore();

  useEffect(() => {
    fetchAgents();
    fetchOrders();
    fetchDraws();
  }, [fetchAgents, fetchOrders, fetchDraws]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'paid');
    return {
      totalRevenue: paid.reduce((s, o) => s + parseFloat(o.amount), 0),
      paidOrders: paid.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      activeAgents: agents.filter((a) => a.isActive).length,
      availableTickets: draws.reduce((s, d) => s + d.availableCount, 0),
      soldTickets: paid.reduce((s, o) => s + o.tickets.length, 0),
    };
  }, [orders, agents, draws]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [orders]
  );

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Панель администратора</h1>
          <p className="text-sm text-slate-500">Общая статистика по системе</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Выручка</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.totalRevenue.toLocaleString('ru-RU')} сом
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Оплачено заказов</div>
            <div className="text-2xl font-bold text-brand-blue mt-1">{stats.paidOrders}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ожидают оплаты</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingOrders}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Активных агентов</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{stats.activeAgents}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Доступно билетов</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{stats.availableTickets}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Продано билетов</div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{stats.soldTickets}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link href={ROUTES.ADMIN.AGENTS} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm hover:border-brand-blue/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Агенты</p>
              <p className="text-xs text-slate-500">{agents.length} агентов</p>
            </div>
          </Link>
          <Link href={ROUTES.ADMIN.TICKETS} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm hover:border-brand-blue/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-brand-yellow/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Тиражи</p>
              <p className="text-xs text-slate-500">{draws.length} тиражей</p>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader title="Последние заказы по всем агентам" />
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Нет заказов</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{o.id}</span>
                      <Badge
                        variant={
                          o.status === 'paid' ? 'success' :
                          o.status === 'pending' ? 'warning' :
                          o.status === 'cancelled' || o.status === 'failed' ? 'danger' : 'neutral'
                        }
                      >
                        {o.statusDisplay}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{o.clientFullName}</p>
                    {o.agentName && (
                      <p className="text-xs text-slate-400">Агент: {o.agentName} · {formatDateTime(o.createdAt)}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{o.amount} сом</p>
                    <p className="text-xs text-slate-400">{o.tickets.length} билет(а)</p>
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
