import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionQueryOptions } from '../queries/questionQueries';

type UseQuestionOptions = {
  enabled?: boolean;
};

export const useQuestion = ({ enabled = true }: UseQuestionOptions = {}) => {
  const [seed, setSeed] = useState(0);
  const query = useQuery({ ...questionQueryOptions(seed), enabled });

  const nextQuestion = () => setSeed((current) => current + 1);

  return {
    question: query.data,
    isLoading: query.isPending && enabled,
    isError: query.isError,
    error: query.error,
    nextQuestion,
    refetch: query.refetch,
  };
};
