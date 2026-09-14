import { generateText } from './llm';

export type Question = {
  id: string;
  optionA: string;
  optionB: string;
};

const PROMPT = `
Smisli jedno smiješno pitanje tipa „bi li radije...”, npr. „Bi li radije uvijek bio ljepljiv ili imao zaštopan nos?”.
Odgovori ISKLJUČIVO JSON objektom oblika {"a": "prva opcija", "b": "druga opcija"}.
Opcije napiši kao kratke fraze bez „bi li radije” i bez navodnika, npr. {"a": "uvijek bio ljepljiv", "b": "imao zaštopan nos"}.
`;

const parseQuestion = (raw: string): Pick<Question, 'optionA' | 'optionB'> => {
  // Models sometimes wrap JSON in ```json fences or add stray text around it.
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Model did not return JSON');
  }

  const parsed: unknown = JSON.parse(match[0]);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as { a?: unknown }).a !== 'string' ||
    typeof (parsed as { b?: unknown }).b !== 'string'
  ) {
    throw new Error('Model returned JSON in an unexpected shape');
  }

  const { a, b } = parsed as { a: string; b: string };
  return { optionA: a.trim(), optionB: b.trim() };
};

export const getQuestion = async (): Promise<Question> => {
  const raw = await generateText(PROMPT, 1.2);

  return {
    id: crypto.randomUUID(),
    ...parseQuestion(raw),
  };
};
