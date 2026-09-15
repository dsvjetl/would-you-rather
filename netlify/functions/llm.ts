import { providers } from '../../llm-providers.ts';

// Production counterpart of the Vite dev proxy: forwards /api/<provider>/... to the upstream
// API and attaches the key from Netlify environment variables (Site configuration →
// Environment variables → e.g. GROQ_API_KEY).

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const provider = providers.find((p) => url.pathname.startsWith(p.prefix));
  if (!provider) {
    return json({ error: `Unknown API route: ${url.pathname}` }, 404);
  }

  const apiKey = process.env[provider.envVar];
  if (!apiKey) {
    return json(
      { error: `${provider.envVar} is not set. Add it in Netlify → Site configuration → Environment variables and redeploy.` },
      500,
    );
  }

  const upstreamUrl = `${provider.target}${url.pathname.slice(provider.prefix.length)}${url.search}`;
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', ...provider.authHeader(apiKey) },
    body: hasBody ? await req.text() : undefined,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
};

export const config = {
  path: '/api/*',
};
