import type { Agent, Ticket, Draw, Order } from '@/shared/types';
import { RESERVATION_DURATION_MS } from '@/shared/config/constants';

export const MOCK_DRAWS: Draw[] = [
  {
    id: 'draw-15',
    name: 'Тираж №15',
    date: '2026-07-01',
    jackpot: 5_000_000,
    ticketPrice: 200,
    active: true,
  },
  {
    id: 'draw-16',
    name: 'Тираж №16',
    date: '2026-07-15',
    jackpot: 7_500_000,
    ticketPrice: 200,
    active: true,
  },
];

function generateTickets(): Ticket[] {
  const tickets: Ticket[] = [];
  const draws = ['draw-15', 'draw-16'];
  const drawNames: Record<string, string> = {
    'draw-15': 'Тираж №15',
    'draw-16': 'Тираж №16',
  };
  const drawDates: Record<string, string> = {
    'draw-15': '2026-07-01',
    'draw-16': '2026-07-15',
  };

  let counter = 1;
  for (const drawId of draws) {
    for (let i = 1; i <= 60; i++) {
      const id = `ticket-${counter}`;
      let status: Ticket['status'] = 'available';
      if (counter <= 10) status = 'sold';
      else if (counter <= 15) status = 'reserved';

      tickets.push({
        id,
        number: String(i).padStart(3, '0'),
        series: drawId === 'draw-15' ? 'A' : 'B',
        drawId,
        drawName: drawNames[drawId],
        drawDate: drawDates[drawId],
        price: 200,
        status,
        reservedBy: status === 'reserved' ? 'agent-1' : undefined,
        reservedAt:
          status === 'reserved'
            ? new Date(Date.now() - 5 * 60 * 1000).toISOString()
            : undefined,
        orderId: status === 'sold' ? `order-mock-${counter}` : undefined,
      });
      counter++;
    }
  }
  return tickets;
}

export const MOCK_TICKETS: Ticket[] = generateTickets();

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Айгуль Бекова',
    login: 'agent1',
    password: 'pass123',
    phone: '+996 700 111 001',
    whatsapp: '+996700111001',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    ticketPoolIds: MOCK_TICKETS.filter((t) => t.drawId === 'draw-15').map(
      (t) => t.id
    ),
  },
  {
    id: 'agent-2',
    name: 'Данияр Омуров',
    login: 'agent2',
    password: 'pass123',
    phone: '+996 700 222 002',
    whatsapp: '+996700222002',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    ticketPoolIds: MOCK_TICKETS.filter((t) => t.drawId === 'draw-16').map(
      (t) => t.id
    ),
  },
  {
    id: 'agent-3',
    name: 'Зарина Токтосунова',
    login: 'agent3',
    password: 'pass123',
    phone: '+996 700 333 003',
    whatsapp: '+996700333003',
    status: 'inactive',
    createdAt: '2026-02-01T08:00:00Z',
    ticketPoolIds: [],
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-001',
    agentId: 'agent-1',
    client: { fullName: 'Нурбек Асанов', phone: '+996 550 100 200' },
    ticketIds: ['ticket-1', 'ticket-2', 'ticket-3'],
    totalAmount: 600,
    status: 'paid',
    paymentLink: 'https://elqr.kg/pay?order=order-001',
    createdAt: '2026-06-20T11:00:00Z',
    paidAt: '2026-06-20T11:15:00Z',
    expiresAt: new Date(
      new Date('2026-06-20T11:00:00Z').getTime() + RESERVATION_DURATION_MS
    ).toISOString(),
  },
  {
    id: 'order-002',
    agentId: 'agent-1',
    client: { fullName: 'Мирлан Джумалиев', phone: '+996 770 300 400' },
    ticketIds: ['ticket-4', 'ticket-5'],
    totalAmount: 400,
    status: 'paid',
    paymentLink: 'https://elqr.kg/pay?order=order-002',
    createdAt: '2026-06-21T14:30:00Z',
    paidAt: '2026-06-21T14:45:00Z',
    expiresAt: new Date(
      new Date('2026-06-21T14:30:00Z').getTime() + RESERVATION_DURATION_MS
    ).toISOString(),
  },
  {
    id: 'order-003',
    agentId: 'agent-1',
    client: { fullName: 'Гулнара Сатыбалдиева', phone: '+996 555 500 600' },
    ticketIds: ['ticket-11', 'ticket-12'],
    totalAmount: 400,
    status: 'pending',
    paymentLink: 'https://elqr.kg/pay?order=order-003',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(
      Date.now() - 10 * 60 * 1000 + RESERVATION_DURATION_MS
    ).toISOString(),
  },
  {
    id: 'order-004',
    agentId: 'agent-2',
    client: { fullName: 'Бакыт Токтоматов', phone: '+996 700 700 800' },
    ticketIds: ['ticket-61', 'ticket-62', 'ticket-63', 'ticket-64'],
    totalAmount: 800,
    status: 'paid',
    paymentLink: 'https://elqr.kg/pay?order=order-004',
    createdAt: '2026-06-22T09:00:00Z',
    paidAt: '2026-06-22T09:20:00Z',
    expiresAt: new Date(
      new Date('2026-06-22T09:00:00Z').getTime() + RESERVATION_DURATION_MS
    ).toISOString(),
  },
  {
    id: 'order-005',
    agentId: 'agent-1',
    client: { fullName: 'Асель Момунова', phone: '+996 700 900 100' },
    ticketIds: ['ticket-6', 'ticket-7'],
    totalAmount: 400,
    status: 'expired',
    paymentLink: 'https://elqr.kg/pay?order=order-005',
    createdAt: '2026-06-19T16:00:00Z',
    expiresAt: '2026-06-19T16:30:00Z',
  },
];

export const ADMIN_CREDENTIALS = {
  login: 'admin',
  password: 'admin123',
};
