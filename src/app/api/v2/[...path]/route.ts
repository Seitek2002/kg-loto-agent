import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'https://kgloto.com';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = req.nextUrl.pathname.replace(/^\/api\/v2/, '');
  const target = `${API_URL}/api/v2${pathname}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const [k, v] of req.headers.entries()) {
    if (['host', 'connection', 'transfer-encoding'].includes(k.toLowerCase())) continue;
    headers.set(k, v);
  }

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const respHeaders = new Headers();
  for (const [k, v] of res.headers.entries()) {
    if (['transfer-encoding', 'content-encoding'].includes(k.toLowerCase())) continue;
    respHeaders.append(k, v);
  }

  // suppress warning about unused params
  void path;

  return new NextResponse(res.body, {
    status: res.status,
    headers: respHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
