// ── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'agent' | 'superadmin';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  commissionPercent?: string;
  referralCode?: string | null;
}

// ── Draw ────────────────────────────────────────────────────────────────────

export type DrawStatus = string;

/** Draw as returned from GET /agent/draws/ */
export interface Draw {
  id: number;
  drawCode: string;
  drawName: string;
  status: DrawStatus;
  statusDisplay: string;
  pricePerTicket: string;
  prizePool: string;
  drawAt: string | null;
  salesDeadlineAt: string | null;
  availableCount: number;
}

// ── Ticket ──────────────────────────────────────────────────────────────────

export interface TirageGrid {
  key: string;
  numbers: number[];
  position: number;
}

export interface TirageVariant {
  id: number;
  code: string;
  name: string;
  gridCount: number;
  pricePerTicket: number;
}

/** Ticket as returned from GET /agent/tickets/ */
export interface Ticket {
  id: string;
  shortId: string;
  serial: string;
  drawCode: string;
  drawName: string;
  price: string;
  ticketPrice: string;
  gridCount: number | null;
  tirageVariant: TirageVariant | null;
  tirageGrids: TirageGrid[] | null;
  logo?: string | null;
  reservedUntil: string | null;
}

/** Ticket as embedded inside an Order */
export interface OrderTicket {
  shortId: string;
  serial: string;
  drawName: string;
  ticketPrice: string;
  gridCount: number | null;
  tirageGrids: TirageGrid[] | null;
}

// ── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refund_required';

export interface Order {
  id: number;
  /** only present in admin orders list */
  agentId?: number;
  /** only present in admin orders list */
  agentName?: string;
  status: OrderStatus;
  statusDisplay: string;
  clientFullName: string;
  clientPhone: string;
  clientBirthYear: number;
  amount: string;
  commissionAmount?: string;
  currency?: string;
  payUrl: string;
  pdfFile?: string | null;
  reservedUntil: string;
  paidAt: string | null;
  clientNotifiedAt: string | null;
  agentNotifiedAt: string | null;
  createdAt: string;
  tickets: OrderTicket[];
  /** only in admin detail */
  deliveryError?: string;
}

export interface CreateOrderPayload {
  clientFullName: string;
  clientPhone: string;
  clientBirthYear: number;
  tickets: string[];
  note?: string;
  redirectUrl?: string;
}

export interface RevenueData {
  totalRevenue: string;
  paidOrdersAmount: string;
  paidOrdersCount: number;
  currency: string;
}

// ── Referral ─────────────────────────────────────────────────────────────────

export interface ReferralPurchaseTicket {
  shortId: string;
  serial: string;
  drawName: string;
  ticketPrice: string;
}

export interface ReferralPurchase {
  id: number;
  orderId: string;
  status: string;
  statusDisplay: string;
  paymentMethod: string;
  guestPhone: string;
  amount: string;
  referralCodeUsed: string;
  referralBonusAmount: string;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  tickets: ReferralPurchaseTicket[];
}

export interface ReferralEarnings {
  totalBonus: string;
  paidPurchasesAmount: string;
  paidPurchasesCount: number;
  pendingPurchasesCount: number;
  commissionPercent: string;
  currency: string;
}

// ── Admin Agent ──────────────────────────────────────────────────────────────

export interface AdminAgent {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  commissionPercent: string;
  isActive: boolean;
  dateJoined: string;
}
