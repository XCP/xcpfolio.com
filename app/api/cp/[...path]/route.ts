import { counterpartyRead } from '@/lib/counterparty-read'
const COUNTERPARTY_API_BASE = 'https://api.counterparty.io:4000/v2'

/** GET only, and only onward to /v2: the SDK's relay for a browser the node has stopped talking to. */
const ALLOWED_PREFIX = 'v2'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  if (path[0] !== ALLOWED_PREFIX) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const origin = new URL(COUNTERPARTY_API_BASE).origin
  const search = new URL(request.url).search
  const target = `${origin}/${path.map(encodeURIComponent).join('/')}${search}`

  let upstream: Response
  try {
    upstream = await counterpartyRead(target, {
      signal: AbortSignal.timeout(8_000),
      headers: { accept: 'application/json' },
    })
  } catch {
    return Response.json({ error: 'Counterparty unreachable' }, { status: 502 })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-store',
    },
  })
}
