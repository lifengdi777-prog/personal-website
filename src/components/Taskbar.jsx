import { Monitor, Power, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Taskbar({ windows, activeWindow, onToggleStart, startOpen, onRestore, onExit }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {startOpen && (
        <div className="start-menu">
          <div className="start-menu__rail">PORTFOLIO OS</div>
          <div className="start-menu__items">
            <button type="button" onClick={() => onRestore('about')}>
              <Monitor size={18} /> About System
            </button>
            <button type="button" onClick={() => onRestore('projects')}>
              <RotateCcw size={18} /> Project Files
            </button>
            <button type="button" onClick={onExit}>
              <Power size={18} /> Shut Down
            </button>
          </div>
        </div>
      )}

      <footer className="taskbar">
        <button className="taskbar__start" type="button" onClick={onToggleStart} aria-pressed={startOpen}>
          <Monitor size={18} /> Start
        </button>
        <div className="taskbar__apps">
          {windows.map((windowItem) => (
            <button
              key={windowItem.id}
              className={windowItem.id === activeWindow ? 'is-active' : ''}
              type="button"
              onClick={() => onRestore(windowItem.id)}
            >
              {windowItem.title}
            </button>
          ))}
        </div>
        <time className="taskbar__clock" dateTime={time.toISOString()}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </footer>
    </>
  );
}