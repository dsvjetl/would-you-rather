// LLM providers the browser can talk to via /api/<provider>/...
// Shared by the Vite dev proxy (vite.config.ts) and the Netlify function (netlify/functions/llm.ts),
// so both environments inject the API key server-side and it never reaches the client bundle.
export type LlmProvider = {
  prefix: string;
  target: string;
  envVar: string;
  authHeader: (key: string) => Record<string, string>;
};

export const providers: LlmProvider[] = [
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
