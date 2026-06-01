import { useEffect, useState } from 'react';
import IntroScene3D from './components/IntroScene3D.jsx';
import RetroDesktop from './components/RetroDesktop.jsx';

const BOOT_TIME = 2600;

function BootOverlay({ active }) {
  return (
    <div className={`boot-overlay ${active ? 'is-active' : ''}`} aria-hidden={!active}>
      <div className="boot-panel">
        <div className="boot-title">PLEASE WAIT</div>
        <div className="boot-meter">
          <span />
        </div>
        <div className="boot-copy">PERSONAL SYSTEM LOADING</div>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    if (phase !== 'booting') return undefined;

    const timer = window.setTimeout(() => {
      setPhase('desktop');
    }, BOOT_TIME);

    return () => window.clearTimeout(timer);
  }, [phase]);

  const enterDesktop = () => {
    if (phase === 'intro') {
      setPhase('booting');
    }
  };

  const exitDesktop = () => {
    setPhase('intro');
  };

  return (
    <main className={`app-shell app-shell--${phase}`}>
      <section className="intro-layer" aria-hidden={phase === 'desktop'}>
        <IntroScene3D phase={phase} onScreenClick={enterDesktop} />
        <div className="intro-status">
          <span className="status-dot" />
          <span className="status-label">{phase === 'intro' ? '点击屏幕开机' : '系统启动中'}</span>
        </div>
      </section>

      <BootOverlay active={phase === 'booting'} />

      {phase === 'desktop' && <RetroDesktop onExit={exitDesktop} />}
    </main>
  );
}