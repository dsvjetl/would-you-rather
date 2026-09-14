import type { ReactNode } from 'react';

type BrowserWindowProps = {
  label?: ReactNode;
  children: ReactNode;
};

const BrowserWindow = ({ label, children }: BrowserWindowProps) => {
  return (
    <div className="window">
      <div className="window__bar">{label && <div className="window__label">{label}</div>}</div>
      <div className="window__body">{children}</div>
    </div>
  );
};

export { BrowserWindow };
