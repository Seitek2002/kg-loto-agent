'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/features/admin/model/adminStore';
import { AddAgentModal } from '@/widgets/add-agent-modal/ui/AddAgentModal';
import { Button, Card, Badge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';

export function AdminAgentsPage() {
  const { agents, loadingAgents, fetchAgents, toggleAgentStatus } = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Агенты</h1>
            <p className="text-sm text-slate-500">Управление агентскими учётными записями</p>
          </div>
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            + Добавить агента
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{agents.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Всего агентов</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {agents.filter((a) => a.isActive).length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Активных</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-400">
              {agents.filter((a) => !a.isActive).length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Неактивных</div>
          </div>
        </div>

        {loadingAgents ? (
          <div className="text-center py-12 text-slate-400 text-sm">Загрузка…</div>
        ) : (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Агент', 'Email', 'Телефон', 'Комиссия', 'Статус', 'Создан', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{agent.fullName}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{agent.email}</td>
                      <td className="px-4 py-3 text-slate-600">{agent.phoneNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{agent.commissionPercent}%</td>
                      <td className="px-4 py-3">
                        <Badge variant={agent.isActive ? 'success' : 'neutral'}>
                          {agent.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(agent.dateJoined)}</td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={agent.isActive ? 'ghost' : 'secondary'}
                          onClick={() => toggleAgentStatus(agent.id, agent.isActive)}
                        >
                          {agent.isActive ? 'Отключить' : 'Включить'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <AddAgentModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
