import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'https://kgloto.com';

// Единственная причина существования этого роута — /me/combination/check/
// живёт на v1, а наш клиент (client.ts) всегда ходит через /api/v2. Проксируем
// только этот один эндпоинт, а не весь v1 (в отличие от общего v2-проксирования).
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('authorization');
  const contentType = req.headers.get('content-type');

  const res = await fetch(`${API_URL}/api/v1/me/combination/check/`, {
    method: 'POST',
    headers: {
      ...(authorization ? { authorization } : {}),
      ...(contentType ? { 'content-type': contentType } : {}),
    },
    body: await req.text(),
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
