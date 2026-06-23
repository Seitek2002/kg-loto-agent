import { Order } from '@/shared/types';
import { Badge } from '@/shared/ui';
import { formatPrice, formatDateTime } from '@/shared/lib/utils';

const statusMap: Record<Order['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  paid: { label: 'Оплачен', variant: 'success' },
  pending: { label: 'Ожидает оплаты', variant: 'warning' },
  cancelled: { label: 'Отменён', variant: 'danger' },
  expired: { label: 'Истёк', variant: 'neutral' },
};

interface OrderCardProps {
  order: Order;
  ticketNumbers?: string[];
  onViewLink?: (order: Order) => void;
}

export function OrderCard({ order, ticketNumbers = [], onViewLink }: OrderCardProps) {
  const { label, variant } = statusMap[order.status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">
              #{order.id.toUpperCase()}
            </span>
            <Badge variant={variant}>{label}</Badge>
          </div>

          <div className="mt-2 space-y-0.5">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Клиент:</span> {order.client.fullName}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Телефон:</span> {order.client.phone}
            </div>
            {ticketNumbers.length > 0 && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">Билеты:</span>{' '}
                {ticketNumbers.join(', ')}
              </div>
            )}
            <div className="text-sm text-slate-600">
              <span className="font-medium">Дата:</span>{' '}
              {formatDateTime(order.createdAt)}
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-brand-blue">
            {formatPrice(order.totalAmount)}
          </div>
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
