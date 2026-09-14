import { useState } from 'react';
import './App.css';
import { AppProviders } from './providers/AppProviders';
import { Home, Quiz } from './views';

type Screen = 'home' | 'quiz';

function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <AppProviders>
      <main className="page">
        {screen === 'home' ? <Home onStart={() => setScreen('quiz')} /> : <Quiz />}
      </main>
    </AppProviders>
  );
}

export default App;
