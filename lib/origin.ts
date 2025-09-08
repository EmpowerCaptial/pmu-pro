// lib/origin.ts
export function getOrigin(req: Request) {
  const url = new URL(req.url);
  const host = (req.headers.get('x-forwarded-host') ?? url.host);
  const proto = (req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':',''));
  return `${proto}://${host}`;
}

