const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v2';

type FetchOptions = {
  method?: string;
  body?: unknown;
  /** skip retry on 401 (used internally by refresh) */
  _retried?: boolean;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown
  ) {
    super(`API ${status}`);
  }
}

async function request<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, _retried } = opts;

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // auto-refresh access token on 401
  if (res.status === 401 && !_retried && !path.startsWith('/auth/')) {
    const refreshRes = await fetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      return request<T>(path, { ...opts, _retried: true });
    }
    // refresh also failed — session is gone
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, null);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok) throw new ApiError(res.status, json);
  return json as T;
}

// ── Helpers ────────────────────────────────────────────────────────────────

type Envelope<T> = { data: T; meta: Record<string, unknown> };
type PagedEnvelope<T> = Envelope<{
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}>;

export async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function getEnvelope<T>(path: string): Promise<T> {
  const res = await request<Envelope<T>>(path);
  return res.data;
}

export async function getPagedAll<T>(path: string, pageSize = 200): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await request<PagedEnvelope<T>>(`${path}${sep}pageSize=${pageSize}`);
  return res.data.results;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: 'POST', body });
  return res.data;
}

export async function postFlat<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body });
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: 'PATCH', body });
  return res.data;
}

export async function del<T>(path: string, body?: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: 'DELETE', body });
  return res.data;
}
