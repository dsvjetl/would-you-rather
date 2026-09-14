import { BrowserWindow, Logo, PillButton, Sparkles } from '../components';

type HomeProps = {
  onStart: () => void;
};

const Home = ({ onStart }: HomeProps) => {
  return (
    <BrowserWindow>
      <Sparkles />
      <Logo />
      <PillButton onClick={onStart}>Kreni</PillButton>
    </BrowserWindow>
  );
};

export { Home };
