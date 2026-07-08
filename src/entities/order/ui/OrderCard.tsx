import { Order } from '@/shared/types';
import { Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';

const statusMap: Record<Order['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  paid: { label: 'Оплачен', variant: 'success' },
  pending: { label: 'Ожидает оплаты', variant: 'warning' },
  cancelled: { label: 'Отменён', variant: 'danger' },
  expired: { label: 'Истёк', variant: 'neutral' },
  failed: { label: 'Ошибка', variant: 'danger' },
  refund_required: { label: 'Требуется возврат', variant: 'danger' },
};

interface OrderCardProps {
  order: Order;
  onViewLink?: (order: Order) => void;
}

export function OrderCard({ order, onViewLink }: OrderCardProps) {
  const badge = statusMap[order.status] ?? { label: order.statusDisplay, variant: 'neutral' as const };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">#{order.id}</span>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          <div className="mt-2 space-y-0.5">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Клиент:</span> {order.clientFullName}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Телефон:</span> {order.clientPhone}
            </div>
            {order.tickets.length > 0 && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">Билеты:</span>{' '}
                {order.tickets.map((t) => t.serial.split('-').slice(-2).join('-')).join(', ')}
              </div>
            )}
            <div className="text-sm text-slate-600">
              <span className="font-medium">Дата:</span> {formatDateTime(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-brand-blue">{order.amount} сом</div>
          {order.status === 'pending' && onViewLink && (
            <button
              onClick={() => onViewLink(order)}
              className="mt-2 text-xs text-brand-blue hover:underline"
            >
              Ссылка на оплату
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
