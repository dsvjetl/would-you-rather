import type { Plugin, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

type LlmProvider = {
  prefix: string;
  target: string;
  envVar: string;
  authHeader: (key: string) => Record<string, string>;
};

const providers: LlmProvider[] = [
  {
    prefix: '/api/groq',
    target: 'https://api.groq.com',
    envVar: 'GROQ_API_KEY',
    authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  {
    prefix: '/api/gemini',
    target: 'https://generativelanguage.googleapis.com',
    envVar: 'GEMINI_API_KEY',
    authHeader: (key) => ({ 'x-goog-api-key': key }),
  },
];

// Answers /api/<provider> requests with a clear 500 when the matching key is missing,
// before they ever reach the proxy.
const requireApiKeys = (env: Record<string, string>): Plugin => ({
  name: 'require-api-keys',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const provider = providers.find((p) => req.url?.startsWith(p.prefix));
      if (!provider || env[provider.envVar]) {
        next();
        return;
      }
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: `${provider.envVar} is not set. Add it to .env.local and restart \`npm run dev\`.`,
        }),
      );
    });
  },
});

// The browser calls /api/<provider>/...; the dev server forwards it upstream and attaches
// the key, so API keys never reach the client bundle.
const llmProxy = (provider: LlmProvider, apiKey: string): ProxyOptions => ({
  target: provider.target,
  changeOrigin: true,
  rewrite: (path) => path.slice(provider.prefix.length),
  headers: provider.authHeader(apiKey),
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      // Don't leak the localhost origin upstream; referrer-restricted keys would be rejected.
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), requireApiKeys(env)],
    server: {
      proxy: Object.fromEntries(
        providers.map((provider) => [
          provider.prefix,
          llmProxy(provider, env[provider.envVar] ?? ''),
        ]),
      ),
    },
  };
});
