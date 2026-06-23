'use client';

import { useState } from 'react';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { useTicketsStore } from '@/features/tickets/model/ticketsStore';
import { AgentRow } from '@/entities/agent/ui/AgentRow';
import { AddAgentModal } from '@/widgets/add-agent-modal/ui/AddAgentModal';
import { Button, Card } from '@/shared/ui';
import type { Agent } from '@/shared/types';

export function AdminAgentsPage() {
  const { agents, toggleAgentStatus } = useAdminStore();
  const { tickets } = useTicketsStore();
  const [showAdd, setShowAdd] = useState(false);

  const getTicketCount = (agent: Agent) =>
    tickets.filter((t) => agent.ticketPoolIds.includes(t.id)).length;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Агенты</h1>
            <p className="text-sm text-slate-500">
              Управление агентскими учётными записями
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            + Добавить агента
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{agents.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Всего агентов</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {agents.filter((a) => a.status === 'active').length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Активных</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-400">
              {agents.filter((a) => a.status === 'inactive').length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Неактивных</div>
          </div>
        </div>

        {/* Table */}
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Агент</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Телефон</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Билетов</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Создан</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    ticketCount={getTicketCount(agent)}
                    onToggleStatus={(a) => toggleAgentStatus(a.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AddAgentModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
