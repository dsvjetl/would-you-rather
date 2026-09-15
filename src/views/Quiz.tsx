import { useState } from 'react';
import { BrowserWindow, Logo, PillButton, QuestionCard, type Choice } from '../components';
import { useQuestion } from '../hooks/useQuestion';

const Quiz = () => {
  const { question, isLoading, isError, error, nextQuestion, refetch } = useQuestion();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [answered, setAnswered] = useState(0);

  const handleChoose = (picked: Choice) => {
    setChoice(picked);
    setAnswered((count) => count + 1);
  };

  const handleNext = () => {
    setChoice(null);
    nextQuestion();
  };

  return (
    <BrowserWindow label={`Odgovoreno: ${answered}`}>
      <div className="quiz">
        <Logo size="small" />
        <p className="quiz__counter quiz__counter--mobile">Odgovoreno: {answered}</p>

        {isLoading && (
          <>
            <p className="quiz__status skeleton">Smišljam dobro pitanje…</p>
            <div className="quiz__options" aria-hidden="true">
              <div className="option option--a skeleton" />
              <span className="quiz__or">ili</span>
              <div className="option option--b skeleton" />
            </div>
          </>
        )}

        {isError && (
          <>
            <p className="quiz__error" role="alert">
              Nisam uspio učitati pitanje: {error?.message}
            </p>
            <PillButton onClick={() => refetch()}>Pokušaj ponovno</PillButton>
          </>
        )}

        {question && !isLoading && (
          <>
            <QuestionCard question={question} choice={choice} onChoose={handleChoose} />
            {choice === null ? (
              <p className="quiz__hint">Odaberi jedno</p>
            ) : (
              <PillButton onClick={handleNext}>Sljedeće</PillButton>
            )}
          </>
        )}
      </div>
    </BrowserWindow>
  );
};

export { Quiz };
