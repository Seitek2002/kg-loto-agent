export type TicketStatus = 'available' | 'reserved' | 'sold';

export interface Ticket {
  id: string;
  number: string;
  series: string;
  drawId: string;
  drawName: string;
  drawDate: string;
  price: number;
  status: TicketStatus;
  reservedBy?: string;
  reservedAt?: string;
  orderId?: string;
}

export interface Draw {
  id: string;
  name: string;
  date: string;
  jackpot: number;
  ticketPrice: number;
  active: boolean;
}

export type AgentStatus = 'active' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  login: string;
  password: string;
  phone: string;
  whatsapp: string;
  status: AgentStatus;
  createdAt: string;
  ticketPoolIds: string[];
}

export interface Client {
  fullName: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export interface Order {
  id: string;
  agentId: string;
  client: Client;
  ticketIds: string[];
  totalAmount: number;
  status: OrderStatus;
  paymentLink: string;
  createdAt: string;
  paidAt?: string;
  expiresAt: string;
}

export type UserRole = 'admin' | 'agent';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  login: string;
}
