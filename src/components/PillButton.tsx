import type { ButtonHTMLAttributes } from 'react';

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

const PillButton = ({ variant = 'primary', className = '', ...props }: PillButtonProps) => {
  return (
    <button
      className={`pill ${variant === 'ghost' ? 'pill--ghost' : ''} ${className}`}
      {...props}
    />
  );
};

export { PillButton };
