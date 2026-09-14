import { apiFetch } from './client';

// Requests go through the Vite dev proxy (see vite.config.ts), which injects the API key
// server-side so it never ends up in the browser bundle.
const GROQ_BASE_URL = '/api/groq/openai/v1';
const MODEL = 'openai/gpt-oss-120b';

type ChatCompletionResponse = {
  choices?: Array<{
    message: { content: string | null };
  }>;
};

export const generateText = async (prompt: string, temperature = 1): Promise<string> => {
  const data = await apiFetch<ChatCompletionResponse>(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    }),
  });

  const text = data.choices?.[0]?.message.content ?? '';
  if (!text) {
    throw new Error('Groq returned an empty response');
  }

  return text.trim();
};
