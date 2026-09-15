import { generateText } from './llm';

export type Question = {
  id: string;
  optionA: string;
  optionB: string;
};

// Without any of this the model gets the exact same prompt every time, has no memory of what it
// already produced and just converges on the same handful of "opera / film quotes" questions.
// Variety comes from three things: a random theme per request, a list of recent questions the
// model is told to avoid, and a client-side duplicate check that retries once.

const THEMES = [
  'hrana i jelo',
  'životinje',
  'posao i ured',
  'tehnologija i mobiteli',
  'sport',
  'putovanja i promet',
  'obitelj i rodbina',
  'škola',
  'glazba',
  'tijelo i izgled',
  'spavanje',
  'vrijeme i godišnja doba',
  'moda i odjeća',
  'kućanski poslovi',
  'supermoći s manom',
  'društvene mreže',
  'javni prijevoz',
  'odmor na moru',
  'kafići i restorani',
  'susjedi',
  'kućni ljubimci',
  'praznici i blagdani',
  'kuhanje',
  'higijena',
  'zvukovi i mirisi',
  'igre i zabava',
  'novac i kupovina',
  'razgovori i komunikacija',
];

const HISTORY_KEY = 'wyr-recent-questions';
const HISTORY_LIMIT = 40;

const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

const questionKey = (q: Pick<Question, 'optionA' | 'optionB'>) =>
  `${normalize(q.optionA)} | ${normalize(q.optionB)}`;

let recent: string[] = [];

const loadHistory = (): string[] => {
  if (recent.length) return recent;
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) recent = JSON.parse(stored) as string[];
  } catch {
    // storage unavailable — keep the in-memory list only
  }
  return recent;
};

const remember = (q: Pick<Question, 'optionA' | 'optionB'>) => {
  recent = [...loadHistory(), questionKey(q)].slice(-HISTORY_LIMIT);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
};

const isDuplicate = (q: Pick<Question, 'optionA' | 'optionB'>) => {
  const key = questionKey(q);
  const [a, b] = key.split(' | ');
  return loadHistory().some((past) => past === key || past.includes(a) || past.includes(b));
};

const buildPrompt = (): string => {
  const theme = pick(THEMES);
  const history = loadHistory();
  const avoid = history.length
    ? `\nVeć iskorištena pitanja (NE ponavljaj ih niti smišljaj slične varijante):\n${history
        .slice(-20)
        .map((q) => `- ${q}`)
        .join('\n')}\n`
    : '';

  return `
Smisli jedno originalno i smiješno pitanje tipa „bi li radije...”.
Tema pitanja: ${theme}. Obje opcije moraju biti povezane s tom temom, konkretne i neugodne ili apsurdne na zabavan način.
${avoid}
Pravila:
- Odgovori ISKLJUČIVO JSON objektom oblika {"a": "prva opcija", "b": "druga opcija"}, bez ikakvog dodatnog teksta.
- Opcije su kratke fraze bez „bi li radije” i bez navodnika unutar teksta.
- Obje opcije sadrže riječ "zauvijek" i pisane su u drugom licu jednine, u muškom rodu (npr. "zauvijek jeo juhu vilicom").
- Ne koristi teme opere, pjevanja, citata iz filmova, ljepljivosti ni začepljenog nosa.
- Pazi na hrvatski pravopis.
- Nasumični broj za inspiraciju (ignoriraj ga u odgovoru): ${Math.floor(Math.random() * 1_000_000)}
- Odgovori nikad ne smiju doći 2 puta zaredom.
`;
};

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

const MAX_ATTEMPTS = 3;

export const getQuestion = async (): Promise<Question> => {
  let question: Pick<Question, 'optionA' | 'optionB'> | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = parseQuestion(await generateText(buildPrompt(), 1.2));
    question = candidate;
    if (!isDuplicate(candidate)) break;
  }

  // question is always set after the first iteration; the loop only repeats on duplicates.
  const result = question!;
  remember(result);

  return {
    id: crypto.randomUUID(),
    ...result,
  };
};
