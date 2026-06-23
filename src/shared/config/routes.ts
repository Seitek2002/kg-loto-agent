export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AGENT: {
    DASHBOARD: '/agent',
    TICKETS: '/agent/tickets',
    ORDERS: '/agent/orders',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    AGENTS: '/admin/agents',
    TICKETS: '/admin/tickets',
  },
} as const;
