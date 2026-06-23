import { AdminAgent } from '@/shared/types';
import { Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';

interface AgentRowProps {
  agent: AdminAgent;
  onToggleStatus?: (agent: AdminAgent) => void;
}

export function AgentRow({ agent, onToggleStatus }: AgentRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">{agent.fullName}</div>
        <div className="text-xs text-slate-500">{agent.email}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{agent.phoneNumber}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{agent.commissionPercent}%</td>
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
          onClick={() => onToggleStatus?.(agent)}
        >
          {agent.isActive ? 'Отключить' : 'Включить'}
        </Button>
      </td>
    </tr>
  );
}
