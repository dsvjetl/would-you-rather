import { queryOptions } from '@tanstack/react-query';
import { getQuestion } from '../api/questions';

export const questionKeys = {
  all: ['questions'] as const,
  single: (seed: number) => [...questionKeys.all, seed] as const,
};

// `seed` lets the UI request a brand-new question by bumping a counter,
// while previously fetched questions stay cached under their own key.
export const questionQueryOptions = (seed: number) =>
  queryOptions({
    queryKey: questionKeys.single(seed),
    queryFn: getQuestion,
    staleTime: Infinity,
  });
