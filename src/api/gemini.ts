import { apiFetch } from './client';

// Requests go through the Vite dev proxy (see vite.config.ts), which injects the API key
// server-side so it never ends up in the browser bundle.
const GEMINI_BASE_URL = '/api/gemini/v1beta/models';
// gemini-2.5-flash handles Croatian noticeably better than flash-lite; both are on the free tier.
const MODEL = 'gemini-2.5-flash';

type GeminiResponse = {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
};

export const generateText = async (prompt: string, temperature = 1): Promise<string> => {
  const data = await apiFetch<GeminiResponse>(`${GEMINI_BASE_URL}/${MODEL}:generateContent`, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    }),
  });

  const text = data.candidates?.[0]?.content.parts.map((part) => part.text).join('') ?? '';
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text.trim();
};
