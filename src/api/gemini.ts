import { apiFetch } from './client';

// Requests go through the Vite dev proxy (see vite.config.ts), which injects the API key
// server-side so it never ends up in the browser bundle.
const GEMINI_BASE_URL = '/api/gemini/v1beta/models';
// Google retired gemini-2.5-* for new users; 3.6-flash is the current free-tier model.
const MODEL = 'gemini-3.6-flash';

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
      generationConfig: {
        temperature,
        // Gemini 3.x "thinks" before answering by default, which adds seconds of latency for a
        // two-line JSON answer. Minimal thinking keeps it fast; the prompt is simple enough.
        thinkingConfig: { thinkingLevel: 'minimal' },
        // Ask for raw JSON so the model skips markdown fences and extra prose.
        responseMimeType: 'application/json',
      },
    }),
  });

  const text = data.candidates?.[0]?.content.parts.map((part) => part.text).join('') ?? '';
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text.trim();
};
