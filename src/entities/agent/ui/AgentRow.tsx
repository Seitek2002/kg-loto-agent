import { Agent } from '@/shared/types';
import { Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';

interface AgentRowProps {
  agent: Agent;
  ticketCount?: number;
  onToggleStatus?: (agent: Agent) => void;
  onManageTickets?: (agent: Agent) => void;
}

export function AgentRow({ agent, ticketCount = 0, onToggleStatus, onManageTickets }: AgentRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{agent.name}</div>
        <div className="text-xs text-slate-500">{agent.login}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{agent.phone}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{ticketCount} шт.</td>
      <td className="px-4 py-3">
        <Badge variant={agent.status === 'active' ? 'success' : 'neutral'}>
          {agent.status === 'active' ? 'Активен' : 'Неактивен'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(agent.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageTickets?.(agent)}
          >
            Билеты
          </Button>
          <Button
            size="sm"
            variant={agent.status === 'active' ? 'ghost' : 'secondary'}
            onClick={() => onToggleStatus?.(agent)}
          >
            {agent.status === 'active' ? 'Отключить' : 'Включить'}
          </Button>
        </div>
      </td>
    </tr>
  );
}
