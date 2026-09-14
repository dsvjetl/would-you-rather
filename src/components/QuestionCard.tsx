import type { Question } from '../api/questions';

export type Choice = 'a' | 'b';

type QuestionCardProps = {
  question: Question;
  choice: Choice | null;
  onChoose: (choice: Choice) => void;
};

const QuestionCard = ({ question, choice, onChoose }: QuestionCardProps) => {
  const optionClass = (option: Choice) => {
    const base = `option option--${option}`;
    if (choice === null) return base;
    return `${base} ${choice === option ? 'option--chosen' : 'option--dimmed'}`;
  };

  return (
    <div className="quiz__options" role="group" aria-label="Da li bi radije">
      <button className={optionClass('a')} onClick={() => onChoose('a')} disabled={choice !== null}>
        {question.optionA}
      </button>
      <span className="quiz__or" aria-hidden="true">
        ili
      </span>
      <button className={optionClass('b')} onClick={() => onChoose('b')} disabled={choice !== null}>
        {question.optionB}
      </button>
    </div>
  );
};

export { QuestionCard };
