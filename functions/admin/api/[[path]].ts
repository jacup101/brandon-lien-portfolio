// Reverse proxy: /admin/api/* -> site-assets-backend's authenticated
// /api/* routes. This is what lets the hosted admin UI (a React page
// gated by its own Cloudflare Access application on /admin*) talk to the
// backend without ever holding Access credentials in the browser — the
// Service Token headers are attached here, server-side, same pattern as
// admin/server/backend.ts already uses for the local admin tool.
interface Env {
  BACKEND_URL?: string;
  BACKEND_ACCESS_CLIENT_ID?: string;
  BACKEND_ACCESS_CLIENT_SECRET?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  const backendUrl = env.BACKEND_URL || 'https://site-assets-backend.jacup105.workers.dev';
  const segments = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const targetUrl = new URL(`${backendUrl}/api/${segments.join('/')}`);
  targetUrl.search = new URL(request.url).search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cookie'); // never forward this site's Access session cookie to a different app
  if (env.BACKEND_ACCESS_CLIENT_ID && env.BACKEND_ACCESS_CLIENT_SECRET) {
    headers.set('CF-Access-Client-Id', env.BACKEND_ACCESS_CLIENT_ID);
    headers.set('CF-Access-Client-Secret', env.BACKEND_ACCESS_CLIENT_SECRET);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const upstream = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Cloudflare Workers require this when streaming a request body through.
    duplex: hasBody ? 'half' : undefined,
  } as RequestInit);

  const responseHeaders = new Headers(upstream.headers);
  // The Worker's fetch() already decoded any upstream compression; letting
  // this header pass through would make the browser try to decode again.
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
};
