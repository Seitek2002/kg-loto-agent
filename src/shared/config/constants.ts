export const RESERVATION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const ELQR_BASE_URL = 'https://elqr.kg/pay';

export const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

export const TICKET_COLORS: Record<string, string> = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  reserved: 'bg-amber-50 border-amber-200 text-amber-800',
  sold: 'bg-slate-100 border-slate-200 text-slate-400',
};
